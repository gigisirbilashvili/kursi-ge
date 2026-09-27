export interface ISelectOption {
  value: string
  label: string
}

export interface IOptionSelectProps {
  label: string
  value: string
  options: readonly ISelectOption[]
  onChange: (value: string) => void
  className?: string
  shouldRestoreFocus?: boolean
}
