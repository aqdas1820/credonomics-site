'use client'

import React from 'react'
import AuthForm from '../auth/AuthForm'
import { X } from 'lucide-react'

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--card-border, #e2e8f0)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', textAlign: 'center', color: 'var(--text-primary)' }}>Sign in to continue</h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Create an account to save watchlists, set price alerts, and unlock personalized insights.
        </p>

        <AuthForm view="signup" onComplete={onClose} />
      </div>
    </div>
  )
}
