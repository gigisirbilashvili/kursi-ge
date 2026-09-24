import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  getConversionResult,
  formatConversionValue,
} from '../src/features/convert-currency/lib/convertCurrency.ts'
import { STALE_TIMEOUT_MS } from '../src/entities/currency/config/constants.ts'
import type { ICurrencyQuote, IMarketSnapshot } from '../src/entities/currency/types/index.ts'

function quote(price: number, receivedAt = 1000): ICurrencyQuote {
  return {
    price,
    initialPrice: price,
    previousPrice: price,
    direction: 'unchanged',
    percentageChange: 0,
    receivedAt,
    eventTime: receivedAt,
  }
}
function market(): IMarketSnapshot {
  return {
    history: {},
    status: 'connected',
    message: null,
    retryAt: null,
    quotes: { BTCUSDT: quote(60000), ETHUSDT: quote(3000) },
  }
}

await test('converts crypto through USDT rates, including zero, decimals and same-currency amounts', () => {
  const snapshot = market()
  assert.deepEqual(getConversionResult('0.5', 'BTCUSDT', 'ETHUSDT', snapshot, 1000), {
    status: 'ready',
    amount: 0.5,
    rate: 20,
    value: 10,
  })
  assert.deepEqual(getConversionResult('10', 'ETHUSDT', 'BTCUSDT', snapshot, 1000), {
    status: 'ready',
    amount: 10,
    rate: 0.05,
    value: 0.5,
  })
  assert.deepEqual(getConversionResult('0', 'BTCUSDT', 'ETHUSDT', snapshot, 1000), {
    status: 'ready',
    amount: 0,
    rate: 20,
    value: 0,
  })
  assert.deepEqual(getConversionResult(' .25 ', 'BTCUSDT', 'BTCUSDT', snapshot, 1000), {
    status: 'ready',
    amount: 0.25,
    rate: 1,
    value: 0.25,
  })
})

await test('rejects invalid, negative, non-finite and out-of-range amounts', () => {
  for (const value of [
    '-1',
    '-0',
    'abc',
    '1,5',
    '1e3',
    'Infinity',
    'NaN',
    '0x10',
    '1.2.3',
    '1 2',
    '9007199254740992',
    `0.${'0'.repeat(350)}1`,
  ]) {
    assert.equal(
      getConversionResult(value, 'BTCUSDT', 'ETHUSDT', market(), 1000).status,
      'invalid',
      value,
    )
  }
  assert.equal(getConversionResult('   ', 'BTCUSDT', 'ETHUSDT', market(), 1000).status, 'empty')
  assert.notEqual(formatConversionValue(0.00000000001), '0')
})

await test('updates conversion from new quotes and withholds missing, stale or disconnected prices', () => {
  const snapshot = market()
  const next = { ...snapshot, quotes: { ...snapshot.quotes, ETHUSDT: quote(6000) } }
  assert.deepEqual(getConversionResult('1', 'BTCUSDT', 'ETHUSDT', next, 1000), {
    status: 'ready',
    amount: 1,
    rate: 10,
    value: 10,
  })
  assert.equal(getConversionResult('1', 'BTCUSDT', 'XRPUSDT', snapshot, 1000).status, 'waiting')
  assert.equal(
    getConversionResult('1', 'BTCUSDT', 'ETHUSDT', snapshot, 1000 + STALE_TIMEOUT_MS).status,
    'stale',
  )
  assert.equal(
    getConversionResult('1', 'BTCUSDT', 'ETHUSDT', { ...snapshot, status: 'reconnecting' }, 1000)
      .status,
    'stale',
  )
  assert.equal(
    getConversionResult(
      '1',
      'BTCUSDT',
      'ETHUSDT',
      { ...snapshot, quotes: { ...snapshot.quotes, ETHUSDT: quote(0) } },
      1000,
    ).status,
    'waiting',
  )
})
