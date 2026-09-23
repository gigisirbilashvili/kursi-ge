import type { TConnectionStatus } from './types'

export const CONNECTION_STATUS_LABELS: Record<TConnectionStatus, string> = {
  connecting: 'Connecting',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  error: 'Connection error',
}

export const CONNECTION_STATUS_COLORS: Record<TConnectionStatus, string> = {
  connecting: '#d69c3c',
  connected: '#27815b',
  reconnecting: '#d69c3c',
  disconnected: '#ba2646',
  error: '#ba2646',
}
