import { randomUUID } from 'node:crypto'
import { personalActor } from '../../../src/lib/billing/personal-access'
import { applyTestCommand, commandSchema } from '../../../src/lib/billing/personal-model'
import { openLedger, sealLedger, privateHeaders, personalReady, personalOriginAllowed } from '../../../src/lib/billing/personal-security'
import { personalPdf } from '../../../src/lib/billing/personal-pdf'
import { readBoundedJsonBody } from '../../billing/bounded-json-body'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const input = z.object({ blob: z.string().max(240_000).optional(), command: commandSchema }).strict()
export async function POST(request: Request) {
  const fail = (status: number, error: string) => Response.json({ error }, { status, headers: privateHeaders })
  if (!personalReady()) return fail(404,'Not found')
  const owner = await personalActor()
  if (!owner) return fail(403,'Owner authorization required')
  if (!personalOriginAllowed(request)) return fail(403,'Origin rejected')
  if (!request.headers.get('content-type')?.startsWith('application/json')) return fail(415,'JSON required')
  const body = await readBoundedJsonBody(request,260_000)
  if (!body.ok) return fail(body.reason === 'too-large' ? 413 : 400,'Invalid request')
  try {
    const { blob, command } = input.parse(JSON.parse(body.text))
    const ledger = openLedger(blob,owner)
    if (command.action === 'pdf') {
      const record = ledger.records.find(x=>x.id===command.id)
      if (!record) return fail(404,'TEST record not found')
      return new Response(new Uint8Array(await personalPdf(record)), { headers: { ...privateHeaders, 'Content-Type':'application/pdf',
        'Content-Disposition':`attachment; filename="${record.number}-TEST.pdf"`, 'Content-Security-Policy':"default-src 'none'; sandbox" } })
    }
    const next = applyTestCommand(ledger,command,randomUUID(),new Date().toISOString())
    const sealed = command.action === 'read' && blob ? blob : sealLedger(next)
    if (sealed.length > 240_000) return fail(409,'TEST workspace is full')
    return Response.json({ ledger:next, blob:sealed }, { headers:privateHeaders })
  } catch { return fail(400,'TEST workspace unavailable or invalid input. Check fields; preserve encrypted history before resetting.') }
}
