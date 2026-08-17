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
    <div
      className={`${styles.selector} ${compact ? styles.compact : ''}`}
      role="group"
      aria-label="Website appearance"
      data-mounted={mounted ? 'true' : 'false'}
    >
      <button
        type="button"
        className={theme === 'light' ? styles.active : undefined}
        aria-pressed={theme === 'light'}
        onClick={() => choose('light')}
        title="Use white mode"
      >
        <Sun size={14} />
        <span>White</span>
      </button>

      <button
        type="button"
        className={theme === 'dark' ? styles.active : undefined}
        aria-pressed={theme === 'dark'}
        onClick={() => choose('dark')}
        title="Use black mode"
      >
        <Moon size={14} />
        <span>Black</span>
      </button>
    </div>
  )
}