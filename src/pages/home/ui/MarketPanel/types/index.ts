import type { ICurrency, IMarketSnapshot } from '../../../../../entities/currency'

export interface IMarketPanelProps {
  currencies: readonly ICurrency[]
  snapshot: IMarketSnapshot
  onRetry: () => void
}
