export type TConnectionStatus =
  'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error'

export interface IConnectionStatusProps {
  label: string
  color: string
  ariaLabel: string
}
