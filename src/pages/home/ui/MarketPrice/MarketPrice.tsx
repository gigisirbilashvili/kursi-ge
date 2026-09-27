import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material'

import { ArrowIcon } from '../../../../shared/ui/icons'
import { formatPrice } from '../../lib/formatPrice'
import type { IMarketPriceProps } from './types'

export function MarketPrice({ quote, isStale }: IMarketPriceProps) {
  if (!quote)
    return (
      <Stack className="items-end">
        <Skeleton className="h-6 w-24 motion-reduce:animate-none motion-reduce:after:animate-none" />

        <Typography color="textSecondary" variant="caption">
          Awaiting price
        </Typography>
      </Stack>
    )
  const color =
    quote.direction === 'up'
      ? 'success.main'
      : quote.direction === 'down'
        ? 'error.main'
        : 'text.secondary'
  return (
    <Stack className="items-end gap-1">
      <Stack className="flex-row items-center gap-2">
        <Tooltip title={`Latest tick: ${quote.direction}`}>
          <Box component="span" color={color} className="inline-flex w-4 shrink-0">
            <ArrowIcon width={16} height={20} direction={quote.direction} />

            <Box component="span" className="sr-only">
              Latest tick {quote.direction}.{' '}
            </Box>
          </Box>
        </Tooltip>

        <Typography
          component="span"
          variant="body2Bold"
          className="min-w-[10ch] text-right tabular-nums"
        >
          {formatPrice(quote.price)}
        </Typography>
      </Stack>
      {isStale && (
        <Typography color="warning" variant="caption">
          Last-known price
        </Typography>
      )}
    </Stack>
  )
}
