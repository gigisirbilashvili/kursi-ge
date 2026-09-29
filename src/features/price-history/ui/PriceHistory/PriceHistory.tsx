import { Box, Stack, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'

import { usePriceHistoryModel } from '../../model/usePriceHistoryModel'

import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import type { IPriceHistoryProps } from './types'

export function PriceHistory({ currencies }: IPriceHistoryProps) {
  const {
    chartColor,
    formatAxisPrice,
    formatAxisTime,
    formatSeriesPrice,
    title,
    description,
    seriesId,
    seriesLabel,
    times,
    prices,
    minValue,
    maxValue,
    selection,
    options,
    onSelectionChange,
    isWaiting,
    isPaused,
    lowText,
    highText,
    startText,
    latestText,
  } = usePriceHistoryModel(currencies)
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
          value={selection}
          onChange={onSelectionChange}
          options={options}
          className="min-w-36"
        />
      </Stack>

      {isWaiting ? (
        <Box role="status" color="text.secondary" className="flex min-h-48 items-center justify-center">
          Waiting for two live updates to draw the chart…
        </Box>
      ) : (
        <Box component="figure" className="mx-0 mt-5 mb-0">
          <Stack color="text.secondary" className="flex-row flex-wrap justify-between gap-2">
            <Typography variant="caption">{lowText}</Typography>
            <Typography variant="caption">{highText}</Typography>
          </Stack>

          <LineChart
            height={240}
            xAxis={[{
              data: times,
              scaleType: 'time',
              valueFormatter: formatAxisTime,
              tickNumber: 3,
            }]}
            yAxis={[{
              min: minValue,
              max: maxValue,
              width: 90,
              valueFormatter: formatAxisPrice,
            }]}
            series={[{
              id: seriesId,
              label: seriesLabel,
              data: prices,
              color: chartColor,
              curve: 'linear',
              ['showMark']: false,
              valueFormatter: formatSeriesPrice,
            }]}
            grid={{ ['horizontal']: true }}
            hideLegend
            skipAnimation
            title={title}
            desc={description}
          />

          <Stack
            component="figcaption"
            color="text.secondary"
            className="flex-row flex-wrap justify-between gap-2"
          >
            <Typography variant="caption">{startText}</Typography>
            <Typography variant="caption">
              {latestText}
            </Typography>
          </Stack>
        </Box>
      )}

      {isPaused && (
        <StatusText tone="warning" className="mt-2">
          History is paused until live prices return.
        </StatusText>
      )}
    </SectionCard>
  )
}
