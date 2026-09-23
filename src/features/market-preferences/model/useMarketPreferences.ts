import { useEffect, useState } from 'react'

import { CURRENCIES } from '../../../entities/currency/index.ts'
import { normalizePreferences } from '../lib/preferences.ts'
import type { IMarketPreferences } from '../types/index.ts'

const STORAGE_KEY = 'kursi-market-preferences-v1'
const VALID_SYMBOLS = new Set(CURRENCIES.map(({ symbol }) => symbol))

function readPreferences(): IMarketPreferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return normalizePreferences(saved ? JSON.parse(saved) : null, VALID_SYMBOLS)
  } catch {
    return { favorites: [], hidden: [] }
  }
}

export function useMarketPreferences() {
  const [preferences, setPreferences] = useState(readPreferences)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)) } catch { return }
  }, [preferences])
  const toggleFavorite = (symbol: string) => {
    if (!VALID_SYMBOLS.has(symbol)) return
    setPreferences((current) => ({ ...current, favorites: current.favorites.includes(symbol) ? current.favorites.filter((item) => item !== symbol) : [...current.favorites, symbol] }))
  }
  const hide = (symbol: string) => {
    if (!VALID_SYMBOLS.has(symbol)) return
    setPreferences((current) => ({ ...current, hidden: current.hidden.includes(symbol) ? current.hidden : [...current.hidden, symbol] }))
  }
  const restore = (symbol: string) => setPreferences((current) => ({ ...current, hidden: current.hidden.filter((item) => item !== symbol) }))
  return { preferences, toggleFavorite, hide, restore }
}
