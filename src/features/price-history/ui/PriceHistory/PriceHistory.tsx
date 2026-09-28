import { useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { LineChart } from '@mui/x-charts/LineChart'

import { useMarketHistory, useMarketStatus } from '../../../../entities/currency'
import { useSampledValue } from '../../../../shared/lib/useSampledValue'
import { formatSignificantNumber } from '../../../../shared/lib/formatSignificantNumber'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import type { IPriceHistoryProps } from './types'

export function PriceHistory({ currencies }: IPriceHistoryProps) {
  const theme = useTheme()
  const [selection, setSelection] = useState('BTCUSDT')
  const currency = currencies.find(({ symbol }) => symbol === selection) ?? currencies[0]
  const status = useMarketStatus()
  const livePoints = useMarketHistory(currency?.symbol ?? '')
  const points = useSampledValue(livePoints, 10_000, currency?.symbol ?? '', livePoints.length >= 2)
  const min = Math.min(...points.map(({ price }) => price))
  const max = Math.max(...points.map(({ price }) => price))
  const first = points[0]
  const last = points.at(-1)
  const range = max - min || max * 0.001 || 1
  const format = (price: number) => formatSignificantNumber(price, 8)
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
            height={240}
            xAxis={[{
              data: points.map(({ time: timestamp }) => new Date(timestamp)),
              scaleType: 'time',
              valueFormatter: (value: Date) => value.toLocaleTimeString(),
              tickNumber: 3,
            }]}
            yAxis={[{
              min: Math.max(0, min - range * 0.1),
              max: max + range * 0.1,
              width: 90,
              valueFormatter: (value: number) => format(value),
            }]}
            series={[{
              id: currency?.symbol,
              label: `${currency?.ticker}/USDT`,
              data: points.map(({ price }) => price),
              color: theme.palette.primary.main,
              curve: 'linear',
              ['showMark']: false,
              valueFormatter: (value) => value === null ? '—' : `${format(value)} USDT`,
            }]}
            grid={{ ['horizontal']: true }}
            hideLegend
            skipAnimation
            title={`${currency?.name} session price chart`}
            desc={`From ${format(first?.price ?? 0)} to ${format(last?.price ?? 0)} USDT. Low ${format(min)}, high ${format(max)}.`}
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

      {status !== 'connected' && (
        <StatusText tone="warning" className="mt-2">
          History is paused until live prices return.
        </StatusText>
      )}
    </SectionCard>
  )
}
