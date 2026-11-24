import { useSyncExternalStore } from 'react'
import { injectTokens, type Theme } from '@/tokens'

/** Site theme. Light is the default; a visitor's choice is remembered in this browser. */
const KEY = 'preambl-theme'
const listeners = new Set<() => void>()

function readStored(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

let current: Theme = readStored()

export function getTheme(): Theme {
  return current
}

export function initTheme() {
  injectTokens(current)
  syncThemeColor(current)
}

function syncThemeColor(theme: Theme) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F7F9FD' : '#060C1C')
}

export function setTheme(theme: Theme) {
  current = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode: the choice just won't persist */
  }
  injectTokens(theme)
  syncThemeColor(theme)
  listeners.forEach((fn) => fn())
}

export function toggleTheme() {
  setTheme(current === 'dark' ? 'light' : 'dark')
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    getTheme,
    () => 'light',
  )
}
