import { useMarketStatus } from '../../entities/currency'
import { CONNECTION_STATUS_COLORS, CONNECTION_STATUS_LABELS } from '../../shared/ui/connection-status/constants'
import type { IAppHeaderProps } from '../ui/AppHeader/types'
import type { IAppHeaderViewState } from './types/appHeader'

export function useAppHeaderModel({ mode, onToggleMode }: IAppHeaderProps): IAppHeaderViewState {
  const status = useMarketStatus()
  const label = CONNECTION_STATUS_LABELS[status]
  return {
    connection: { label, color: CONNECTION_STATUS_COLORS[status], ariaLabel: `Market connection: ${label}` },
    themeLabel: `Switch to ${mode === 'light' ? 'dark' : 'light'} theme`,
    themeText: mode === 'light' ? 'Dark mode' : 'Light mode', onToggleMode,
  }
}
