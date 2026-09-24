export type TMarketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error'
export type TPriceDirection = 'up' | 'down' | 'unchanged'

export interface ICurrency {
  symbol: string
  ticker: string
  name: string
  badgeClass: string
}

export interface IMarketTick {
  symbol: string
  price: number
  eventTime: number
}

export interface ICurrencyQuote {
  initialPrice: number
  previousPrice: number
  price: number
  direction: TPriceDirection
  percentageChange: number
  eventTime: number
  receivedAt: number
}

export interface IMarketSnapshot {
  history: Readonly<Record<string, readonly IPricePoint[]>>
  status: TMarketStatus
  quotes: Readonly<Record<string, ICurrencyQuote>>
  message: string | null
  retryAt: number | null
}

export interface IMarketSocket {
  send: (message: string) => void
  onopen: (() => void) | null
  onmessage: ((data: unknown) => void) | null
  onclose: (() => void) | null
  onerror: (() => void) | null
  close: () => void
}

export interface IMarketFeedOptions {
  symbols?: readonly string[]
  createSocket?: (url: string) => IMarketSocket
  now?: () => number
  schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>
  cancel?: (timer: ReturnType<typeof setTimeout>) => void
}

export interface IPricePoint {
  time: number
  price: number
}
