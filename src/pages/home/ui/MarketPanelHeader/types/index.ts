import type { IMarketSnapshot } from '../../../../../entities/currency'
export interface IMarketPanelHeaderProps {
  visibleCount: number
  snapshot: IMarketSnapshot
  isUnavailable: boolean
  isConnected: boolean
  hasPrices: boolean
  onRetry: () => void
}
