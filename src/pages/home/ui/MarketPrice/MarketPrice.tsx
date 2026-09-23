import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'

import { ArrowIcon } from '../../../../shared/ui/icons'
import { formatPrice } from '../../lib/formatPrice'
import type { IMarketPriceProps } from './types'

export function MarketPrice({ quote, isStale }: IMarketPriceProps) {
  if (!quote) return (
    <Stack sx={{ alignItems: 'flex-end' }}>
      <Skeleton width={96} height={24} />
      <Typography variant="caption" color="text.secondary">Awaiting price</Typography>
    </Stack>
  )
  const color = quote.direction === 'up' ? 'success.main' : quote.direction === 'down' ? 'error.main' : 'text.secondary'
  return (
    <Stack sx={{ alignItems: 'flex-end', gap: 0.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Tooltip title={`Latest tick: ${quote.direction}`}>
          <Box component="span" sx={{ width: 16, flexShrink: 0, display: 'inline-flex', color }}>
            <ArrowIcon width={16} height={20} direction={quote.direction} />
            <Box component="span" sx={visuallyHidden}>Latest tick {quote.direction}. </Box>
          </Box>
        </Tooltip>
        <Typography component="span" variant="body2" sx={{ minWidth: '10ch', textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatPrice(quote.price)}</Typography>
      </Stack>
      {isStale && <Typography variant="caption" color="warning.main">Last-known price</Typography>}
    </Stack>
  )
}
