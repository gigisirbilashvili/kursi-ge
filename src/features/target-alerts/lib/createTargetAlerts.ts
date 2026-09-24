import { AVAILABLE_CURRENCIES, STALE_TIMEOUT_MS } from '../../../entities/currency/index.ts'
import type { IMarketSnapshot } from '../../../entities/currency/index.ts'
import type { ITargetAlert } from '../types/index.ts'

export function parseTarget(value: string): number | null {
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim())) return null
  const number = Number(value)
  return Number.isFinite(number) && number > 0 && number <= Number.MAX_SAFE_INTEGER ? number : null
}

export function createTargetAlerts(
  saved: unknown = [],
  persist: (alerts: readonly ITargetAlert[]) => void = () => {},
) {
  const listeners = new Set<() => void>()
  let alerts: readonly ITargetAlert[] = Array.isArray(saved)
    ? saved
        .filter((item: unknown): item is ITargetAlert => {
          if (!item || typeof item !== 'object') return false
          const alert = item as Record<string, unknown>
          return (
            typeof alert.id === 'string' &&
            typeof alert.symbol === 'string' &&
            AVAILABLE_CURRENCIES.some(({ symbol }) => symbol === alert.symbol) &&
            typeof alert.target === 'number' &&
            Number.isFinite(alert.target) &&
            alert.target > 0 &&
            alert.target <= Number.MAX_SAFE_INTEGER &&
            (alert.direction === 'above' || alert.direction === 'below') &&
            (alert.triggerCount === undefined ||
              (typeof alert.triggerCount === 'number' &&
                Number.isSafeInteger(alert.triggerCount) &&
                alert.triggerCount >= 0)) &&
            (alert.triggeredPrice === undefined ||
              (typeof alert.triggeredPrice === 'number' &&
                Number.isFinite(alert.triggeredPrice) &&
                alert.triggeredPrice > 0))
          )
        })
        .filter((alert, index, all) => all.findIndex((item) => item.id === alert.id) === index)
        .slice(0, 20)
    : []

  const publish = (next: readonly ITargetAlert[]) => {
    alerts = next
    persist(alerts)
    listeners.forEach((listener) => listener())
  }

  return {
    getSnapshot: () => alerts,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    add(alert: ITargetAlert) {
      if (
        alerts.length >= 20 ||
        alerts.some((item) => item.id === alert.id) ||
        !AVAILABLE_CURRENCIES.some(({ symbol }) => symbol === alert.symbol) ||
        !Number.isFinite(alert.target) ||
        alert.target <= 0 ||
        alert.target > Number.MAX_SAFE_INTEGER ||
        (alert.direction !== 'above' && alert.direction !== 'below')
      )
        return
      publish([...alerts, alert])
    },
    remove(id: string) {
      publish(alerts.filter((alert) => alert.id !== id))
    },
    rearm(id: string) {
      publish(
        alerts.map((alert) => (alert.id === id ? { ...alert, triggeredPrice: undefined } : alert)),
      )
    },
    update(market: IMarketSnapshot, now: number) {
      if (market.status !== 'connected') return
      let hasChanges = false
      const next = alerts.map((alert) => {
        const quote = market.quotes[alert.symbol]
        if (
          alert.triggeredPrice !== undefined ||
          !quote ||
          now - quote.receivedAt >= STALE_TIMEOUT_MS
        )
          return alert
        if (
          alert.direction === 'above' ? quote.price >= alert.target : quote.price <= alert.target
        ) {
          hasChanges = true
          return {
            ...alert,
            triggeredPrice: quote.price,
            triggerCount: (alert.triggerCount ?? 0) + 1,
          }
        }
        return alert
      })
      if (hasChanges) publish(next)
    },
  }
}
