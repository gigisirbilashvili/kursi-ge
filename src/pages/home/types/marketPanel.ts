import type { ICurrency, IMarketSnapshot } from '../../../entities/currency'
export interface IMarketRowsProps {
  visibleCurrencies: readonly ICurrency[]
  snapshot: IMarketSnapshot
  favorites: readonly string[]
  isQuoteStale: (symbol: string) => boolean
  toggleFavorite: (symbol: string) => void
  hide: (symbol: string) => void
}
