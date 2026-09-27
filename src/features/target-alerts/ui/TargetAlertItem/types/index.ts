import type { ICurrency, TMarketStatus } from '../../../../../entities/currency'
import type { ITargetAlert } from '../../../types'

export interface ITargetAlertItemProps {
  alert: ITargetAlert
  currencies: readonly ICurrency[]
  marketStatus: TMarketStatus
  onRearm: (id: string) => void
  onRemove: (id: string) => void
}
