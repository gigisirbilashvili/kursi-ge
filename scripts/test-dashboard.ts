import assert from 'node:assert/strict'
import { test } from 'node:test'

import { CURRENCIES } from '../src/entities/currency/config/constants.ts'
import {
  normalizePreferences,
  selectCurrencies,
} from '../src/features/market-preferences/lib/preferences.ts'
import { createAlertTracker } from '../src/features/significant-alerts/lib/createAlertTracker.ts'
import type { IMarketSnapshot } from '../src/entities/currency/types/index.ts'

const symbolSet = new Set(CURRENCIES.map(({ symbol }) => symbol))
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

await test('market preferences accept only supported symbols and filter, sort and search accurately', () => {
  const preferences = normalizePreferences(
    { favorites: ['BTCUSDT', 'BTCUSDT', 'FAKE'], hidden: ['ETHUSDT', 42] },
    symbolSet,
  )
  assert.deepEqual(preferences, { favorites: ['BTCUSDT'], hidden: ['ETHUSDT'] })
  assert.deepEqual(
    selectCurrencies(
      CURRENCIES,
      snapshot(3, 1),
      preferences,
      'btc',
      'favorites',
      'price',
      'desc',
    ).map(({ ticker }) => ticker),
    ['BTC'],
  )
  assert.deepEqual(
    selectCurrencies(CURRENCIES, snapshot(3, 1), preferences, 'eth', 'all', 'name', 'asc'),
    [],
  )
  assert.equal(
    selectCurrencies(CURRENCIES, snapshot(3, 1), preferences, '', 'all', 'price', 'asc').at(-1)
      ?.ticker,
    'XRP',
  )
})

await test('significant alerts trigger at both thresholds, stay quiet beyond them, and rearm inside range', () => {
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
