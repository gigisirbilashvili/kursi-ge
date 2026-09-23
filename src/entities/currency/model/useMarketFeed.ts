import { useEffect, useState, useSyncExternalStore } from 'react'

import { createMarketFeed } from './createMarketFeed.ts'

export function useMarketFeed() {
  const [feed] = useState(createMarketFeed)
  const snapshot = useSyncExternalStore(feed.subscribe, feed.getSnapshot, feed.getSnapshot)

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
