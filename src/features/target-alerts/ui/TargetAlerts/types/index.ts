import type { ICurrency, IMarketSnapshot } from '../../../../../entities/currency'
import type { ITargetAlert } from '../../../types'

export interface ITargetAlertsProps {
  currencies: readonly ICurrency[]
  market: IMarketSnapshot
  alerts: readonly ITargetAlert[]
  onAdd: (alert: ITargetAlert) => void
  onRearm: (id: string) => void
  onRemove: (id: string) => void
}
