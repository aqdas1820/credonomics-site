import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AuthForm from '../auth/AuthForm'
import { authenticatedUser } from '../../src/lib/supabase/server'
import SiteFrame from '../components/SiteFrame'

export const metadata: Metadata = {
  title: 'Sign Up - CredoNomics',
}

export default async function SignupPage() {
  const { user } = await authenticatedUser()
  if (user) {
    redirect('/')
  }

  return (
    <SiteFrame>
      <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-color)' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '40px 32px', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', textAlign: 'center' }}>Create an Account</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
            Join CredoNomics to unlock portfolio intelligence.
          </p>
          <AuthForm view="signup" />
        </div>
      </main>
    </SiteFrame>
  )
}
