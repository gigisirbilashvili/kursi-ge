import { useEffect, useState, useSyncExternalStore } from 'react'

import { createAlertTracker } from '../lib/createAlertTracker.ts'
import type { IMarketSnapshot } from '../../../entities/currency/index.ts'

export function useSignificantAlerts(snapshot: IMarketSnapshot) {
  const [tracker] = useState(createAlertTracker)
  const alerts = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  useEffect(() => {
    tracker.update(snapshot)
  }, [tracker, snapshot])
  return { alerts, dismiss: tracker.dismiss }
}
