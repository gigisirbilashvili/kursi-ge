import type { TConnectionStatus } from './types'

export const CONNECTION_STATUS_LABELS: Record<TConnectionStatus, string> = {
  connecting: 'Connecting',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  error: 'Connection error',
}

export const CONNECTION_STATUS_CLASSES: Record<TConnectionStatus, string> = {
  connecting: 'bg-status-pending',
  connected: 'bg-status-connected',
  reconnecting: 'bg-status-pending',
  disconnected: 'bg-status-disconnected',
  error: 'bg-status-disconnected',
}
