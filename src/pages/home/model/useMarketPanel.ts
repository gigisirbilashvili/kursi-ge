import { useState } from 'react'

import { selectCurrencies, useMarketPreferences } from '../../../features/market-preferences'
import type { TMarketFilter, TSortDirection, TSortField } from '../../../features/market-preferences'
import { useMarketValue } from '../../../entities/currency'
import type { IMarketToolbarProps } from '../ui/MarketToolbar/types'
import type { IMarketPanelProps } from '../ui/MarketPanel/types'
import { createMarketAlertViews } from '../lib/createMarketAlertViews'

const EMPTY_QUOTES = {}

export function useMarketPanel({ currencies, alerts, onDismissAlert }: IMarketPanelProps) {
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

  const controls: IMarketToolbarProps = {
    search, hasSearch: search.length > 0, onSearchChange: setSearch, onClearSearch: () => setSearch(''),
    filter, onFilterChange: (value) => { if (value === 'all' || value === 'favorites') setFilter(value) },
    sortField, onSortFieldChange: (value) => { if (value === 'name' || value === 'price' || value === 'change') setSortField(value) },
    sortOptions: [{ value: 'name', label: 'Name' }, { value: 'price', label: 'Current price' }, { value: 'change', label: 'Price change' }],
    sortLabel: `Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`, isDescending: sortDirection === 'desc',
    onToggleSort: () => setSortDirection((value) => value === 'asc' ? 'desc' : 'asc'),
    isShowingHidden, onToggleHidden: () => setIsShowingHidden((isCurrentlyShowing) => !isCurrentlyShowing),
    hiddenLabel: `Hidden (${hiddenCurrencies.length})`, hasHiddenItems: hiddenCurrencies.length > 0,
    hiddenItems: hiddenCurrencies.map(({ symbol, ticker, name }) => ({ id: symbol, label: `Restore ${ticker}`, ariaLabel: `Restore ${name}`, onRestore: () => restore(symbol) })),
  }
  return {
    alerts: createMarketAlertViews(alerts, onDismissAlert),
    hasAlerts: alerts.length > 0,
    hasRows: visibleCurrencies.length > 0,
    controls, visibleCount: currencies.length - hiddenCurrencies.length,
    rows: visibleCurrencies.map(({ symbol, ticker, name, badgeTone }) => {
      const isFavorite = preferences.favorites.includes(symbol)
      return {
        id: symbol, symbol, label: `${name}, ${ticker}/USDT`,
        info: { name, ticker, pairText: `${ticker}/USDT`, badgeBackground: `${badgeTone}.main`, badgeColor: `${badgeTone}.contrastText` },
        actions: {
          isFavorite, favoriteTitle: isFavorite ? 'Remove from favorites' : 'Add to favorites',
          favoriteLabel: `${isFavorite ? 'Remove' : 'Add'} ${name} ${isFavorite ? 'from' : 'to'} favorites`,
          hideLabel: `Hide ${name}`, onToggleFavorite: () => toggleFavorite(symbol), onHide: () => hide(symbol),
        },
      }
    }),
  }
}
