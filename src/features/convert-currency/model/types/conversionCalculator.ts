import type { ISelectOption } from '../../../../shared/ui/OptionSelect/types'

export interface IConversionCalculatorViewState {
  amount: string
  source: string
  target: string
  sourceTicker: string
  currencyOptions: readonly ISelectOption[]
  hasError: boolean
  helperText: string
  isReady: boolean
  isWaiting: boolean
  isStale: boolean
  resultText: string
  rateText: string
  statusText: string
  onAmountChange: (value: string) => void
  onSourceChange: (value: string) => void
  onTargetChange: (value: string) => void
  onSwap: () => void
  onAmountBlur: () => void
}
