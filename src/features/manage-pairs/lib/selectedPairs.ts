import { AVAILABLE_CURRENCIES, CURRENCIES } from '../../../entities/currency'

export function readSelectedSymbols(value: string | null): string[] {
  const saved: unknown = JSON.parse(value ?? 'null')
  if (Array.isArray(saved)) {
    const selected = AVAILABLE_CURRENCIES.filter(({ symbol }) => saved.includes(symbol))
      .map(({ symbol }) => symbol)
    if (selected.length) return selected
  }
  return CURRENCIES.map(({ symbol }) => symbol)
}

export function addSelectedPair(current: readonly string[], symbol: string) {
  const currency = AVAILABLE_CURRENCIES.find((item) => item.symbol === symbol)
  if (!currency) return { status: 'unsupported' as const }
  if (current.includes(symbol)) return { status: 'duplicate' as const }
  return { status: 'added' as const, symbols: [...current, symbol], ticker: currency.ticker }
}

export function removeSelectedPair(current: readonly string[], symbol: string) {
  if (!current.includes(symbol)) return { status: 'absent' as const }
  if (current.length <= 1) return { status: 'last-pair' as const }
  return {
    status: 'removed' as const,
    symbols: current.filter((item) => item !== symbol),
    ticker: AVAILABLE_CURRENCIES.find((currency) => currency.symbol === symbol)?.ticker ?? symbol,
  }
}
