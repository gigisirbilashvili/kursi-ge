import type { ICurrency } from '../types/index.ts'

export const CURRENCIES: readonly ICurrency[] = [
  { symbol: 'BTCUSDT', ticker: 'BTC', name: 'Bitcoin', badgeBackground: '#fffbeb', badgeColor: '#92400e' },
  { symbol: 'ETHUSDT', ticker: 'ETH', name: 'Ethereum', badgeBackground: '#f5f3ff', badgeColor: '#5b21b6' },
  { symbol: 'SOLUSDT', ticker: 'SOL', name: 'Solana', badgeBackground: '#ecfdf5', badgeColor: '#065f46' },
  { symbol: 'BNBUSDT', ticker: 'BNB', name: 'BNB', badgeBackground: '#fefce8', badgeColor: '#854d0e' },
  { symbol: 'XRPUSDT', ticker: 'XRP', name: 'XRP', badgeBackground: '#f1f5f9', badgeColor: '#334155' },
]

export const MARKET_STREAM_URL = `wss://data-stream.binance.vision/stream?streams=${CURRENCIES.map(({ symbol }) => `${symbol.toLowerCase()}@miniTicker`).join('/')}`
export const CONNECT_TIMEOUT_MS = 12_000
export const STALE_TIMEOUT_MS = 30_000
export const MAX_RETRY_DELAY_MS = 30_000
export const INITIAL_RETRY_DELAY_MS = 1_000
