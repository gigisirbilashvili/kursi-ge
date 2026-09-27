import { useState } from 'react'
import { Box, TextField } from '@mui/material'

import { notify } from '../../../../shared/lib/notify'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { parseTarget } from '../../lib/createTargetAlerts'
import type { ITargetAlertFormProps } from './types'

export function TargetAlertForm({ currencies, isFull, onAdd }: ITargetAlertFormProps) {
  const [selection, setSelection] = useState('BTCUSDT')
  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [target, setTarget] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const symbol = currencies.some((currency) => currency.symbol === selection)
    ? selection
    : (currencies[0]?.symbol ?? '')
  const price = parseTarget(target)
  const hasError = (hasSubmitted || target.length > 0) && price === null
  const currencyOptions = currencies.map(({ symbol: value, ticker }) => ({
    value,
    label: `${ticker}/USDT`,
  }))

  return (
    <Box
      component="form"
      className="mt-5 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        setHasSubmitted(true)
        if (price === null) {
          notify.error('Enter a positive decimal target price.', { toastId: 'target-invalid' })
          return
        }
        if (isFull) {
          notify.error('Limit of 20 alerts reached. Remove an alert to add another.', { toastId: 'target-limit' })
          return
        }
        onAdd({ id: crypto.randomUUID(), symbol, target: price, direction })
        setTarget('')
        setHasSubmitted(false)
      }}
    >
      <OptionSelect
        label="Alert currency"
        value={symbol}
        onChange={setSelection}
        options={currencyOptions}
        shouldRestoreFocus
      />

      <OptionSelect
        label="Condition"
        value={direction}
        onChange={(value) => setDirection(value === 'above' ? 'above' : 'below')}
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
        onChange={(event) => setTarget(event.target.value)}
        error={hasError}
        helperText={hasError ? 'Enter a positive decimal price.' : undefined}
        slotProps={{ htmlInput: { inputMode: 'decimal' } }}
      />

      <AppButton type="submit" variant="contained" disabled={isFull} className="min-h-10">
        Create alert
      </AppButton>
    </Box>
  )
}
