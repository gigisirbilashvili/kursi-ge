import { useState } from 'react'

import type { ICurrency } from '../../../entities/currency'
import { selectCurrencies, useMarketPreferences } from '../../../features/market-preferences'
import type { TMarketFilter, TSortDirection, TSortField } from '../../../features/market-preferences'
import { useMarketValue } from '../../../entities/currency'

const EMPTY_QUOTES = {}

export function useMarketPanel(currencies: readonly ICurrency[]) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TMarketFilter>('all')
  const [sortField, setSortField] = useState<TSortField>('name')
  const [sortDirection, setSortDirection] = useState<TSortDirection>('asc')
  const [isShowingHidden, setIsShowingHidden] = useState(false)
  const { preferences, toggleFavorite, hide, restore } = useMarketPreferences()

  const quotes = useMarketValue((snapshot) => sortField === 'name' ? EMPTY_QUOTES : snapshot.quotes)

  const visibleCurrencies = selectCurrencies(
    currencies, { quotes }, preferences, search, filter, sortField, sortDirection,
  )
  const hiddenCurrencies = currencies.filter(({ symbol }) => preferences.hidden.includes(symbol))

  return {
    controls: {
      search, setSearch, filter, setFilter, sortField, setSortField,
      sortDirection, setSortDirection, isShowingHidden, setIsShowingHidden,
      hiddenCurrencies, restore,
    },
    rows: {
      visibleCurrencies, favorites: preferences.favorites,
      toggleFavorite, hide,
    },
  }
}
