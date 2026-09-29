import { useState } from 'react'

import { AVAILABLE_CURRENCIES } from '../../../entities/currency'
import type { IPairManagerProps } from '../ui/PairManager/types'
import type { IPairManagerViewState } from './types/pairManager'

export function usePairManagerModel({ currencies, onAdd, onRemove }: IPairManagerProps): IPairManagerViewState {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selection, setSelection] = useState('')
  const available = AVAILABLE_CURRENCIES.filter(({ symbol }) => !currencies.some((currency) => currency.symbol === symbol))
  const selected = available.some(({ symbol }) => symbol === selection) ? selection : (available[0]?.symbol ?? '')
  return {
    isExpanded, selected, buttonText: `Manage pairs (${currencies.length})`, hasAvailablePairs: available.length > 0,
    pairs: currencies.map(({ symbol, ticker }) => ({ id: symbol, label: `${ticker}/USDT`, onRemove: currencies.length > 1 ? () => onRemove(symbol) : undefined })),
    options: available.map(({ symbol, name, ticker }) => ({ value: symbol, label: `${name} (${ticker}/USDT)` })),
    onToggle: () => setIsExpanded((isCurrentlyExpanded) => !isCurrentlyExpanded), onSelectionChange: setSelection, onAdd: () => onAdd(selected),
  }
}
