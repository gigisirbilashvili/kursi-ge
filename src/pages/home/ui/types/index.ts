import type { IMarketSnapshot } from '../../../../entities/currency'

export interface IHomePageProps {
  market: IMarketSnapshot
  onRetry: () => void
}
