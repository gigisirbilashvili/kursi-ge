import assert from 'node:assert/strict'
import { test } from '@jest/globals'

import { createAlertTracker } from './createAlertTracker'
import type { IMarketSnapshot } from '../../../entities/currency/types/index'

const snapshot = (percentageChange: number, eventTime: number): IMarketSnapshot => ({
  history: {},
  status: 'connected',
  message: null,
  retryAt: null,
  quotes: {
    BTCUSDT: {
      initialPrice: 100,
      previousPrice: 100,
      price: 100 + percentageChange,
      direction: percentageChange >= 0 ? 'up' : 'down',
      percentageChange,
      eventTime,
      receivedAt: eventTime,
    },
  },
})

test('should trigger significant alerts at both thresholds, stay quiet beyond them, and rearm inside range', () => {
  const tracker = createAlertTracker()
  tracker.update(snapshot(1.99, 1))
  assert.equal(tracker.getSnapshot().length, 0)
  tracker.update(snapshot(2, 2))
  assert.equal(tracker.getSnapshot().length, 1)
  assert.equal(tracker.getSnapshot()[0].direction, 'increased')
  tracker.update(snapshot(3, 3))
  assert.equal(tracker.getSnapshot().length, 1)
  tracker.dismiss(tracker.getSnapshot()[0].id)
  tracker.update(snapshot(4, 4))
  assert.equal(tracker.getSnapshot().length, 0)
  tracker.update(snapshot(0, 5))
  tracker.update(snapshot(-2, 6))
  assert.equal(tracker.getSnapshot()[0].direction, 'decreased')
  tracker.update(snapshot(-3, 6))
  assert.equal(tracker.getSnapshot().length, 1)
})
