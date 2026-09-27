import { Alert, Box, Button, Stack, Typography } from '@mui/material'

import { AVAILABLE_CURRENCIES } from '../../../../entities/currency'
import { formatSignificantNumber } from '../../../../shared/lib/formatSignificantNumber'
import type { ITargetAlertItemProps } from './types'

export function TargetAlertItem({
  alert,
  currencies,
  marketStatus,
  onRearm,
  onRemove,
}: ITargetAlertItemProps) {
  const ticker =
    AVAILABLE_CURRENCIES.find((currency) => currency.symbol === alert.symbol)?.ticker ??
    alert.symbol
  const isTracked = currencies.some((currency) => currency.symbol === alert.symbol)
  const hasTriggered = alert.triggeredPrice !== undefined

  let statusText = 'Armed — waiting for target.'
  if (alert.triggeredPrice !== undefined)
    statusText = `Triggered at ${formatSignificantNumber(alert.triggeredPrice)} USDT`
  else if (!isTracked) statusText = 'Paused — add this pair to resume.'
  else if (marketStatus !== 'connected') statusText = 'Waiting for live prices.'

  return (
    <Alert
      role={hasTriggered ? 'status' : 'note'}
      severity={hasTriggered ? 'success' : 'info'}
      icon={false}
      className="[&_.MuiAlert-message]:w-full"
    >
      <Stack className="flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Box>
          <Typography component="p" variant="spanBold">
            {ticker}/USDT {alert.direction === 'above' ? '≥' : '≤'}{' '}
            {formatSignificantNumber(alert.target)}
          </Typography>
          <Typography variant="body2">{statusText}</Typography>
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
}
