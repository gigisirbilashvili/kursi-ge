import type { ICurrency } from '../../../../../entities/currency'
export interface IMarketCurrencyActionsProps {
  currency: ICurrency
  isFavorite: boolean
  toggleFavorite: (symbol: string) => void
  hide: (symbol: string) => void
}
