import type { ISelectOption } from '../../../../../shared/ui/OptionSelect/types'

export interface ITargetAlertFormProps {
  symbol: string
  direction: string
  target: string
  hasError: boolean
  isFull: boolean
  helperText?: string
  currencyOptions: readonly ISelectOption[]
  onSymbolChange: (value: string) => void
  onDirectionChange: (value: string) => void
  onTargetChange: (value: string) => void
  onSubmit: () => void
}
