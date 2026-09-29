export interface IMarketPanelHeaderViewState {
  visibleText: string
  isUnavailable: boolean
  severity: 'warning' | 'success' | 'info'
  messageText: string
  isRetryDisabled: boolean
  onRetry: () => void
}
