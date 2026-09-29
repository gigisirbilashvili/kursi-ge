import type { IConnectionStatusProps } from '../../../shared/ui/connection-status/types'

export interface IAppHeaderViewState {
  connection: IConnectionStatusProps
  themeLabel: string
  themeText: string
  onToggleMode: () => void
}
