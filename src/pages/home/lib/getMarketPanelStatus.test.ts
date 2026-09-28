import assert from 'node:assert/strict'
import { test } from '@jest/globals'

import { STALE_TIMEOUT_MS } from '../../../entities/currency'
import type { IMarketSnapshot, TMarketStatus } from '../../../entities/currency'
import { getMarketPanelStatus } from './getMarketPanelStatus'

function snapshot(status: TMarketStatus): IMarketSnapshot {
  return { status, quotes: {}, history: {}, message: null, retryAt: null }
}

test('should distinguish waiting, connected and unavailable states without prices', () => {
  for (const status of ['connecting', 'connected', 'reconnecting', 'disconnected', 'error'] as const) {
    const result = getMarketPanelStatus(snapshot(status), 100_000)
    assert.equal(result.hasPrices, false)
    assert.equal(result.isConnected, status === 'connected')
    assert.equal(result.isWaiting, status === 'connecting' || status === 'reconnecting')
    assert.equal(result.isUnavailable, status !== 'connected' && status !== 'connecting')
    assert.equal(result.age, null)
    assert.equal(result.isQuoteStale('BTCUSDT'), true)
  }
})

test('should age quotes independently at the stale boundary and use the newest update for the footer', () => {
  const market = snapshot('connected')
  const quote = {
    initialPrice: 100, previousPrice: 100, price: 101, direction: 'up' as const,
    percentageChange: 1, eventTime: 1, receivedAt: 100_000,
  }
  market.quotes = { BTCUSDT: quote, ETHUSDT: { ...quote, receivedAt: 110_000 } }
  assert.equal(getMarketPanelStatus(market, 100_000 + STALE_TIMEOUT_MS - 1).isQuoteStale('BTCUSDT'), false)
  const result = getMarketPanelStatus(market, 100_000 + STALE_TIMEOUT_MS)
  assert.equal(result.isQuoteStale('BTCUSDT'), true)
  assert.equal(result.isQuoteStale('ETHUSDT'), false)
  assert.equal(result.age, 20)
  assert.equal(getMarketPanelStatus(market, 90_000).age, 0)
  const reconnecting = getMarketPanelStatus({ ...market, status: 'reconnecting' }, 110_000)
  assert.equal(reconnecting.hasPrices, true)
  assert.equal(reconnecting.isWaiting, false)
  assert.equal(reconnecting.isQuoteStale('ETHUSDT'), true)
})
