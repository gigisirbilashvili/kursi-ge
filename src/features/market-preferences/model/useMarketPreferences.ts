import { AVAILABLE_CURRENCIES } from '../../../entities/currency/index.ts'
import { notify } from '../../../shared/lib/notify'
import { useStoredState } from '../../../shared/lib/useStoredState'
import { normalizePreferences } from '../lib/preferences.ts'
import type { IMarketPreferences } from '../types/index.ts'

const STORAGE_KEY = 'kursi-market-preferences-v1'
const VALID_SYMBOLS = new Set(AVAILABLE_CURRENCIES.map(({ symbol }) => symbol))

function readPreferences(saved: string | null): IMarketPreferences {
  return normalizePreferences(saved ? JSON.parse(saved) : null, VALID_SYMBOLS)
}

export function useMarketPreferences() {
  const [preferences, setPreferences] = useStoredState(STORAGE_KEY, readPreferences)
  const toggleFavorite = (symbol: string) => {
    if (!VALID_SYMBOLS.has(symbol)) {
      notify.error('This currency pair is not supported.')
      return
    }
    setPreferences((current) => ({
      ...current,
      favorites: current.favorites.includes(symbol)
        ? current.favorites.filter((item) => item !== symbol)
        : [...current.favorites, symbol],
    }))
  }
  const hide = (symbol: string) => {
    if (!VALID_SYMBOLS.has(symbol)) {
      notify.error('This currency pair is not supported.')
      return
    }
    setPreferences((current) => ({
      ...current,
      hidden: current.hidden.includes(symbol) ? current.hidden : [...current.hidden, symbol],
    }))
    notify.success('Currency hidden from the market list.')
  }
  const restore = (symbol: string) => {
    setPreferences((current) => ({
      ...current,
      hidden: current.hidden.filter((item) => item !== symbol),
    }))
    notify.success('Currency restored to the market list.')
  }
  return { preferences, toggleFavorite, hide, restore }
}
