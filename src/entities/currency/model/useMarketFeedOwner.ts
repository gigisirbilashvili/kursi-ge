import { useEffect, useState } from 'react'

import type { IMarketFeedOptions } from '../types'
import { createMarketFeed } from './createMarketFeed.ts'

export function useMarketFeedOwner(initialOptions: IMarketFeedOptions, symbols: readonly string[]) {
  const [feed] = useState(() => createMarketFeed(initialOptions))

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

  return feed
}
