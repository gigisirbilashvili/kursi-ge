import assert from 'node:assert/strict'
import { test } from '@jest/globals'

import { parseMarketMessage } from './parseMarketMessage'

function message(price: string, eventTime = 1, symbol = 'BTCUSDT') {
  return JSON.stringify({
    stream: `${symbol.toLowerCase()}@miniTicker`,
    data: { e: '24hrMiniTicker', s: symbol, c: price, E: eventTime },
  })
}

test('should parse only valid supported Binance prices', () => {
  assert.deepEqual(parseMarketMessage(message('123.45')), {
    symbol: 'BTCUSDT',
    price: 123.45,
    eventTime: 1,
  })
  for (const price of ['0', '-1', '', 'Infinity', 'NaN', '1e3', ' 2 '])
    assert.equal(parseMarketMessage(message(price)), null)
  for (const value of [
    'not json',
    'null',
    '{}',
    message('2', 1, 'FAKEUSDT'),
    message('2', -1),
    message('2', 1.5),
    123,
    null,
  ])
    assert.equal(parseMarketMessage(value), null)
  assert.equal(
    parseMarketMessage(
      JSON.stringify({
        stream: 'ethusdt@miniTicker',
        data: { e: '24hrMiniTicker', s: 'BTCUSDT', c: '5', E: 1 },
      }),
    ),
    null,
  )
})

