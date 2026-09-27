import { AVAILABLE_CURRENCIES, STALE_TIMEOUT_MS } from '../../../entities/currency/index.ts'
import type { IMarketSnapshot } from '../../../entities/currency/index.ts'
import { NON_NEGATIVE_DECIMAL_INPUT_PATTERN } from '../../../shared/config/constants.ts'
import type { ITargetAlert } from '../types/index.ts'

const MAX_TARGET_ALERTS = 20

function isSupportedSymbol(value: unknown): value is string {
  return typeof value === 'string' && AVAILABLE_CURRENCIES.some(({ symbol }) => symbol === value)
}

function isValidTargetPrice(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= Number.MAX_SAFE_INTEGER
  )
}

function isValidAlertDirection(value: unknown): value is ITargetAlert['direction'] {
  return value === 'above' || value === 'below'
}

function isStoredTargetAlert(item: unknown): item is ITargetAlert {
  if (!item || typeof item !== 'object') return false
  const alert = item as Record<string, unknown>

  if (typeof alert.id !== 'string') return false
  if (!isSupportedSymbol(alert.symbol) || !isValidTargetPrice(alert.target)) return false
  if (!isValidAlertDirection(alert.direction)) return false

  if (alert.triggerCount !== undefined) {
    const count = alert.triggerCount
    if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) return false
  }

  if (alert.triggeredPrice !== undefined) {
    const price = alert.triggeredPrice
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return false
  }

  return true
}

export function parseTarget(value: string): number | null {
  if (!NON_NEGATIVE_DECIMAL_INPUT_PATTERN.test(value.trim())) return null
  const number = Number(value)
  return isValidTargetPrice(number) ? number : null
}

export function createTargetAlerts(
  saved: unknown = [],
  persist: (alerts: readonly ITargetAlert[]) => void = () => {},
) {
  const listeners = new Set<() => void>()
  let alerts: readonly ITargetAlert[] = Array.isArray(saved)
    ? saved
        .filter(isStoredTargetAlert)
        .filter((alert, index, all) => all.findIndex((item) => item.id === alert.id) === index)
        .slice(0, MAX_TARGET_ALERTS)
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
      if (alerts.length >= MAX_TARGET_ALERTS || alerts.some((item) => item.id === alert.id)) return
      if (!isSupportedSymbol(alert.symbol) || !isValidTargetPrice(alert.target)) return
      if (!isValidAlertDirection(alert.direction)) return
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
