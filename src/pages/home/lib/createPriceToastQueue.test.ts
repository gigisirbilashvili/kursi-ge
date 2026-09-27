import assert from 'node:assert/strict'
import { test } from '@jest/globals'

import { createPriceToastQueue } from './createPriceToastQueue'

test('should queue fresh price toasts once, including rearmed targets, without replaying saved alerts', () => {
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
