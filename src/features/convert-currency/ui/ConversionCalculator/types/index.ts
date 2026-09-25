import type { ICurrency, IMarketSnapshot } from '../../../../../entities/currency'

export interface IConversionCalculatorProps {
  currencies: readonly ICurrency[]
  market: IMarketSnapshot
}
