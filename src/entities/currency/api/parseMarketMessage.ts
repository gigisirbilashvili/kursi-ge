import { CURRENCIES } from '../config/constants.ts'
import type { IMarketTick } from '../types/index.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseMarketMessage(raw: unknown): IMarketTick | null {
  if (typeof raw !== 'string') return null
  try {
    const envelope: unknown = JSON.parse(raw)
    if (!isRecord(envelope) || !isRecord(envelope.data)) return null
    const data = envelope.data
    if (
      data.e !== '24hrMiniTicker' ||
      typeof data.s !== 'string' ||
      !CURRENCIES.some(({ symbol }) => symbol === data.s) ||
      envelope.stream !== `${data.s.toLowerCase()}@miniTicker` ||
      typeof data.c !== 'string' ||
      !/^\d+(?:\.\d+)?$/.test(data.c) ||
      typeof data.E !== 'number' ||
      !Number.isSafeInteger(data.E) ||
      data.E <= 0
    )
      return null
    const price = Number(data.c)
    if (!Number.isFinite(price) || price <= 0) return null
    return { symbol: data.s, price, eventTime: data.E }
  } catch {
    return null
  }
}
