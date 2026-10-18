import 'server-only'
import type { NextRequest } from 'next/server'
import { authenticatedUser } from '../supabase/server'
import { createSupabaseAdminClient } from '../supabase/admin'
import { isBillingAdmin } from '../../../app/billing/admin-policy'
import { sameOrigin } from '../../../app/billing/request-policy'
import { billingDatabaseScopeReady } from '../../../app/billing/db-scope'
import { documentId, documentKind, parseDocumentSnapshot } from './document-snapshot'
import { archivedDocument } from './document-archive'
import { renderDocumentPdf } from './document-pdf'
import { privateDocumentStore } from './document-storage'

const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }
const fail = (status: number) => Response.json({ error: 'Document unavailable' }, { status, headers })

export async function handleArchivedDocument(request: NextRequest, params: { id: string; kind: string }) {
  if (process.env.BILLING_API_ENABLED !== 'true' || process.env.BILLING_PDF_ARCHIVE_ENABLED !== 'true' || !billingDatabaseScopeReady()) return fail(404)
  const id = documentId.safeParse(params.id); const kind = documentKind.safeParse(params.kind)
  if (!id.success || !kind.success) return fail(404)
  if (request.method !== 'GET' && request.method !== 'POST') return fail(405)
  if (request.method === 'POST' && !sameOrigin(request.headers.get('origin'), request.nextUrl.origin)) return fail(403)
  try {
    const { user } = await authenticatedUser()
    if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) return fail(403)
    const client = createSupabaseAdminClient()
    if (!client) return fail(503)
    const { data, error } = await client.rpc(kind.data === 'invoice' ? 'billing_get_invoice' : 'billing_get_receipt', { p_invoice_id: id.data })
    if (error || !data) return fail(404)
    const snapshot = parseDocumentSnapshot(kind.data, data, id.data)
    const store = await privateDocumentStore(client)
    const result = await archivedDocument(store, snapshot, request.method === 'POST' ? renderDocumentPdf : undefined)
    return new Response(new Uint8Array(result.pdf), { status: 200, headers: { ...headers, 'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${snapshot.data.invoiceNumber}-${kind.data}-v1.pdf"`,
      'Content-Length': String(result.pdf.length), 'X-Document-SHA256': result.sha256 } })
  } catch { return fail(503) } // no object paths, RPC/provider errors or PII in logs/responses
}
