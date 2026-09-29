import assert from 'node:assert/strict'
import { describe, test } from '@jest/globals'

import { parseMarketMessage, parseMarketSocketMessage } from './parseMarketMessage'

function message(price: string, eventTime = 1, symbol = 'BTCUSDT') {
  return JSON.stringify({
    stream: `${symbol.toLowerCase()}@miniTicker`,
    data: { e: '24hrMiniTicker', s: symbol, c: price, E: eventTime },
  })
}

describe('parseMarketMessage', () => {
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
      '123',
      new ArrayBuffer(8),
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

  test('should reject malformed payload fields without throwing or coercing their values', () => {
    const validData = { e: '24hrMiniTicker', s: 'BTCUSDT', c: '100', E: 1 }
    const envelope = { stream: 'btcusdt@miniTicker', data: validData }
    for (const value of [null, true, 0, [], {}, 'wrong']) {
      for (const field of ['e', 's', 'c', 'E']) {
        const data = { ...validData, [field]: value }
        assert.equal(parseMarketSocketMessage(JSON.stringify({ ...envelope, data })).kind, 'invalid')
      }
      assert.equal(parseMarketSocketMessage(JSON.stringify({ ...envelope, data: value })).kind, 'invalid')
    }
    for (const value of [null, true, 100, [], {}, 'text'])
      assert.equal(parseMarketSocketMessage(JSON.stringify(value)).kind, 'invalid')
    assert.equal(parseMarketMessage(JSON.stringify({ ...envelope, data: { ...validData, E: '1' } })), null)
    assert.equal(parseMarketMessage(JSON.stringify({ ...envelope, data: { ...validData, c: ['100'] } })), null)
  })
})

describe('parseMarketSocketMessage', () => {
  test('should classify subscription acknowledgements and rejections separately from tickers', () => {
    assert.deepEqual(parseMarketSocketMessage('{"id":1,"result":null}'), {
      kind: 'subscription', id: 1, isAccepted: true,
    })
    for (const response of [
      '{"id":1,"code":2,"msg":"Rejected"}',
      '{"id":1,"result":false}',
      '{"id":1,"result":[]}',
    ]) {
      assert.deepEqual(parseMarketSocketMessage(response), {
        kind: 'subscription', id: 1, isAccepted: false,
      })
    }
    for (const id of ['1', null, {}, [], -1, 1.5]) {
      assert.deepEqual(parseMarketSocketMessage(JSON.stringify({ id, result: null })), {
        kind: 'subscription', id: null, isAccepted: true,
      })
    }
    assert.equal(parseMarketMessage('{"id":1,"result":null}'), null)
  })

  test('should preserve distinct invalid JSON and invalid market payload messages', () => {
    assert.deepEqual(parseMarketSocketMessage('invalid'), {
      kind: 'invalid', message: 'An invalid market update was ignored.',
    })
    for (const value of ['{}', 'null', new ArrayBuffer(8)]) {
      assert.deepEqual(parseMarketSocketMessage(value), {
        kind: 'invalid', message: 'An invalid market update was ignored. Waiting for valid prices.',
      })
    }
  })
})
