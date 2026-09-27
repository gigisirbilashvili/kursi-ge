import { useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { useSampledValue } from '../../../../shared/lib/useSampledValue'
import { LineChart } from '../../../../shared/ui/LineChart/LineChart'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import type { IPriceHistoryProps } from './types'

export function PriceHistory({ currencies, market }: IPriceHistoryProps) {
  const theme = useTheme()
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
    <SectionCard headingId="history-heading" className="p-5 sm:p-6">
      <Stack className="flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionHeader
          headingId="history-heading"
          title="Session price history"
          description="Refreshes every 10 seconds. Latest 360 session updates, priced in USDT."
        />

        <OptionSelect
          label="Chart currency"
          value={currency?.symbol ?? ''}
          onChange={setSelection}
          options={currencies.map(({ symbol, ticker }) => ({ value: symbol, label: `${ticker}/USDT` }))}
          className="min-w-36"
        />
      </Stack>

      {points.length < 2 ? (
        <Box role="status" color="text.secondary" className="flex min-h-48 items-center justify-center">
          Waiting for two live updates to draw the chart…
        </Box>
      ) : (
        <Box component="figure" className="mx-0 mt-5 mb-0">
          <Stack color="text.secondary" className="flex-row flex-wrap justify-between gap-2">
            <Typography variant="caption">Low {format(min)}</Typography>
            <Typography variant="caption">High {format(max)}</Typography>
          </Stack>

          <LineChart
            points={coordinates}
            color={theme.palette.primary.main}
            borderColor={theme.palette.divider}
            aria-label={`${currency?.name} session price chart. From ${format(first?.price ?? 0)} to ${format(last?.price ?? 0)} USDT. Low ${format(min)}, high ${format(max)}.`}
            className="block h-48 w-full overflow-visible"
          />

          <Stack
            component="figcaption"
            color="text.secondary"
            className="flex-row flex-wrap justify-between gap-2"
          >
            <Typography variant="caption">{first && time(first.time)}</Typography>
            <Typography variant="caption">
              Latest {format(last?.price ?? 0)} USDT · {last && time(last.time)}
            </Typography>
          </Stack>
        </Box>
      )}

      {market.status !== 'connected' && (
        <Typography color="warning" role="status" className="mt-2">
          History is paused until live prices return.
        </Typography>
      )}
    </SectionCard>
  )
}
