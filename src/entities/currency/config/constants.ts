import type { ICurrency } from '../types/index.ts'

export const CURRENCIES: readonly ICurrency[] = [
  { symbol: 'BTCUSDT', ticker: 'BTC', name: 'Bitcoin', badgeClass: 'bg-amber-50 text-amber-800' },
  {
    symbol: 'ETHUSDT',
    ticker: 'ETH',
    name: 'Ethereum',
    badgeClass: 'bg-violet-50 text-violet-800',
  },
  {
    symbol: 'SOLUSDT',
    ticker: 'SOL',
    name: 'Solana',
    badgeClass: 'bg-emerald-50 text-emerald-800',
  },
  { symbol: 'BNBUSDT', ticker: 'BNB', name: 'BNB', badgeClass: 'bg-yellow-50 text-yellow-800' },
  { symbol: 'XRPUSDT', ticker: 'XRP', name: 'XRP', badgeClass: 'bg-slate-100 text-slate-700' },
]

export const MARKET_STREAM_URL = `wss://data-stream.binance.vision/stream?streams=${CURRENCIES.map(({ symbol }) => `${symbol.toLowerCase()}@miniTicker`).join('/')}`
export const CONNECT_TIMEOUT_MS = 12_000
export const STALE_TIMEOUT_MS = 30_000
export const MAX_RETRY_DELAY_MS = 30_000
export const INITIAL_RETRY_DELAY_MS = 1_000
