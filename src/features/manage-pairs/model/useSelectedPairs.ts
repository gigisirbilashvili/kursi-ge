import { AVAILABLE_CURRENCIES, CURRENCIES } from '../../../entities/currency'
import { notify } from '../../../shared/lib/notify'
import { useStoredState } from '../../../shared/lib/useStoredState'

const STORAGE_KEY = 'kursi-selected-pairs-v1'

function readSymbols(value: string | null): string[] {
  const saved: unknown = JSON.parse(value ?? 'null')
  if (Array.isArray(saved)) {
    const selected = AVAILABLE_CURRENCIES.filter(({ symbol }) => saved.includes(symbol)).map(
      ({ symbol }) => symbol,
    )
    if (selected.length) return selected
  }
  return CURRENCIES.map(({ symbol }) => symbol)
}

export function useSelectedPairs() {
  const [symbols, setSymbols] = useStoredState(STORAGE_KEY, readSymbols)

  const addPair = (symbol: string) => {
    if (!AVAILABLE_CURRENCIES.some((currency) => currency.symbol === symbol)) {
      notify.error('This currency pair is not supported.')
      return
    }
    if (symbols.includes(symbol)) {
      notify.info('This currency pair is already tracked.')
      return
    }
    setSymbols((current) => (current.includes(symbol) ? current : [...current, symbol]))
    notify.success('Currency pair added.')
  }
  const removePair = (symbol: string) => {
    if (symbols.length <= 1) {
      notify.error('Keep at least one currency pair tracked.')
      return
    }
    if (!symbols.includes(symbol)) return
    setSymbols((current) => current.filter((item) => item !== symbol))
    notify.success('Currency pair removed.')
  }
  const currencies = AVAILABLE_CURRENCIES.filter(({ symbol }) => symbols.includes(symbol))

  return { symbols, currencies, addPair, removePair }
}
