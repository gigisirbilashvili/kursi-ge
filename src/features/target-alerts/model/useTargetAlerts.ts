import { useEffect, useState, useSyncExternalStore } from 'react'

import type { IMarketSnapshot } from '../../../entities/currency'
import { createTargetAlerts } from '../lib/createTargetAlerts'
import type { ITargetAlert } from '../types'

const STORAGE_KEY = 'kursi-target-alerts-v1'

function createStoredAlerts() {
  let saved: unknown = []
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    saved = []
  }
  return createTargetAlerts(saved, (alerts) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
    } catch {
      return
    }
  })
}

export function useTargetAlerts(market: IMarketSnapshot) {
  const [store] = useState(createStoredAlerts)
  const alerts = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  useEffect(() => {
    store.update(market, Date.now())
  }, [store, market])

  const add = (alert: ITargetAlert) => {
    store.add(alert)
    store.update(market, Date.now())
  }
  const rearm = (id: string) => {
    store.rearm(id)
    store.update(market, Date.now())
  }
  return { alerts, add, rearm, remove: store.remove }
}
