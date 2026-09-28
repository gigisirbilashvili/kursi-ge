import type { ICurrency } from '../../../entities/currency'
export interface IMarketRowsProps {
  visibleCurrencies: readonly ICurrency[]
  favorites: readonly string[]
  toggleFavorite: (symbol: string) => void
  hide: (symbol: string) => void
}
