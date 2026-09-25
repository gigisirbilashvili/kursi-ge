export type TConnectionStatus =
  'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error'

export interface IConnectionStatusProps {
  status: TConnectionStatus
}
