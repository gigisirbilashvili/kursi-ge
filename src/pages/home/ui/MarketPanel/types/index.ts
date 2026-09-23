import type { IMarketSnapshot } from '../../../../../entities/currency'

export interface IMarketPanelProps {
  snapshot: IMarketSnapshot
  onRetry: () => void
}
