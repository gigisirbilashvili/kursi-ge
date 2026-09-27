import { StrictMode } from 'react'
import { afterEach, expect, jest, test } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { notify } from '../../../shared/lib/notify'
import type { IMarketSnapshot } from '../types'
import { useMarketNotifications } from './useMarketNotifications'

afterEach(() => {
  jest.restoreAllMocks()
})

test('should notify once per connection failure and announce recovery', () => {
  const error = jest.spyOn(notify, 'error').mockReturnValue('market-connection')
  const success = jest.spyOn(notify, 'success').mockReturnValue('market-connection')
  const initial: IMarketSnapshot = {
    status: 'reconnecting', message: 'Retrying connection.', retryAt: 1000, quotes: {}, history: {},
  }
  const { rerender } = renderHook((snapshot: IMarketSnapshot) => useMarketNotifications(snapshot), {
    initialProps: initial,
    wrapper: StrictMode,
  })
  rerender({ ...initial, retryAt: 2000 })
  expect(error).toHaveBeenCalledTimes(1)

  rerender({ ...initial, status: 'connected', message: null })
  expect(success).toHaveBeenCalledWith('Live market prices are connected again.', {
    toastId: 'market-connection',
  })
  expect(success).toHaveBeenCalledTimes(1)
  rerender({ ...initial, status: 'connected', message: null, retryAt: null })
  expect(success).toHaveBeenCalledTimes(1)

  rerender(initial)
  expect(error).toHaveBeenCalledTimes(2)
})
