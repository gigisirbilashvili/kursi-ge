import type { ICurrency, IMarketSnapshot } from '../../../../../entities/currency'

export interface ITargetAlertsProps {
  currencies: readonly ICurrency[]
  market: IMarketSnapshot
}
