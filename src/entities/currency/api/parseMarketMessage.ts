import { AVAILABLE_CURRENCIES, BINANCE_DECIMAL_PRICE_PATTERN } from '../config/constants.ts'
import type { IMarketTick } from '../types/index.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseMarketMessage(raw: unknown): IMarketTick | null {
  if (typeof raw !== 'string') return null
  try {
    const envelope: unknown = JSON.parse(raw)
    if (!isRecord(envelope)) return null

    const data = envelope.data
    if (!isRecord(data) || data.e !== '24hrMiniTicker') return null

    const symbol = data.s
    if (typeof symbol !== 'string') return null
    if (!AVAILABLE_CURRENCIES.some((currency) => currency.symbol === symbol)) return null
    if (envelope.stream !== `${symbol.toLowerCase()}@miniTicker`) return null

    const rawPrice = data.c
    if (typeof rawPrice !== 'string' || !BINANCE_DECIMAL_PRICE_PATTERN.test(rawPrice)) return null
    const price = Number(rawPrice)
    if (!Number.isFinite(price) || price <= 0) return null

    const eventTime = data.E
    if (typeof eventTime !== 'number' || !Number.isSafeInteger(eventTime) || eventTime <= 0) return null

    return { symbol, price, eventTime }
  } catch {
    return null
  }
}
