import type { ICurrency } from '../../../../../entities/currency'
import type { TMarketFilter, TSortDirection, TSortField } from '../../../../../features/market-preferences'
export interface IMarketToolbarProps {
  search: string
  setSearch: (value: string) => void
  filter: TMarketFilter
  setFilter: (value: TMarketFilter) => void
  sortField: TSortField
  setSortField: (value: TSortField) => void
  sortDirection: TSortDirection
  setSortDirection: (value: TSortDirection) => void
  isShowingHidden: boolean
  setIsShowingHidden: (value: boolean) => void
  hiddenCurrencies: readonly ICurrency[]
  restore: (symbol: string) => void
}
