import { AVAILABLE_CURRENCIES, useMarketStatus } from '../../../entities/currency'
import { formatSignificantNumber } from '../../../shared/lib/formatSignificantNumber'
import type { ITargetAlertsProps } from '../ui/TargetAlerts/types'
import type { ITargetAlertsViewState } from './types/targetAlerts'
import { useTargetAlertForm } from './useTargetAlertForm'

export function useTargetAlertsModel({ currencies, alerts, onAdd, onRearm, onRemove }: ITargetAlertsProps): ITargetAlertsViewState {
  const status = useMarketStatus()
  const form = useTargetAlertForm({ currencies, alerts, onAdd, onRearm, onRemove })
  return {
    form, isFull: form.isFull, isEmpty: alerts.length === 0,
    items: alerts.map((alert) => {
      const ticker = AVAILABLE_CURRENCIES.find((currency) => currency.symbol === alert.symbol)?.ticker ?? alert.symbol
      const isTracked = currencies.some((currency) => currency.symbol === alert.symbol)
      const hasTriggered = alert.triggeredPrice !== undefined
      let statusText = 'Armed — waiting for target.'
      if (alert.triggeredPrice !== undefined) statusText = `Triggered at ${formatSignificantNumber(alert.triggeredPrice)} USDT`
      else if (!isTracked) statusText = 'Paused — add this pair to resume.'
      else if (status !== 'connected') statusText = 'Waiting for live prices.'
      return {
        id: alert.id, hasTriggered, statusText,
        title: `${ticker}/USDT ${alert.direction === 'above' ? '≥' : '≤'} ${formatSignificantNumber(alert.target)}`,
        rearmLabel: `Rearm ${ticker} alert`, removeLabel: `Remove ${ticker} alert`,
        onRearm: () => onRearm(alert.id), onRemove: () => onRemove(alert.id),
      }
    }),
  }
}
