import { AVAILABLE_CURRENCIES } from '../../../entities/currency/index.ts'
import { formatSignificantNumber } from '../../../shared/lib/formatSignificantNumber'
import type { IPriceToast, IPriceToastSessionAlert, IPriceToastTargetAlert } from '../types/priceToast.ts'

export function createPriceToastQueue(initialTargets: readonly IPriceToastTargetAlert[]) {
  const listeners = new Set<() => void>()
  const seen = new Set(
    initialTargets
      .filter(({ triggeredPrice }) => triggeredPrice !== undefined)
      .map(({ id, triggerCount }) => `target:${id}:${triggerCount ?? 1}`),
  )
  let toasts: readonly IPriceToast[] = []

  const publish = (next: readonly IPriceToast[]) => {
    toasts = next
    listeners.forEach((listener) => listener())
  }

  return {
    getSnapshot: () => toasts,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    update(sessionAlerts: readonly IPriceToastSessionAlert[], targetAlerts: readonly IPriceToastTargetAlert[]) {
      const next: IPriceToast[] = []
      for (const alert of sessionAlerts) {
        const id = `session:${alert.id}`
        if (seen.has(id)) continue
        seen.add(id)
        const ticker =
          AVAILABLE_CURRENCIES.find(({ symbol }) => symbol === alert.symbol)?.ticker ?? alert.symbol
        next.push({
          id,
          severity: alert.direction === 'increased' ? 'success' : 'warning',
          message: `${ticker}/USDT ${alert.direction} ${Math.abs(alert.percentageChange).toFixed(2)}% from its first session price. Now ${formatSignificantNumber(alert.currentPrice)} USDT.`,
        })
      }
      for (const alert of targetAlerts) {
        if (alert.triggeredPrice === undefined) continue
        const id = `target:${alert.id}:${alert.triggerCount ?? 1}`
        if (seen.has(id)) continue
        seen.add(id)
        const ticker =
          AVAILABLE_CURRENCIES.find(({ symbol }) => symbol === alert.symbol)?.ticker ?? alert.symbol
        next.push({
          id,
          severity: 'success',
          message: `${ticker}/USDT reached your ${alert.direction === 'above' ? 'at or above' : 'at or below'} ${formatSignificantNumber(alert.target)} USDT alert. Price: ${formatSignificantNumber(alert.triggeredPrice)} USDT.`,
        })
      }
      if (next.length) publish([...toasts, ...next])
    },
    dismiss(id: string) {
      publish(toasts.filter((toast) => toast.id !== id))
    },
  }
}
