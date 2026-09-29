import type { ISelectOption } from '../../../../../shared/ui/OptionSelect/types'

export interface IMarketToolbarProps {
  search: string
  hasSearch: boolean
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  filter: string
  onFilterChange: (value: string | null) => void
  sortField: string
  onSortFieldChange: (value: string) => void
  sortOptions: readonly ISelectOption[]
  sortLabel: string
  isDescending: boolean
  onToggleSort: () => void
  isShowingHidden: boolean
  onToggleHidden: () => void
  hiddenLabel: string
  hasHiddenItems: boolean
  hiddenItems: readonly { id: string; label: string; ariaLabel: string; onRestore: () => void }[]
}
