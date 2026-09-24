import { useEffect, useState } from 'react'

import { AVAILABLE_CURRENCIES, CURRENCIES } from '../../../entities/currency'

const STORAGE_KEY = 'kursi-selected-pairs-v1'

function readSymbols(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(saved)) {
      const selected = AVAILABLE_CURRENCIES.filter(({ symbol }) => saved.includes(symbol)).map(
        ({ symbol }) => symbol,
      )
      if (selected.length) return selected
    }
  } catch {
    return CURRENCIES.map(({ symbol }) => symbol)
  }
  return CURRENCIES.map(({ symbol }) => symbol)
}

export function useSelectedPairs() {
  const [symbols, setSymbols] = useState(readSymbols)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols))
    } catch {
      return
    }
  }, [symbols])

  const addPair = (symbol: string) => {
    if (!AVAILABLE_CURRENCIES.some((currency) => currency.symbol === symbol)) return
    setSymbols((current) => (current.includes(symbol) ? current : [...current, symbol]))
  }
  const removePair = (symbol: string) =>
    setSymbols((current) =>
      current.length > 1 ? current.filter((item) => item !== symbol) : current,
    )
  const currencies = AVAILABLE_CURRENCIES.filter(({ symbol }) => symbols.includes(symbol))

  return { symbols, currencies, addPair, removePair }
}
