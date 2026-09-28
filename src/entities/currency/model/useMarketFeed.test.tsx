import { StrictMode } from 'react'
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { act, cleanup, renderHook } from '@testing-library/react'

import { notify } from '../../../shared/lib/notify'
import { STALE_TIMEOUT_MS } from '../config/constants'
import type { IMarketSocket } from '../types'
import { useMarketFeed } from './useMarketFeed'

const TEST_STREAM_ENDPOINT = 'market-stream-endpoint'

beforeEach(() => {
  jest.useFakeTimers()
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  jest.spyOn(notify, 'error').mockReturnValue('market-connection')
  jest.spyOn(notify, 'success').mockReturnValue('market-connection')
})

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
  jest.useRealTimers()
})

function setup() {
  const sockets: IMarketSocket[] = []
  const activeSockets = new Set<IMarketSocket>()
  const createSocket = jest.fn<(url: string) => IMarketSocket>(() => {
    const socket: IMarketSocket = {
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      send: jest.fn(),
      close: jest.fn(() => { activeSockets.delete(socket) }),
    }
    sockets.push(socket)
    activeSockets.add(socket)
    return socket
  })
  return { sockets, activeSockets, createSocket }
}

function tick(price = '100', eventTime = 1) {
  return JSON.stringify({
    stream: 'btcusdt@miniTicker',
    data: { e: '24hrMiniTicker', s: 'BTCUSDT', c: price, E: eventTime },
  })
}

test('should reuse one service and socket across renders while exposing current snapshots', () => {
  const { sockets, createSocket } = setup()
  const { result, rerender, unmount } = renderHook(
    (symbols: string[]) => useMarketFeed(symbols, TEST_STREAM_ENDPOINT, { createSocket }),
    { initialProps: ['BTCUSDT'] },
  )
  const retry = result.current.retry
  expect(result.current.snapshot.status).toBe('connecting')
  act(() => {
    sockets[0].onopen?.()
    sockets[0].onmessage?.(tick())
  })
  expect(result.current.snapshot.status).toBe('connected')
  expect(result.current.snapshot.quotes.BTCUSDT.price).toBe(100)
  const snapshot = result.current.snapshot
  rerender(['BTCUSDT'])
  rerender(['BTCUSDT'])
  expect(result.current.snapshot).toBe(snapshot)
  expect(result.current.retry).toBe(retry)
  expect(createSocket).toHaveBeenCalledTimes(1)
  expect(sockets[0].send).not.toHaveBeenCalled()
  unmount()
  expect(sockets[0].close).toHaveBeenCalledTimes(1)
  expect(jest.getTimerCount()).toBe(0)
})

test('should update subscriptions on the existing socket without duplicate requests on rerender', () => {
  const { sockets, createSocket } = setup()
  const { rerender, unmount } = renderHook(
    (symbols: string[]) => useMarketFeed(symbols, TEST_STREAM_ENDPOINT, { createSocket }),
    { initialProps: ['BTCUSDT'] },
  )
  act(() => { sockets[0].onopen?.() })
  rerender(['BTCUSDT', 'ETHUSDT'])
  rerender(['BTCUSDT', 'ETHUSDT'])
  act(() => { jest.advanceTimersByTime(500) })
  expect(sockets[0].send).toHaveBeenCalledTimes(1)
  expect(sockets[0].send).toHaveBeenCalledWith(JSON.stringify({
    method: 'SUBSCRIBE', params: ['ethusdt@miniTicker'], id: 1,
  }))
  act(() => { sockets[0].onmessage?.(JSON.stringify({ result: null, id: 1 })) })
  rerender(['BTCUSDT', 'ETHUSDT'])
  act(() => { jest.advanceTimersByTime(500) })
  expect(sockets[0].send).toHaveBeenCalledTimes(1)
  expect(createSocket).toHaveBeenCalledTimes(1)
  unmount()
  expect(jest.getTimerCount()).toBe(0)
})

test('should expose service errors and reconnect state and delegate manual retry', () => {
  const { sockets, createSocket, activeSockets } = setup()
  const { result, unmount } = renderHook(
    () => useMarketFeed(['BTCUSDT'], TEST_STREAM_ENDPOINT, { createSocket }),
  )
  act(() => {
    sockets[0].onopen?.()
    sockets[0].onmessage?.('invalid')
  })
  expect(result.current.snapshot.status).toBe('error')
  expect(result.current.snapshot.message).toBe('An invalid market update was ignored.')
  act(() => { sockets[0].onmessage?.(tick()) })
  act(() => { sockets[0].onerror?.() })
  expect(result.current.snapshot.status).toBe('reconnecting')
  expect(result.current.snapshot.retryAt).toBe(Date.now() + 1000)
  act(() => { result.current.retry() })
  expect(createSocket).toHaveBeenCalledTimes(2)
  expect(activeSockets.size).toBe(1)
  act(() => {
    sockets[1].onopen?.()
    sockets[1].onmessage?.(tick('102', 2))
    jest.advanceTimersByTime(1000)
  })
  expect(createSocket).toHaveBeenCalledTimes(2)
  expect(result.current.snapshot.status).toBe('connected')
  expect(result.current.snapshot.quotes.BTCUSDT.initialPrice).toBe(100)
  unmount()
  expect(jest.getTimerCount()).toBe(0)
})

test('should forward initial network state and online/offline events and remove listeners on unmount', () => {
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
  const addListener = jest.spyOn(window, 'addEventListener')
  const removeListener = jest.spyOn(window, 'removeEventListener')
  const { sockets, createSocket } = setup()
  const { result, unmount } = renderHook(
    () => useMarketFeed(['BTCUSDT'], TEST_STREAM_ENDPOINT, { createSocket }),
  )
  expect(result.current.snapshot.status).toBe('disconnected')
  expect(createSocket).not.toHaveBeenCalled()
  act(() => { result.current.retry() })
  expect(createSocket).not.toHaveBeenCalled()
  act(() => { window.dispatchEvent(new Event('online')) })
  expect(createSocket).toHaveBeenCalledTimes(1)
  act(() => { window.dispatchEvent(new Event('offline')) })
  expect(result.current.snapshot.status).toBe('disconnected')
  expect(sockets[0].close).toHaveBeenCalledTimes(1)
  expect(jest.getTimerCount()).toBe(0)
  unmount()
  for (const event of ['online', 'offline']) {
    const registration = addListener.mock.calls.find(([name]) => name === event)
    if (!registration) throw new Error(`Missing ${event} listener`)
    expect(removeListener).toHaveBeenCalledWith(event, registration[1])
  }
  act(() => { window.dispatchEvent(new Event('online')) })
  expect(createSocket).toHaveBeenCalledTimes(1)
})

test('should keep only one active socket through Strict Mode effect replay and ignore released callbacks', () => {
  const { sockets, createSocket, activeSockets } = setup()
  const { result, rerender, unmount } = renderHook(
    () => useMarketFeed(['BTCUSDT'], TEST_STREAM_ENDPOINT, { createSocket }),
    { wrapper: StrictMode },
  )
  expect(createSocket).toHaveBeenCalledTimes(2)
  expect(sockets[0].close).toHaveBeenCalledTimes(1)
  expect(sockets[0].onmessage).toBeNull()
  expect(activeSockets.size).toBe(1)
  const activeSocket = sockets[1]
  act(() => {
    activeSocket.onopen?.()
    activeSocket.onmessage?.(tick())
  })
  rerender()
  expect(createSocket).toHaveBeenCalledTimes(2)
  const oldClose = activeSocket.onclose
  const oldMessage = activeSocket.onmessage
  const snapshot = result.current.snapshot
  unmount()
  act(() => {
    oldClose?.()
    oldMessage?.(tick('999', 2))
    window.dispatchEvent(new Event('online'))
    jest.advanceTimersByTime(STALE_TIMEOUT_MS * 2)
  })
  expect(result.current.snapshot).toBe(snapshot)
  expect(createSocket).toHaveBeenCalledTimes(2)
  expect(activeSockets.size).toBe(0)
  expect(jest.getTimerCount()).toBe(0)
})

test('should cancel pending reconnects when the owning component unmounts', () => {
  const { sockets, createSocket, activeSockets } = setup()
  const { unmount } = renderHook(
    () => useMarketFeed(['BTCUSDT'], TEST_STREAM_ENDPOINT, { createSocket }),
  )
  act(() => { sockets[0].onerror?.() })
  expect(jest.getTimerCount()).toBe(1)
  unmount()
  act(() => { jest.advanceTimersByTime(STALE_TIMEOUT_MS * 2) })
  expect(createSocket).toHaveBeenCalledTimes(1)
  expect(activeSockets.size).toBe(0)
  expect(jest.getTimerCount()).toBe(0)
})
