import { useEffect, useState, useSyncExternalStore } from 'react'

import type { IMarketFeedOptions } from '../types'
import { createMarketFeed } from './createMarketFeed.ts'
import { useMarketNotifications } from './useMarketNotifications'

export function useMarketFeed(
  symbols: readonly string[],
  streamEndpoint: string,
  dependencies: Omit<IMarketFeedOptions, 'symbols' | 'streamEndpoint'> = {},
) {
  const [feed] = useState(() => createMarketFeed({ ...dependencies, symbols, streamEndpoint }))
  const snapshot = useSyncExternalStore(feed.subscribe, feed.getSnapshot, feed.getSnapshot)
  useMarketNotifications(snapshot)

  useEffect(() => {
    feed.setSymbols(symbols)
  }, [feed, symbols])

  useEffect(() => {
    const handleOnline = () => feed.setOnline(true)
    const handleOffline = () => feed.setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    feed.start(navigator.onLine)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      feed.stop()
    }
  }, [feed])

  return { snapshot, retry: feed.retry }
}
