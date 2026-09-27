import type { ICurrency } from '../../../../../entities/currency'
import type { ITargetAlert } from '../../../types'

export interface ITargetAlertFormProps {
  currencies: readonly ICurrency[]
  isFull: boolean
  onAdd: (alert: ITargetAlert) => void
}
