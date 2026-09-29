import { useEffect, useState } from 'react'

import { useMarketQuote, useMarketStatus, STALE_TIMEOUT_MS } from '../../../entities/currency'
import { formatPrice } from '../lib/formatPrice'
import type { IMarketPriceViewState } from './types/marketPrice'

export function useMarketPriceModel(symbol: string): IMarketPriceViewState {
  const quote = useMarketQuote(symbol)
  const status = useMarketStatus()
  const [now, setNow] = useState(Date.now)
  const receivedAt = quote?.receivedAt
  useEffect(() => {
    if (receivedAt === undefined) return
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, receivedAt + STALE_TIMEOUT_MS - Date.now()))
    return () => window.clearTimeout(timer)
  }, [receivedAt])
  const isStale = status !== 'connected' || now - (receivedAt ?? 0) >= STALE_TIMEOUT_MS

  const direction = quote?.direction ?? 'unchanged'
  return {
    isWaiting: !quote, isStale, direction,
    color: direction === 'up' ? 'success.main' : direction === 'down' ? 'error.main' : 'text.secondary',
    priceText: quote ? formatPrice(quote.price) : '',
    tickTitle: `Latest tick: ${direction}`, tickText: `Latest tick ${direction}. `,
  }
}
