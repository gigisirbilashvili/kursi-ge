import { useEffect, useState, useSyncExternalStore } from 'react'

import type { ISignificantAlert } from '../../../features/significant-alerts'
import type { ITargetAlert } from '../../../features/target-alerts'
import { createPriceToastQueue } from '../lib/createPriceToastQueue'

export function usePriceToasts(
  sessionAlerts: readonly ISignificantAlert[],
  targetAlerts: readonly ITargetAlert[],
) {
  const [queue] = useState(() => createPriceToastQueue(targetAlerts))
  const toasts = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot)

  useEffect(() => {
    queue.update(sessionAlerts, targetAlerts)
  }, [queue, sessionAlerts, targetAlerts])

  return { toasts, dismiss: queue.dismiss }
}
