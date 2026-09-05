'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../src/lib/supabase/browser'

export default function AuthForm({ view = 'login', onComplete }: { view?: 'login' | 'signup', onComplete?: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isLogin, setIsLogin] = useState(view === 'login')
  
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

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
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
        })
        if (error) throw error
      }
      
      setStatus('success')
      setMessage(isLogin ? 'Logged in successfully!' : 'Check your email for the confirmation link.')
      if (isLogin) {
        if (onComplete) onComplete()
        else router.refresh()
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Authentication failed.')
    }
  }

  return (
    <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Password</label>
          <input
            type="password"
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
          <p style={{ marginTop: '8px', fontSize: '14px', color: status === 'success' ? 'var(--up-color)' : 'var(--down-color)', textAlign: 'center' }}>
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
