'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '../../src/lib/supabase/browser'
import { fetchJson } from '../../src/lib/client-json'
import { assertBrowserAuthAllowed } from '../../src/lib/supabase/auth-safety'
import styles from '../watchlist/watchlist.module.css'
type Session = { configured: boolean; user: null | { email?: string; displayName: string | null } }
export default function AccountClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    fetchJson<{ data: Session }>('/api/account/session', { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setSession(result.data) })
      .catch(() => { if (!controller.signal.aborted) setError('Unable to load your account. Please try again.') })
    return () => controller.abort()
  }, [attempt])
  const signin = async () => {
    setBusy(true); setError('')
    try {
      await assertBrowserAuthAllowed()
      const client = createSupabaseBrowserClient()
      if (!client) throw new Error()
      const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback?next=/account` } })
      if (error) throw error
    } catch { setError('Unable to start Google sign-in. Please try again.'); setBusy(false) }
  }
  const signout = async () => {
    setBusy(true); setError('')
    try { await fetchJson('/api/account/signout', { method: 'POST' }); location.assign('/') }
    catch { setError('Unable to sign out. Please try again.'); setBusy(false) }
  }
  return <main className={styles.page}>
    <header className={styles.hero}><div><span>CredoNomics account</span><h1>Account</h1><p>Your saved market workspace.</p></div></header>
    {error && <div className={styles.empty} role="alert">{error} <button onClick={() => setAttempt(x => x + 1)}>Retry</button></div>}
    {!session ? !error && <p role="status">Loading account...</p> : !session.configured ? <div className={styles.empty}><h2>Cloud accounts are not configured yet.</h2><p>Your device watchlists remain available.</p></div> : !session.user ? <div className={styles.empty}><h2>Save your workspace across devices.</h2><button className={styles.button} disabled={busy} onClick={signin}>Continue with Google</button></div> : <div className={styles.panel}><h2>{session.user.displayName || session.user.email}</h2><p>{session.user.email}</p><div className={styles.form}><Link className={styles.button} href="/watchlist">Watchlists</Link><Link className={styles.button} href="/alerts">Alerts</Link><button className={styles.button} disabled={busy} onClick={signout}>Sign out</button></div></div>}
  </main>
}
