import { useMarketQuote } from '../../../entities/currency'
import { createSessionChangeView } from '../lib/createSessionChangeView'

export function useSessionChangeModel(symbol: string) {
  const quote = useMarketQuote(symbol)
  return createSessionChangeView(quote)
}
