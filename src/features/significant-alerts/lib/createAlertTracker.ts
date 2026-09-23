import type { IMarketSnapshot } from '../../../entities/currency/index.ts'
import type { IAlertTracker, ISignificantAlert, TAlertZone } from '../types/index.ts'

export function createAlertTracker(): IAlertTracker {
  const listeners = new Set<() => void>()
  const zones = new Map<string, TAlertZone>()
  const lastEvents = new Map<string, number>()
  let alerts: readonly ISignificantAlert[] = []
  let nextId = 1
  const publish = (next: readonly ISignificantAlert[]) => {
    alerts = next
    listeners.forEach((listener) => listener())
  }
  return {
    getSnapshot: () => alerts,
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    update(snapshot: IMarketSnapshot) {
      if (snapshot.status !== 'connected') return
      const additions: ISignificantAlert[] = []
      for (const [symbol, quote] of Object.entries(snapshot.quotes)) {
        if (lastEvents.get(symbol) === quote.eventTime) continue
        lastEvents.set(symbol, quote.eventTime)
        const zone: TAlertZone = quote.percentageChange >= 2 ? 'up' : quote.percentageChange <= -2 ? 'down' : 'inside'
        if (zone !== 'inside' && zones.get(symbol) !== zone) {
          additions.push({ id: nextId++, symbol, initialPrice: quote.initialPrice, currentPrice: quote.price, percentageChange: quote.percentageChange, direction: zone === 'up' ? 'increased' : 'decreased' })
        }
        zones.set(symbol, zone)
      }
      if (additions.length) publish([...additions, ...alerts].slice(0, 10))
    },
    dismiss(id: number) { publish(alerts.filter((alert) => alert.id !== id)) },
  }
}
