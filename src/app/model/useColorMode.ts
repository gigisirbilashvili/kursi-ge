import { useEffect, useState } from 'react'

function readMode(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('kursi-color-mode')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useColorMode() {
  const [mode, setMode] = useState(readMode)
  useEffect(() => {
    document.documentElement.dataset.theme = mode
    try {
      localStorage.setItem('kursi-color-mode', mode)
    } catch {
      return
    }
  }, [mode])
  return { mode, toggleMode: () => setMode((current) => (current === 'light' ? 'dark' : 'light')) }
}
