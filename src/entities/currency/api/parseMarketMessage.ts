import { AVAILABLE_CURRENCIES, BINANCE_DECIMAL_PRICE_PATTERN } from '../config/constants.ts'
import type {
  IBinanceEnvelope,
  IMarketTick,
  TMarketSocketData,
  TParsedMarketMessage,
} from '../types/index.ts'

function parseTicker(envelope: IBinanceEnvelope | null): IMarketTick | null {
  const data = envelope?.data
  if (!data || data.e !== '24hrMiniTicker') return null

  const currency = AVAILABLE_CURRENCIES.find(({ symbol }) => symbol === data.s)
  if (!currency || envelope?.stream !== `${currency.symbol.toLowerCase()}@miniTicker`) return null

  const rawPrice = data.c
  if (rawPrice?.constructor !== String || !BINANCE_DECIMAL_PRICE_PATTERN.test(rawPrice)) return null
  const price = Number(rawPrice)
  if (!Number.isFinite(price) || price <= 0) return null

  const eventTime = data.E
  if (eventTime === undefined || !Number.isSafeInteger(eventTime) || eventTime <= 0) return null
  return { symbol: currency.symbol, price, eventTime }
}

export function parseMarketSocketMessage(raw: TMarketSocketData): TParsedMarketMessage {
  const invalid: TParsedMarketMessage = {
    kind: 'invalid',
    message: 'An invalid market update was ignored. Waiting for valid prices.',
  }
  if (raw?.constructor !== String) return invalid

  let envelope: IBinanceEnvelope | null
  try {
    envelope = JSON.parse(raw as string) as IBinanceEnvelope | null
  } catch {
    return { kind: 'invalid', message: 'An invalid market update was ignored.' }
  }

  if (envelope && Object.hasOwn(envelope, 'id')) {
    const id = envelope.id
    return {
      kind: 'subscription',
      id: id !== undefined && id !== null && Number.isSafeInteger(id) && id > 0 ? id : null,
      isAccepted: envelope.result === null,
    }
  }
  const tick = parseTicker(envelope)
  return tick ? { kind: 'ticker', tick } : invalid
}

export function parseMarketMessage(raw: TMarketSocketData): IMarketTick | null {
  const parsed = parseMarketSocketMessage(raw)
  return parsed.kind === 'ticker' ? parsed.tick : null
}
