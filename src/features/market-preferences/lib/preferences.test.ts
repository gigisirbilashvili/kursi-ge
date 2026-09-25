import assert from 'node:assert/strict'
import { test } from '@jest/globals'

import { CURRENCIES } from '../../../entities/currency/config/constants'
import {
  normalizePreferences,
  selectCurrencies,
} from './preferences'
import type { IMarketSnapshot } from '../../../entities/currency/types/index'

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

test('should accept only supported symbols and filter, sort and search accurately', () => {
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

