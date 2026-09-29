import { Box, TextField } from '@mui/material'

import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import type { ITargetAlertFormProps } from './types'

export function TargetAlertForm({
  symbol,
  direction,
  target,
  hasError,
  isFull,
  currencyOptions,
  helperText,
  onSymbolChange,
  onDirectionChange,
  onTargetChange,
  onSubmit,
}: ITargetAlertFormProps) {
  return (
    <Box
      component="form"
      className="mt-5 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <OptionSelect
        label="Alert currency"
        value={symbol}
        onChange={onSymbolChange}
        options={currencyOptions}
        shouldRestoreFocus
      />

      <OptionSelect
        label="Condition"
        value={direction}
        onChange={onDirectionChange}
        options={[
          { value: 'above', label: 'At or above' },
          { value: 'below', label: 'At or below' },
        ]}
        shouldRestoreFocus
      />

      <TextField
        label="Target price (USDT)"
        value={target}
        size="small"
        onChange={(event) => onTargetChange(event.target.value)}
        error={hasError}
        helperText={helperText}
        slotProps={{ htmlInput: { inputMode: 'decimal' } }}
      />

      <AppButton type="submit" variant="contained" disabled={isFull} className="min-h-10">
        Create alert
      </AppButton>
    </Box>
  )
}
