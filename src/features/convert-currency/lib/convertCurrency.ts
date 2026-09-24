import { STALE_TIMEOUT_MS } from '../../../entities/currency/index.ts'
import type { IMarketSnapshot } from '../../../entities/currency/index.ts'
import type { TConversionResult } from '../types/index.ts'

export function getConversionResult(
  rawAmount: string,
  source: string,
  target: string,
  market: IMarketSnapshot,
  now: number,
): TConversionResult {
  const input = rawAmount.trim()
  if (!input) return { status: 'empty', message: 'Enter an amount to see the conversion.' }
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(input)) {
    return {
      status: 'invalid',
      message: 'Enter zero or a positive decimal amount, using a dot for decimals.',
    }
  }
  const amount = Number(input)
  if (!Number.isFinite(amount) || amount > Number.MAX_SAFE_INTEGER) {
    return { status: 'invalid', message: 'This amount is too large. Enter a smaller amount.' }
  }
  if (amount === 0 && /[1-9]/.test(input)) {
    return { status: 'invalid', message: 'This amount is too small to calculate accurately.' }
  }
  const sourceQuote = market.quotes[source]
  const targetQuote = market.quotes[target]
  if (!sourceQuote || !targetQuote) {
    return { status: 'waiting', message: 'Waiting for prices for both selected currencies.' }
  }
  if (
    market.status !== 'connected' ||
    now - sourceQuote.receivedAt >= STALE_TIMEOUT_MS ||
    now - targetQuote.receivedAt >= STALE_TIMEOUT_MS
  ) {
    return {
      status: 'stale',
      message: 'Waiting for fresh prices. Conversion resumes when live updates return.',
    }
  }
  if (
    !Number.isFinite(sourceQuote.price) ||
    sourceQuote.price <= 0 ||
    !Number.isFinite(targetQuote.price) ||
    targetQuote.price <= 0
  ) {
    return { status: 'waiting', message: 'Waiting for valid prices for both selected currencies.' }
  }
  const rate = source === target ? 1 : sourceQuote.price / targetQuote.price
  const value = amount * rate
  if (
    !Number.isFinite(rate) ||
    rate <= 0 ||
    !Number.isFinite(value) ||
    (value === 0 && amount > 0)
  ) {
    return {
      status: 'invalid',
      message:
        'This conversion is outside the supported number range. Try another amount or currency pair.',
    }
  }
  return { status: 'ready', amount, rate, value }
}

export function formatConversionValue(value: number) {
  if (value > 0 && value < 0.00000001) return value.toExponential(6)
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12 }).format(value)
}
