import type { ICurrency } from '../../../../../entities/currency'
import type { ITargetAlert } from '../../../types'

export interface ITargetAlertsProps {
  currencies: readonly ICurrency[]
  alerts: readonly ITargetAlert[]
  onAdd: (alert: ITargetAlert) => void
  onRearm: (id: string) => void
  onRemove: (id: string) => void
}
