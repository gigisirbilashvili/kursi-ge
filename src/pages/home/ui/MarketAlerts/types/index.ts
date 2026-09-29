export interface IMarketAlertView {
  id: number
  severity: 'success' | 'warning'
  title: string
  detail: string
  onDismiss: () => void
}

export interface IMarketAlertsProps {
  hasAlerts: boolean
  alerts: readonly IMarketAlertView[]
}
