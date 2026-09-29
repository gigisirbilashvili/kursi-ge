import type { ISelectOption } from '../../../../shared/ui/OptionSelect/types'

export interface IPriceHistoryViewState {
  selection: string
  options: readonly ISelectOption[]
  onSelectionChange: (value: string) => void
  isWaiting: boolean
  isPaused: boolean
  lowText: string
  highText: string
  startText: string
  latestText: string
}
