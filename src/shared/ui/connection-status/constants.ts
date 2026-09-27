import type { TConnectionStatus } from './types'

export const CONNECTION_STATUS_LABELS: Record<TConnectionStatus, string> = {
  connecting: 'Connecting',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  error: 'Connection error',
}

export const CONNECTION_STATUS_COLORS: Record<TConnectionStatus, string> = {
  connecting: 'statusPending.main',
  connected: 'success.main',
  reconnecting: 'statusPending.main',
  disconnected: 'error.main',
  error: 'error.main',
}
