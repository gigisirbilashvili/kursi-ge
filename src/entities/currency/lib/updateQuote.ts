import type { ICurrencyQuote, IMarketTick } from '../types/index.ts'

export function updateQuote(
  previous: ICurrencyQuote | undefined,
  tick: IMarketTick,
  receivedAt: number,
): ICurrencyQuote {
  const initialPrice = previous?.initialPrice ?? tick.price
  const previousPrice = previous?.price ?? tick.price
  return {
    initialPrice,
    previousPrice,
    price: tick.price,
    direction:
      tick.price > previousPrice ? 'up' : tick.price < previousPrice ? 'down' : 'unchanged',
    percentageChange: ((tick.price - initialPrice) / initialPrice) * 100,
    eventTime: tick.eventTime,
    receivedAt,
  }
}
