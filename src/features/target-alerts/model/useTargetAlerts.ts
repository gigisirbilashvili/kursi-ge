import { useEffect, useState, useSyncExternalStore } from 'react'

import { useMarketFeed } from '../../../entities/currency'
import { notify } from '../../../shared/lib/notify'
import { readStorage, reportStorageError, writeStorage } from '../../../shared/lib/storage'
import { createTargetAlerts } from '../lib/createTargetAlerts'
import type { ITargetAlert } from '../types'

const STORAGE_KEY = 'kursi-target-alerts-v1'

function createStoredAlerts() {
  const stored = readStorage(STORAGE_KEY)
  let saved: unknown = []
  let hasInvalidData = false
  try {
    saved = JSON.parse(stored.value ?? '[]')
  } catch {
    hasInvalidData = true
  }
  const store = createTargetAlerts(saved, (alerts) => {
    writeStorage(STORAGE_KEY, JSON.stringify(alerts))
  })
  return { store, hasStorageError: stored.hasError, hasInvalidData }
}

export function useTargetAlerts() {
  const feed = useMarketFeed()
  const [{ store, hasStorageError, hasInvalidData }] = useState(createStoredAlerts)
  const alerts = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  useEffect(() => {
    if (hasStorageError) reportStorageError()
    if (hasInvalidData) notify.warning('Saved price alerts could not be read. Please create them again.', { toastId: 'target-storage-invalid' })
  }, [hasStorageError, hasInvalidData])
  useEffect(() => {
    const update = () => store.update(feed.getSnapshot(), Date.now())
    const unsubscribe = feed.subscribe(update)
    update()
    return unsubscribe
  }, [store, feed])

  const add = (alert: ITargetAlert) => {
    const previous = store.getSnapshot()
    store.add(alert)
    if (store.getSnapshot() === previous) {
      notify.error('Unable to create this alert. Check the currency, target price, and 20-alert limit.')
      return
    }
    notify.success('Price alert created.', { toastId: 'target-alert-management' })
    store.update(feed.getSnapshot(), Date.now())
  }
  const rearm = (id: string) => {
    if (!store.getSnapshot().some((alert) => alert.id === id)) return
    store.rearm(id)
    notify.success('Price alert rearmed.', { toastId: 'target-alert-management' })
    store.update(feed.getSnapshot(), Date.now())
  }
  const remove = (id: string) => {
    if (!store.getSnapshot().some((alert) => alert.id === id)) return
    store.remove(id)
    notify.success('Price alert removed.', { toastId: 'target-alert-management' })
  }
  return { alerts, add, rearm, remove }
}
