import type { ICurrencyQuote } from '../../../../../entities/currency'

export interface IMarketPriceProps {
  quote: ICurrencyQuote | undefined
  isStale: boolean
}
