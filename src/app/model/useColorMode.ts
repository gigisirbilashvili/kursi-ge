import { useEffect } from 'react'

import { useStoredState } from '../../shared/lib/useStoredState'

function readMode(saved: string | null): 'light' | 'dark' {
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useColorMode() {
  const [mode, setMode] = useStoredState('kursi-color-mode', readMode, String)
  useEffect(() => {
    document.documentElement.dataset.theme = mode
  }, [mode])
  return { mode, toggleMode: () => setMode((current) => (current === 'light' ? 'dark' : 'light')) }
}
