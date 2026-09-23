import type { ICurrencyQuote, IMarketSnapshot } from '../../../entities/currency/index.ts'

export interface ISignificantAlert {
  id: number
  symbol: string
  initialPrice: number
  currentPrice: number
  percentageChange: number
  direction: 'increased' | 'decreased'
}

export interface IAlertTracker {
  getSnapshot: () => readonly ISignificantAlert[]
  subscribe: (listener: () => void) => () => void
  update: (snapshot: IMarketSnapshot) => void
  dismiss: (id: number) => void
}

export type TAlertZone = 'up' | 'down' | 'inside'
export type TQuoteEntry = readonly [string, ICurrencyQuote]
