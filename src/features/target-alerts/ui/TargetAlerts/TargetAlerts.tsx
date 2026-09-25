import { useRef, useState } from 'react'
import { Alert, Box, Button, Card, MenuItem, Stack, TextField, Typography } from '@mui/material'

import { AVAILABLE_CURRENCIES } from '../../../../entities/currency'
import { notify } from '../../../../shared/lib/notify'
import { parseTarget } from '../../lib/createTargetAlerts'
import type { ITargetAlertsProps } from './types'

export function TargetAlerts({
  currencies,
  market,
  alerts,
  onAdd,
  onRearm,
  onRemove,
}: ITargetAlertsProps) {
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
  const isFull = alerts.length >= 20

  return (
    <Card
      component="section"
      variant="outlined"
      aria-labelledby="target-alert-heading"
      className="mt-8 rounded-2xl p-5 sm:p-6"
    >
      <Typography component="h2" variant="h2" id="target-alert-heading">
        Price alerts
      </Typography>

      <Typography className="mt-1 text-muted">
        Choose a target in USDT. Alerts fire once when the condition is met, including if it is
        already met. Saved on this device; monitored while this page is open.
      </Typography>

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

      {isFull && (
        <Typography role="status" className="mt-3 text-muted">
          Limit of 20 alerts reached. Remove an alert to add another.
        </Typography>
      )}

      <Stack className="mt-5 gap-3">
        {!alerts.length && <Typography className="text-muted">No target alerts yet.</Typography>}
        {alerts.map((alert) => {
          const ticker =
            AVAILABLE_CURRENCIES.find((currency) => currency.symbol === alert.symbol)?.ticker ??
            alert.symbol
          const isTracked = currencies.some((currency) => currency.symbol === alert.symbol)
          const hasTriggered = alert.triggeredPrice !== undefined
          return (
            <Alert
              key={alert.id}
              role={hasTriggered ? 'status' : 'note'}
              severity={hasTriggered ? 'success' : 'info'}
              icon={false}
              className="[&_.MuiAlert-message]:w-full"
            >
              <Stack className="flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <Box>
                  <Typography component="p" variant="spanBold">
                    {ticker}/USDT {alert.direction === 'above' ? '≥' : '≤'}{' '}
                    {alert.target.toLocaleString('en-US', { maximumSignificantDigits: 12 })}
                  </Typography>

                  <Typography variant="body2">
                    {hasTriggered
                      ? `Triggered at ${alert.triggeredPrice?.toLocaleString('en-US', { maximumSignificantDigits: 12 })} USDT`
                      : !isTracked
                        ? 'Paused — add this pair to resume.'
                        : market.status !== 'connected'
                          ? 'Waiting for live prices.'
                          : 'Armed — waiting for target.'}
                  </Typography>
                </Box>

                <Stack className="flex-row gap-2">
                  {hasTriggered && (
                    <Button onClick={() => onRearm(alert.id)} aria-label={`Rearm ${ticker} alert`}>
                      Rearm
                    </Button>
                  )}
                  <Button onClick={() => onRemove(alert.id)} aria-label={`Remove ${ticker} alert`}>
                    Remove
                  </Button>
                </Stack>
              </Stack>
            </Alert>
          )
        })}
      </Stack>
    </Card>
  )
}
