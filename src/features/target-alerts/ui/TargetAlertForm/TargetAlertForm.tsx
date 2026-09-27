import { useRef, useState } from 'react'
import { Box, Button, MenuItem, TextField } from '@mui/material'

import { notify } from '../../../../shared/lib/notify'
import { parseTarget } from '../../lib/createTargetAlerts'
import type { ITargetAlertFormProps } from './types'

export function TargetAlertForm({ currencies, isFull, onAdd }: ITargetAlertFormProps) {
  const [selection, setSelection] = useState('BTCUSDT')
  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [target, setTarget] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const currencySelectRef = useRef<HTMLDivElement>(null)
  const conditionSelectRef = useRef<HTMLDivElement>(null)
  const symbol = currencies.some((currency) => currency.symbol === selection)
    ? selection
    : (currencies[0]?.symbol ?? '')
  const price = parseTarget(target)
  const hasError = (hasSubmitted || target.length > 0) && price === null

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
      <TextField
        ref={currencySelectRef}
        select
        label="Alert currency"
        value={symbol}
        size="small"
        slotProps={{
          select: {
            onClose: () =>
              currencySelectRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus(),
            MenuProps: { ['disableEnforceFocus']: true },
          },
        }}
        onChange={(event) => setSelection(event.target.value)}
      >
        {currencies.map((currency) => (
          <MenuItem key={currency.symbol} value={currency.symbol}>
            {currency.ticker}/USDT
          </MenuItem>
        ))}
      </TextField>

      <TextField
        ref={conditionSelectRef}
        select
        label="Condition"
        value={direction}
        size="small"
        slotProps={{
          select: {
            onClose: () =>
              conditionSelectRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus(),
            MenuProps: { ['disableEnforceFocus']: true },
          },
        }}
        onChange={(event) => setDirection(event.target.value === 'above' ? 'above' : 'below')}
      >
        <MenuItem value="above">At or above</MenuItem>
        <MenuItem value="below">At or below</MenuItem>
      </TextField>

      <TextField
        label="Target price (USDT)"
        value={target}
        size="small"
        onChange={(event) => setTarget(event.target.value)}
        error={hasError}
        helperText={hasError ? 'Enter a positive decimal price.' : undefined}
        slotProps={{ htmlInput: { inputMode: 'decimal' } }}
      />

      <Button type="submit" variant="contained" disabled={isFull} className="min-h-10">
        Create alert
      </Button>
    </Box>
  )
}
