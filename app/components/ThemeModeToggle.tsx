'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from './theme-mode-toggle.module.css'

type ThemeMode = 'light' | 'dark'

type Props = {
  compact?: boolean
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme

  try {
    window.localStorage.setItem('credonomics-theme', theme)
  } catch {}
}

export default function ThemeModeToggle({ compact = false }: Props) {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let initial: ThemeMode = 'dark'

    try {
      const stored = window.localStorage.getItem('credonomics-theme')
      if (stored === 'light' || stored === 'dark') {
        initial = stored
      } else if (document.documentElement.dataset.theme === 'light') {
        initial = 'light'
      }
    } catch {}

    setTheme(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const choose = (next: ThemeMode) => {
    setTheme(next)
    applyTheme(next)
  }

  return (
    <button
      type="button"
      className={`${styles.selector} ${compact ? styles.compact : ''}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      aria-pressed={theme === 'dark'}
      data-mounted={mounted ? 'true' : 'false'}
      onClick={() => choose(theme === 'dark' ? 'light' : 'dark')}
      title={`Use ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
      {!compact ? <span>{theme === 'dark' ? 'Dark' : 'Light'}</span> : null}
    </button>
  )
}
