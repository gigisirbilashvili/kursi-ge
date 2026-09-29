import { AVAILABLE_CURRENCIES } from '../../../entities/currency'
import type { ISignificantAlert } from '../../../features/significant-alerts'
import { formatPrice } from '../lib/formatPrice'
import type { IMarketAlertView } from '../ui/MarketAlerts/types'

export function createMarketAlertViews(alerts: readonly ISignificantAlert[], onDismiss: (id: number) => void): IMarketAlertView[] {
  return alerts.map((alert) => {
    const currency = AVAILABLE_CURRENCIES.find(({ symbol }) => symbol === alert.symbol)
    return {
      id: alert.id, severity: alert.direction === 'increased' ? 'success' : 'warning',
      title: `${currency?.name ?? alert.symbol} (${currency?.ticker ?? alert.symbol}/USDT) ${alert.direction} by ${Math.abs(alert.percentageChange).toFixed(2)}% since you opened the page.`,
      detail: `Initial: ${formatPrice(alert.initialPrice)} USDT · Current: ${formatPrice(alert.currentPrice)} USDT · Direction: ${alert.direction}`,
      onDismiss: () => onDismiss(alert.id),
    }
  })
}
