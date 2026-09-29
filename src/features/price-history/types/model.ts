import type { IPriceHistoryViewState } from '../model/types/priceHistory'

export interface IPriceHistoryModel extends IPriceHistoryViewState {
  chartColor: string
  formatAxisPrice: (value: number) => string
  formatAxisTime: (value: Date) => string
  formatSeriesPrice: (value: number | null) => string
  title: string
  description: string
  seriesId?: string
  seriesLabel: string
  times: Date[]
  prices: number[]
  minValue: number
  maxValue: number
}
