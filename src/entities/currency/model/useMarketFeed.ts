import { useContext, useSyncExternalStore } from 'react'

import type { IMarketSnapshot, IPricePoint } from '../types'
import { MarketFeedContext } from './marketFeedContext'

const EMPTY_HISTORY: readonly IPricePoint[] = []

export function useMarketFeed() {
  const feed = useContext(MarketFeedContext)
  if (!feed) throw new Error('Market hooks must be used inside MarketFeedProvider.')
  return feed
}

export function useMarketValue<T>(select: (snapshot: IMarketSnapshot) => T) {
  const feed = useMarketFeed()
  const getValue = () => select(feed.getSnapshot())
  return useSyncExternalStore(feed.subscribe, getValue, getValue)
}

export function useMarketStatus() {
  return useMarketValue((snapshot) => snapshot.status)
}

export function useMarketQuote(symbol: string) {
  return useMarketValue((snapshot) => snapshot.quotes[symbol])
}

export function useMarketHistory(symbol: string) {
  return useMarketValue((snapshot) => snapshot.history[symbol] ?? EMPTY_HISTORY)
}
