import { useState } from 'react'
import { Box, Card, MenuItem, Stack, TextField, Typography } from '@mui/material'

import { useSampledValue } from '../../../../shared/lib/useSampledValue'
import { LineChart } from '../../../../shared/ui/LineChart/LineChart'
import type { IPriceHistoryProps } from './types'

export function PriceHistory({ currencies, market }: IPriceHistoryProps) {
  const [selection, setSelection] = useState('BTCUSDT')
  const currency = currencies.find(({ symbol }) => symbol === selection) ?? currencies[0]
  const livePoints = market.history[currency?.symbol ?? ''] ?? []
  const points = useSampledValue(livePoints, 10_000, currency?.symbol ?? '', livePoints.length >= 2)
  const min = Math.min(...points.map(({ price }) => price))
  const max = Math.max(...points.map(({ price }) => price))
  const first = points[0]
  const last = points.at(-1)
  const range = max - min || max * 0.001 || 1
  const coordinates = points
    .map((point) => {
      const x =
        16 +
        ((point.time - (first?.time ?? 0)) / Math.max(1, (last?.time ?? 0) - (first?.time ?? 0))) *
          768
      const y = max === min ? 100 : 180 - ((point.price - min) / range) * 160
      return `${x},${y}`
    })
    .join(' ')
  const format = (price: number) => price.toLocaleString('en-US', { maximumSignificantDigits: 8 })
  const time = (value: number) => new Date(value).toLocaleTimeString()

  return (
    <Card
      component="section"
      variant="outlined"
      aria-labelledby="history-heading"
      className="mt-8 rounded-2xl p-5 sm:p-6"
    >
      <Stack className="flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Box>
          <Typography component="h2" variant="h2" id="history-heading">
            Session price history
          </Typography>

          <Typography className="mt-1 text-muted">
            Refreshes every 10 seconds. Latest 360 session updates, priced in USDT.
          </Typography>
        </Box>

        <TextField
          select
          size="small"
          label="Chart currency"
          value={currency?.symbol ?? ''}
          onChange={(event) => setSelection(event.target.value)}
          className="min-w-36"
        >
          {currencies.map((item) => (
            <MenuItem key={item.symbol} value={item.symbol}>
              {item.ticker}/USDT
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {points.length < 2 ? (
        <Box role="status" className="flex min-h-48 items-center justify-center text-muted">
          Waiting for two live updates to draw the chart…
        </Box>
      ) : (
        <Box component="figure" className="mx-0 mt-5 mb-0">
          <Stack className="flex-row flex-wrap justify-between gap-2 text-muted">
            <Typography variant="caption">Low {format(min)}</Typography>
            <Typography variant="caption">High {format(max)}</Typography>
          </Stack>

          <LineChart
            points={coordinates}
            aria-label={`${currency?.name} session price chart. From ${format(first?.price ?? 0)} to ${format(last?.price ?? 0)} USDT. Low ${format(min)}, high ${format(max)}.`}
            className="block h-48 w-full overflow-visible text-brand"
          />

          <Stack
            component="figcaption"
            className="flex-row flex-wrap justify-between gap-2 text-muted"
          >
            <Typography variant="caption">{first && time(first.time)}</Typography>
            <Typography variant="caption">
              Latest {format(last?.price ?? 0)} USDT · {last && time(last.time)}
            </Typography>
          </Stack>
        </Box>
      )}

      {market.status !== 'connected' && (
        <Typography role="status" className="mt-2 text-stale">
          History is paused until live prices return.
        </Typography>
      )}
    </Card>
  )
}
