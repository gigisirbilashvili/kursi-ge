import { useEffect, useState, useSyncExternalStore } from 'react'

import { createAlertTracker } from '../lib/createAlertTracker.ts'
import { useMarketFeed } from '../../../entities/currency'

export function useSignificantAlerts() {
  const feed = useMarketFeed()
  const [tracker] = useState(createAlertTracker)
  const alerts = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  useEffect(() => {
    const update = () => tracker.update(feed.getSnapshot())
    const unsubscribe = feed.subscribe(update)
    update()
    return unsubscribe
  }, [tracker, feed])
  return { alerts, dismiss: tracker.dismiss }
}
