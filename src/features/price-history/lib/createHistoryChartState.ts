import type { ICurrency, IPricePoint } from '../../../entities/currency'
import { formatSignificantNumber } from '../../../shared/lib/formatSignificantNumber'

export function createHistoryChartState(points: readonly IPricePoint[], currency: ICurrency | undefined) {
  const min = points.length ? Math.min(...points.map(({ price }) => price)) : 0
  const max = points.length ? Math.max(...points.map(({ price }) => price)) : 0
  const first = points[0]
  const last = points.at(-1)
  const range = max - min || max * 0.001 || 1
  const format = (price: number) => formatSignificantNumber(price, 8)
  const time = (value: number) => new Date(value).toLocaleTimeString()
  return {
    formatAxisPrice: format,
    formatAxisTime: (value: Date) => value.toLocaleTimeString(),
    formatSeriesPrice: (value: number | null) => value === null ? '—' : `${format(value)} USDT`,
    lowText: `Low ${format(min)}`, highText: `High ${format(max)}`,
    startText: first ? time(first.time) : '',
    latestText: `Latest ${format(last?.price ?? 0)} USDT · ${last ? time(last.time) : ''}`,
    title: `${currency?.name} session price chart`,
    description: `From ${format(first?.price ?? 0)} to ${format(last?.price ?? 0)} USDT. Low ${format(min)}, high ${format(max)}.`,
    seriesId: currency?.symbol, seriesLabel: `${currency?.ticker}/USDT`,
    times: points.map(({ time: timestamp }) => new Date(timestamp)), prices: points.map(({ price }) => price),
    minValue: Math.max(0, min - range * 0.1), maxValue: max + range * 0.1,
  }
}
