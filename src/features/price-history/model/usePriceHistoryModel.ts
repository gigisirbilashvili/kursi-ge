import { useState } from 'react'
import { useTheme } from '@mui/material/styles'

import { useMarketHistory, useMarketStatus } from '../../../entities/currency'
import type { ICurrency } from '../../../entities/currency'
import { useSampledValue } from '../../../shared/lib/useSampledValue'
import { createHistoryChartState } from '../lib/createHistoryChartState'
import type { IPriceHistoryModel } from '../types/model'

export function usePriceHistoryModel(currencies: readonly ICurrency[]): IPriceHistoryModel {
  const theme = useTheme()
  const [selection, setSelection] = useState('BTCUSDT')
  const currency = currencies.find(({ symbol }) => symbol === selection) ?? currencies[0]
  const status = useMarketStatus()
  const livePoints = useMarketHistory(currency?.symbol ?? '')
  const points = useSampledValue(livePoints, 10_000, currency?.symbol ?? '', livePoints.length >= 2)
  return {
    ...createHistoryChartState(points, currency),
    chartColor: theme.palette.primary.main,
    selection: currency?.symbol ?? '', onSelectionChange: setSelection,
    options: currencies.map(({ symbol, ticker }) => ({ value: symbol, label: `${ticker}/USDT` })),
    isWaiting: points.length < 2, isPaused: status !== 'connected',
  }
}
