'use client'

import React, { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../src/lib/supabase/browser'
import { safeRedirectPath } from '../../src/lib/auth-redirect'
import { assertBrowserAuthAllowed } from '../../src/lib/supabase/auth-safety'

export default function AuthForm({ view = 'login', onComplete, next = '/account', initialError = '' }: { view?: 'login' | 'signup', onComplete?: () => void, next?: string, initialError?: string }) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState(initialError)
  const [isLogin, setIsLogin] = useState(view === 'login')
  
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const handleGoogleSignIn = async () => {
    if (status === 'loading') return
    if (!supabase) {
      setStatus('error')
      setMessage('Authentication is currently unavailable.')
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      await assertBrowserAuthAllowed()
      const callback = new URL('/auth/callback', window.location.origin)
      callback.searchParams.set('next', safeRedirectPath(next))
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callback.toString() },
      })
      if (error) throw error
    } catch {
      setStatus('error')
      setMessage('Unable to start Google sign-in. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setStatus('error')
      setMessage('Authentication is currently unavailable.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      await assertBrowserAuthAllowed()
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
        })
        if (error) throw error
      }
      
      setStatus('success')
      setMessage(isLogin ? 'Logged in successfully!' : 'Check your email for the confirmation link.')
      if (isLogin) {
        if (onComplete) onComplete()
        else router.replace(next)
        router.refresh()
      }
    } catch (err: unknown) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
    }
  }

  return (
    <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={status === 'loading'}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontWeight: 600, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
        >
          Continue with Google
        </button>
        <div>
          <label htmlFor={`${id}-email`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Email Address</label>
          <input
            type="email"
            id={`${id}-email`}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label htmlFor={`${id}-password`} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Password</label>
          <input
            type="password"
            id={`${id}-password`}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={isLogin ? undefined : 8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === 'loading'}
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={status === 'loading'}
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--brand-color, #0284c7)',
            color: 'white',
            fontWeight: 600,
            fontSize: '15px',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1
          }}
        >
          {status === 'loading' ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>

        {message && (
          <p role="status" style={{ marginTop: '8px', fontSize: '14px', color: status === 'success' ? 'var(--up-color)' : 'var(--down-color)', textAlign: 'center' }}>
            {message}
          </p>
        )}

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--brand-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </form>
    </div>
  )
}
