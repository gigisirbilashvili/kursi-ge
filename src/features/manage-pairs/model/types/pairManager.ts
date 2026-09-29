import type { ISelectOption } from '../../../../shared/ui/OptionSelect/types'

export interface IPairManagerViewState {
  isExpanded: boolean
  selected: string
  buttonText: string
  hasAvailablePairs: boolean
  pairs: readonly { id: string; label: string; onRemove?: () => void }[]
  options: readonly ISelectOption[]
  onToggle: () => void
  onSelectionChange: (value: string) => void
  onAdd: () => void
}
