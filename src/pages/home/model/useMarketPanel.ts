import { useEffect, useState } from 'react'

import type { ICurrency, IMarketSnapshot } from '../../../entities/currency'
import { selectCurrencies, useMarketPreferences } from '../../../features/market-preferences'
import type { TMarketFilter, TSortDirection, TSortField } from '../../../features/market-preferences'
import { getMarketPanelStatus } from '../lib/getMarketPanelStatus'

export function useMarketPanel(currencies: readonly ICurrency[], snapshot: IMarketSnapshot) {
  const [now, setNow] = useState(Date.now)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TMarketFilter>('all')
  const [sortField, setSortField] = useState<TSortField>('name')
  const [sortDirection, setSortDirection] = useState<TSortDirection>('asc')
  const [isShowingHidden, setIsShowingHidden] = useState(false)
  const { preferences, toggleFavorite, hide, restore } = useMarketPreferences()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const visibleCurrencies = selectCurrencies(
    currencies, snapshot, preferences, search, filter, sortField, sortDirection,
  )
  const hiddenCurrencies = currencies.filter(({ symbol }) => preferences.hidden.includes(symbol))
  const status = getMarketPanelStatus(snapshot, now)

  return {
    status,
    controls: {
      search, setSearch, filter, setFilter, sortField, setSortField,
      sortDirection, setSortDirection, isShowingHidden, setIsShowingHidden,
      hiddenCurrencies, restore,
    },
    rows: {
      visibleCurrencies, snapshot, favorites: preferences.favorites,
      isQuoteStale: status.isQuoteStale, toggleFavorite, hide,
    },
  }
}
