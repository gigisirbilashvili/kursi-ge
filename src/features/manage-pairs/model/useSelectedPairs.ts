import { useRef } from 'react'

import { AVAILABLE_CURRENCIES } from '../../../entities/currency'
import { notify } from '../../../shared/lib/notify'
import { useStoredState } from '../../../shared/lib/useStoredState'
import { addSelectedPair, readSelectedSymbols, removeSelectedPair } from '../lib/selectedPairs'

const STORAGE_KEY = 'kursi-selected-pairs-v1'
const PAIR_CHANGE_TOAST_ID = 'pair-change'

export function useSelectedPairs() {
  const [symbols, setSymbols] = useStoredState(STORAGE_KEY, readSelectedSymbols)
  const symbolsRef = useRef(symbols)

  const addPair = (symbol: string) => {
    const result = addSelectedPair(symbolsRef.current, symbol)
    if (result.status === 'unsupported') {
      notify.error('This currency pair is not supported.', { toastId: 'pair-unsupported' })
      return
    }
    if (result.status === 'duplicate') {
      notify.info('This currency pair is already tracked.', { toastId: 'pair-already-tracked' })
      return
    }
    symbolsRef.current = result.symbols
    setSymbols(result.symbols)
    notify.success(`${result.ticker}/USDT added.`, { toastId: PAIR_CHANGE_TOAST_ID })
  }
  const removePair = (symbol: string) => {
    const result = removeSelectedPair(symbolsRef.current, symbol)
    if (result.status === 'absent') return
    if (result.status === 'last-pair') {
      notify.error('Keep at least one currency pair tracked.', { toastId: 'pair-last' })
      return
    }
    symbolsRef.current = result.symbols
    setSymbols(result.symbols)
    notify.success(`${result.ticker}/USDT removed.`, { toastId: PAIR_CHANGE_TOAST_ID })
  }
  const currencies = AVAILABLE_CURRENCIES.filter(({ symbol }) => symbols.includes(symbol))

  return { symbols, currencies, addPair, removePair }
}
