import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createPriceToastQueue } from '../src/pages/home/lib/createPriceToastQueue.ts'
import {
  createTargetAlerts,
  parseTarget,
} from '../src/features/target-alerts/lib/createTargetAlerts.ts'
import type { IMarketSnapshot } from '../src/entities/currency/types/index.ts'

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

await test('validates target prices and stored alerts', () => {
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

await test('target alerts fire inclusively once, persist results, and rearm explicitly', () => {
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

await test('target alerts ignore disconnected, missing and stale quotes and cap storage', () => {
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

await test('queues fresh price toasts once, including rearmed targets, without replaying saved alerts', () => {
  const saved = [
    {
      id: 'saved',
      symbol: 'BTCUSDT',
      target: 90,
      direction: 'above' as const,
      triggeredPrice: 100,
      triggerCount: 1,
    },
  ]
  const queue = createPriceToastQueue(saved)
  queue.update([], saved)
  assert.equal(queue.getSnapshot().length, 0)

  const session = [
    {
      id: 1,
      symbol: 'BTCUSDT',
      initialPrice: 100,
      currentPrice: 102,
      percentageChange: 2,
      direction: 'increased' as const,
    },
  ]
  const triggered = { ...saved[0], triggerCount: 2, triggeredPrice: 101 }
  queue.update(session, [triggered])
  assert.equal(queue.getSnapshot().length, 2)
  assert.match(queue.getSnapshot()[0].message, /increased 2.00%/)
  assert.match(queue.getSnapshot()[1].message, /reached your at or above/)

  queue.update(session, [triggered])
  assert.equal(queue.getSnapshot().length, 2)
  queue.dismiss(queue.getSnapshot()[0].id)
  assert.equal(queue.getSnapshot().length, 1)
  queue.update(session, [triggered])
  assert.equal(queue.getSnapshot().length, 1)
})
