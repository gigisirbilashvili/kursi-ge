import { useRef } from 'react'

import { AVAILABLE_CURRENCIES, CURRENCIES } from '../../../entities/currency'
import { notify } from '../../../shared/lib/notify'
import { useStoredState } from '../../../shared/lib/useStoredState'

const STORAGE_KEY = 'kursi-selected-pairs-v1'
const PAIR_CHANGE_TOAST_ID = 'pair-change'

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
  const symbolsRef = useRef(symbols)

  const addPair = (symbol: string) => {
    const currency = AVAILABLE_CURRENCIES.find((item) => item.symbol === symbol)
    if (!currency) {
      notify.error('This currency pair is not supported.', { toastId: 'pair-unsupported' })
      return
    }
    const current = symbolsRef.current
    if (current.includes(symbol)) {
      notify.info('This currency pair is already tracked.', { toastId: 'pair-already-tracked' })
      return
    }
    const next = [...current, symbol]
    symbolsRef.current = next
    setSymbols(next)
    notify.successLatest(`${currency.ticker}/USDT added.`, PAIR_CHANGE_TOAST_ID)
  }
  const removePair = (symbol: string) => {
    const current = symbolsRef.current
    if (!current.includes(symbol)) return
    if (current.length <= 1) {
      notify.error('Keep at least one currency pair tracked.', { toastId: 'pair-last' })
      return
    }
    const next = current.filter((item) => item !== symbol)
    symbolsRef.current = next
    setSymbols(next)
    const ticker = AVAILABLE_CURRENCIES.find((currency) => currency.symbol === symbol)?.ticker ?? symbol
    notify.successLatest(`${ticker}/USDT removed.`, PAIR_CHANGE_TOAST_ID)
  }
  const currencies = AVAILABLE_CURRENCIES.filter(({ symbol }) => symbols.includes(symbol))

  return { symbols, currencies, addPair, removePair }
}
