import type { ITargetAlertFormProps } from '../../ui/TargetAlertForm/types'
import type { ITargetAlertItemProps } from '../../ui/TargetAlertItem/types'

export interface ITargetAlertsViewState {
  form: ITargetAlertFormProps
  items: readonly (ITargetAlertItemProps & { id: string })[]
  isFull: boolean
  isEmpty: boolean
}
