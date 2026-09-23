import { Chip, Tooltip, Typography } from '@mui/material'

import { ArrowIcon } from '../../../../shared/ui/icons'
import { formatPrice } from '../../lib/formatPrice'
import type { ISessionChangeProps } from './types'

export function SessionChange({ quote }: ISessionChangeProps) {
  if (!quote) return <Typography component="span" color="text.secondary" aria-label="Session change unavailable">—</Typography>
  const change = quote.percentageChange
  const formatted = change !== 0 && Math.abs(change) < 0.0001
    ? `${change > 0 ? '+' : '−'}<0.0001`
    : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: Math.abs(change) < 0.01 ? 4 : 2, signDisplay: 'exceptZero' }).format(change)
  const color = change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary'
  const backgroundColor = change > 0 ? '#eaf5ef' : change < 0 ? '#fcecef' : '#fdeef3'
  return (
    <Tooltip title={`Since the first session price of ${formatPrice(quote.initialPrice)} USDT`}>
      <Chip
        size="small"
        icon={<ArrowIcon width={16} height={18} direction={change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged'} />}
        label={`${formatted}%`}
        sx={{ color, backgroundColor, height: 28, fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', '& .MuiChip-icon': { color: 'inherit', ml: 1 } }}
      />
    </Tooltip>
  )
}
