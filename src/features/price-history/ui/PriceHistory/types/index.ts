import type { ICurrency, IMarketSnapshot } from '../../../../../entities/currency'

export interface IPriceHistoryProps {
  currencies: readonly ICurrency[]
  market: IMarketSnapshot
}
