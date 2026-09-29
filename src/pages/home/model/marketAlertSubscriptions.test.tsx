import { afterEach, expect, jest, test } from '@jest/globals'
import { act, cleanup, renderHook } from '@testing-library/react'

import { MarketFeedContext } from '../../../entities/currency/model/marketFeedContext'
import { createMarketFeedFixture } from '../../../entities/currency/model/testing/createMarketFeedFixture'
import type { IMarketSnapshot } from '../../../entities/currency'
import { useSignificantAlerts } from '../../../features/significant-alerts'
import { useTargetAlerts } from '../../../features/target-alerts'
import { notify } from '../../../shared/lib/notify'

afterEach(() => {
  cleanup()
  localStorage.clear()
  jest.restoreAllMocks()
})

test('should evaluate threshold crossings even when multiple ticks arrive before React renders', () => {
  localStorage.clear()
  jest.spyOn(notify, 'success').mockReturnValue('test')
  const market = (price: number, eventTime: number): IMarketSnapshot => ({
    status: 'connected', history: {}, message: null, retryAt: null,
    quotes: { BTCUSDT: {
      price, initialPrice: 100, previousPrice: 100, direction: 'up',
      percentageChange: price - 100, receivedAt: Date.now(), eventTime,
    } },
  })
  const { feed, publish } = createMarketFeedFixture(market(100, 1))
  const { result, unmount } = renderHook(() => ({
    session: useSignificantAlerts(),
    target: useTargetAlerts(),
  }), {
    wrapper: ({ children }) => <MarketFeedContext.Provider value={feed}>{children}</MarketFeedContext.Provider>,
  })
  act(() => {
    result.current.target.add({ id: 'target', symbol: 'BTCUSDT', target: 102, direction: 'above' })
    publish(market(103, 2))
    publish(market(101, 3))
  })
  expect(result.current.session.alerts).toHaveLength(1)
  expect(result.current.session.alerts[0].currentPrice).toBe(103)
  expect(result.current.target.alerts[0].triggeredPrice).toBe(103)
  act(() => { result.current.target.rearm('target') })
  const saved = localStorage.getItem('kursi-target-alerts-v1')
  unmount()
  act(() => { publish(market(104, 4)) })
  expect(localStorage.getItem('kursi-target-alerts-v1')).toBe(saved)
})
