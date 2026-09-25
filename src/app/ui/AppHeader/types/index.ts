import type { TConnectionStatus } from '../../../../shared/ui/connection-status'

export interface IAppHeaderProps {
  mode: 'light' | 'dark'
  onToggleMode: () => void
  connectionStatus: TConnectionStatus
}
