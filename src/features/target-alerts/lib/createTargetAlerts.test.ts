import assert from 'node:assert/strict'
import { test } from '@jest/globals'

import {
  createTargetAlerts,
  parseTarget,
} from './createTargetAlerts'
import type { IMarketSnapshot } from '../../../entities/currency/types/index'

function market(price: number): IMarketSnapshot {
  return {
    status: 'connected',
    message: null,
    retryAt: null,
    history: {},
    quotes: {
      BTCUSDT: {
        price,
        initialPrice: 100,
        previousPrice: 100,
        percentageChange: price - 100,
        direction: 'unchanged',
        eventTime: 1000,
        receivedAt: 1000,
      },
    },
  }
}

test('should validate target prices and stored alerts', () => {
  for (const value of ['', '-1', '0', 'NaN', '1e4', 'Infinity', '1,2', '9007199254740992'])
    assert.equal(parseTarget(value), null)
  assert.equal(parseTarget(' .25 '), 0.25)
  const saved = [
    { id: '1', symbol: 'BTCUSDT', target: 120, direction: 'above' },
    { id: '2', symbol: 'FAKE', target: 1, direction: 'above' },
    null,
  ]
  assert.equal(createTargetAlerts(saved).getSnapshot().length, 1)
})

test('should fire target alerts inclusively once, persist results, and rearm explicitly', () => {
  let writes = 0
  const store = createTargetAlerts([], () => {
    writes += 1
  })
  store.add({ id: 'up', symbol: 'BTCUSDT', target: 102, direction: 'above' })
  store.add({ id: 'down', symbol: 'BTCUSDT', target: 98, direction: 'below' })
  store.update(market(100), 1000)
  assert.equal(store.getSnapshot()[0].triggeredPrice, undefined)
  store.update(market(102), 1000)
  assert.equal(store.getSnapshot()[0].triggeredPrice, 102)
  const count = writes
  store.update(market(103), 1000)
  assert.equal(writes, count)
  store.update(market(98), 1000)
  assert.equal(store.getSnapshot()[1].triggeredPrice, 98)
  const restored = createTargetAlerts(store.getSnapshot())
  restored.update(market(110), 1000)
  assert.equal(restored.getSnapshot()[0].triggeredPrice, 102)
  restored.rearm('up')
  restored.update(market(110), 1000)
  assert.equal(restored.getSnapshot()[0].triggeredPrice, 110)
  restored.remove('up')
  assert.equal(restored.getSnapshot().length, 1)
})

test('should ignore disconnected, missing and stale quotes and cap storage', () => {
  const store = createTargetAlerts()
  store.add({ id: '1', symbol: 'BTCUSDT', target: 90, direction: 'above' })
  store.update({ ...market(100), status: 'reconnecting' }, 1000)
  store.update({ ...market(100), quotes: {} }, 1000)
  store.update(market(100), 31000)
  assert.equal(store.getSnapshot()[0].triggeredPrice, undefined)
  store.update(market(100), 1000)
  assert.equal(store.getSnapshot()[0].triggeredPrice, 100)
  for (let index = 2; index <= 25; index += 1)
    store.add({ id: String(index), symbol: 'BTCUSDT', target: 90, direction: 'above' })
  assert.equal(store.getSnapshot().length, 20)
})

