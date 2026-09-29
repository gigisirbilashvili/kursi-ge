import assert from 'node:assert/strict'
import { describe, test } from '@jest/globals'

import {
  CONNECT_TIMEOUT_MS,
  MAX_RETRY_DELAY_MS,
  STALE_TIMEOUT_MS,
} from '../config/constants'
import { createMarketFeed } from './createMarketFeed'
import type { IMarketSocket } from '../types/index'

describe('createMarketFeed', () => {
  const TEST_STREAM_ENDPOINT = 'market-stream-endpoint'

  function message(price: string, eventTime = 1, symbol = 'BTCUSDT') {
    return JSON.stringify({
      stream: `${symbol.toLowerCase()}@miniTicker`,
      data: { e: '24hrMiniTicker', s: symbol, c: price, E: eventTime },
    })
  }

  function setup() {
    const sent: string[] = []
    const urls: string[] = []
    const sockets: IMarketSocket[] = []
    const closed = new Set<IMarketSocket>()
    const tasks = new Map<ReturnType<typeof setTimeout>, { callback: () => void; delay: number }>()
    let sequence = 0
    const feed = createMarketFeed({
      streamEndpoint: TEST_STREAM_ENDPOINT,
      createSocket(url) {
        urls.push(url)
        assert.ok(url.startsWith(`${TEST_STREAM_ENDPOINT}?streams=`))
        const socket: IMarketSocket = {
          onopen: null,
          onmessage: null,
          onclose: null,
          onerror: null,
          send(data) {
            sent.push(data)
          },
          close() {
            closed.add(socket)
          },
        }
        sockets.push(socket)
        return socket
      },
      now: () => 100_000,
      schedule(callback, delay) {
        const id = ++sequence as unknown as ReturnType<typeof setTimeout>
        tasks.set(id, { callback, delay })
        return id
      },
      cancel(id) {
        tasks.delete(id)
      },
    })
    const next = (delay?: number) => {
      const first = [...tasks.entries()].find(([, task]) => delay === undefined || task.delay === delay)
      assert.ok(first)
      tasks.delete(first[0])
      first[1].callback()
    }
    return { feed, sockets, closed, tasks, next, sent, urls }
  }

  test('should track initial, previous and current prices without stale or duplicate updates', () => {
    const { feed, sockets } = setup()
    feed.start()
    sockets[0].onopen?.()
    assert.equal(feed.getSnapshot().status, 'connecting')
    sockets[0].onmessage?.(message('100'))
    sockets[0].onmessage?.(message('103', 2))
    assert.equal(feed.getSnapshot().quotes.BTCUSDT.percentageChange, 3)
    sockets[0].onmessage?.(message('102', 3))
    const quote = feed.getSnapshot().quotes.BTCUSDT
    assert.equal(quote.initialPrice, 100)
    assert.equal(quote.previousPrice, 103)
    assert.equal(quote.direction, 'down')
    assert.equal(quote.percentageChange, 2)
    sockets[0].onmessage?.(message('1', 2))
    sockets[0].onmessage?.(message('1', 3))
    assert.equal(feed.getSnapshot().quotes.BTCUSDT, quote)
    sockets[0].onmessage?.(message('102', 4))
    assert.equal(feed.getSnapshot().quotes.BTCUSDT.direction, 'unchanged')
    sockets[0].onmessage?.(message('98', 5))
    assert.equal(feed.getSnapshot().quotes.BTCUSDT.percentageChange, -2)
    feed.stop()
  })

  test('should reconnect with capped backoff, preserve prices and ignore old socket callbacks', () => {
    const { feed, sockets, closed, tasks, next } = setup()
    feed.start()
    sockets[0].onmessage?.(message('100'))
    const oldMessage = sockets[0].onmessage
    const oldClose = sockets[0].onclose
    sockets[0].onerror?.()
    oldClose?.()
    assert.equal(tasks.size, 1)
    assert.equal(feed.getSnapshot().status, 'reconnecting')
    assert.equal(feed.getSnapshot().retryAt, 101_000)
    assert.ok(closed.has(sockets[0]))
    next()
    oldMessage?.(message('999', 10))
    sockets[1].onmessage?.(message('104', 2))
    assert.equal(feed.getSnapshot().quotes.BTCUSDT.initialPrice, 100)
    assert.equal(feed.getSnapshot().quotes.BTCUSDT.percentageChange, 4)
    for (let attempt = 0; attempt < 8; attempt += 1) {
      sockets.at(-1)?.onclose?.()
      assert.equal([...tasks.values()][0].delay, Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS))
      next()
    }
    feed.stop()
    assert.equal(tasks.size, 0)
  })

  test('should recover from malformed data and time out silent connections', () => {
    const { feed, sockets, tasks, next } = setup()
    feed.start()
    assert.equal([...tasks.values()][0].delay, CONNECT_TIMEOUT_MS)
    sockets[0].onopen?.()
    assert.equal([...tasks.values()][0].delay, STALE_TIMEOUT_MS)
    sockets[0].onmessage?.('invalid')
    assert.equal(feed.getSnapshot().status, 'error')
    assert.equal(Object.keys(feed.getSnapshot().quotes).length, 0)
    sockets[0].onmessage?.(message('100'))
    assert.equal(feed.getSnapshot().status, 'connected')
    next()
    assert.equal(feed.getSnapshot().status, 'reconnecting')
    assert.equal(feed.getSnapshot().quotes.BTCUSDT.price, 100)
    feed.stop()
  })

  test('should handle offline state, manual retry and Strict Mode start/stop without leaked sockets', () => {
    const { feed, sockets, closed, tasks } = setup()
    feed.start(false)
    assert.equal(feed.getSnapshot().status, 'disconnected')
    assert.equal(sockets.length, 0)
    feed.retry()
    assert.equal(sockets.length, 0)
    feed.setOnline(true)
    feed.start()
    assert.equal(sockets.length, 1)
    const callback = sockets[0].onclose
    feed.stop()
    callback?.()
    assert.equal(tasks.size, 0)
    feed.start()
    assert.equal(sockets.length, 2)
    feed.retry()
    assert.equal(sockets.length, 3)
    assert.ok(closed.has(sockets[1]))
    feed.setOnline(false)
    assert.equal(feed.getSnapshot().status, 'disconnected')
    assert.equal(tasks.size, 0)
    feed.stop()
    assert.equal(closed.size, sockets.length)
  })

  test('should retry constructor failures and unsubscribe subscribers cleanly', () => {
    const { feed, sockets } = setup()
    let count = 0
    const unsubscribe = feed.subscribe(() => {
      count += 1
    })
    feed.start()
    assert.equal(count, 1)
    unsubscribe()
    sockets[0].onmessage?.(message('1'))
    assert.equal(count, 1)
    feed.stop()
    const brokenFeed = createMarketFeed({
      streamEndpoint: TEST_STREAM_ENDPOINT,
      createSocket() {
        throw new Error('Unavailable')
      },
    })
    brokenFeed.start()
    assert.equal(brokenFeed.getSnapshot().status, 'reconnecting')
    brokenFeed.stop()
  })

  test('should change subscriptions on the same socket and ignore removed pairs', () => {
    const { feed, sockets, tasks, sent, urls } = setup()
    const flush = () => {
      const task = [...tasks.entries()].find(([, value]) => value.delay === 500)
      assert.ok(task)
      tasks.delete(task[0])
      task[1].callback()
    }
    feed.start()
    sockets[0].onopen?.()
    sockets[0].onmessage?.(message('100'))
    feed.setSymbols(['ETHUSDT', 'ADAUSDT'])
    assert.equal(feed.getSnapshot().quotes.BTCUSDT, undefined)
    assert.equal(feed.getSnapshot().history.BTCUSDT, undefined)
    flush()
    assert.deepEqual(JSON.parse(sent[0]), {
      method: 'UNSUBSCRIBE',
      params: [
        'btcusdt@miniTicker',
        'solusdt@miniTicker',
        'bnbusdt@miniTicker',
        'xrpusdt@miniTicker',
      ],
      id: 1,
    })
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 1 }))
    assert.equal(feed.getSnapshot().status, 'connected')
    flush()
    assert.deepEqual(JSON.parse(sent[1]), {
      method: 'SUBSCRIBE',
      params: ['adausdt@miniTicker'],
      id: 2,
    })
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 2 }))
    sockets[0].onmessage?.(message('200', 2))
    assert.equal(feed.getSnapshot().quotes.BTCUSDT, undefined)
    sockets[0].onmessage?.(message('0.5', 3, 'ADAUSDT'))
    assert.equal(feed.getSnapshot().quotes.ADAUSDT.price, 0.5)
    assert.equal(sockets.length, 1)
    feed.retry()
    assert.equal(
      urls[1],
      `${TEST_STREAM_ENDPOINT}?streams=ethusdt@miniTicker/adausdt@miniTicker`,
    )
    feed.stop()
    assert.equal(tasks.size, 0)
  })

  test('should coalesce rapid selection changes and handle rejected subscription requests', () => {
    const { feed, sockets, tasks, sent } = setup()
    feed.start()
    feed.setSymbols(['ETHUSDT'])
    feed.setSymbols(['ETHUSDT', 'ADAUSDT'])
    sockets[0].onopen?.()
    const task = [...tasks.entries()].find(([, value]) => value.delay === 500)
    assert.ok(task)
    tasks.delete(task[0])
    task[1].callback()
    assert.equal(sent.length, 1)
    sockets[0].onmessage?.(JSON.stringify({ code: 2, msg: 'Rejected', id: 1 }))
    assert.equal(feed.getSnapshot().status, 'reconnecting')
    feed.stop()
    assert.equal(tasks.size, 0)
  })

  test('should retain bounded chronological session history and preserve it through reconnects', () => {
    const { feed, sockets } = setup()
    feed.start()
    for (let index = 1; index <= 400; index += 1)
      sockets[0].onmessage?.(message(String(index), index))
    assert.equal(feed.getSnapshot().history.BTCUSDT.length, 360)
    assert.deepEqual(feed.getSnapshot().history.BTCUSDT[0], { time: 41, price: 41 })
    sockets[0].onmessage?.(message('999', 400))
    assert.equal(feed.getSnapshot().history.BTCUSDT.at(-1)?.price, 400)
    feed.retry()
    sockets[1].onmessage?.(message('401', 401))
    assert.equal(feed.getSnapshot().history.BTCUSDT.length, 360)
    assert.equal(feed.getSnapshot().quotes.BTCUSDT.initialPrice, 1)
    feed.stop()
  })

  test('should time out an unopened socket and ignore every callback from that generation', () => {
    const { feed, sockets, closed, tasks, next } = setup()
    feed.start()
    const oldOpen = sockets[0].onopen
    const oldMessage = sockets[0].onmessage
    const oldClose = sockets[0].onclose
    const oldError = sockets[0].onerror
    const oldTimeout = [...tasks.values()][0].callback
    next(CONNECT_TIMEOUT_MS)
    assert.ok(closed.has(sockets[0]))
    assert.equal(feed.getSnapshot().message, 'The market connection timed out. Retrying automatically.')
    assert.equal(feed.getSnapshot().retryAt, 101_000)
    next(1000)
    const snapshot = feed.getSnapshot()
    oldOpen?.()
    oldMessage?.(message('999'))
    oldClose?.()
    oldError?.()
    oldTimeout()
    assert.equal(feed.getSnapshot(), snapshot)
    assert.equal(sockets.length, 2)
    assert.equal(tasks.size, 1)
    assert.equal([...tasks.values()][0].delay, CONNECT_TIMEOUT_MS)
    feed.stop()
  })

  test('should reconnect an open socket that never receives valid prices', () => {
    const { feed, sockets, tasks, next } = setup()
    feed.start()
    sockets[0].onopen?.()
    assert.equal(tasks.size, 1)
    assert.equal([...tasks.values()][0].delay, STALE_TIMEOUT_MS)
    sockets[0].onmessage?.('{}')
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 99 }))
    next(STALE_TIMEOUT_MS)
    assert.equal(feed.getSnapshot().message, 'No valid market prices received. Retrying automatically.')
    assert.equal(tasks.size, 1)
    feed.stop()
  })

  test('should reset the stale timeout only for a newer desired market tick', () => {
    const { feed, sockets, tasks } = setup()
    feed.start()
    sockets[0].onopen?.()
    sockets[0].onmessage?.(message('100', 2))
    const staleTimer = [...tasks.keys()][0]
    sockets[0].onmessage?.(message('99', 1))
    sockets[0].onmessage?.(message('101', 2))
    sockets[0].onmessage?.(message('1', 3, 'ADAUSDT'))
    sockets[0].onmessage?.('invalid')
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 1 }))
    assert.deepEqual([...tasks.keys()], [staleTimer])
    sockets[0].onmessage?.(message('102', 3))
    assert.equal(tasks.size, 1)
    assert.equal(tasks.has(staleTimer), false)
    assert.equal(feed.getSnapshot().status, 'connected')
    feed.stop()
  })

  test.each(['close', 'error'] as const)(
    'should schedule only one reconnect after repeated socket %s and error callbacks',
    (event) => {
      const { feed, sockets, tasks, next } = setup()
      feed.start()
      const close = sockets[0].onclose
      const error = sockets[0].onerror
      if (event === 'close') close?.()
      else error?.()
      const snapshot = feed.getSnapshot()
      close?.()
      error?.()
      close?.()
      assert.equal(feed.getSnapshot(), snapshot)
      assert.equal(tasks.size, 1)
      assert.equal([...tasks.values()][0].delay, 1000)
      next(1000)
      assert.equal(sockets.length, 2)
      sockets[1].onclose?.()
      assert.equal([...tasks.values()][0].delay, 2000)
      feed.stop()
    },
  )

  test('should cancel a pending reconnect while offline and reconnect immediately when online', () => {
    const { feed, sockets, tasks } = setup()
    feed.start()
    sockets[0].onerror?.()
    const oldReconnect = [...tasks.values()][0].callback
    feed.setOnline(false)
    assert.equal(feed.getSnapshot().status, 'disconnected')
    assert.equal(feed.getSnapshot().retryAt, null)
    assert.equal(tasks.size, 0)
    oldReconnect()
    feed.retry()
    assert.equal(sockets.length, 1)
    feed.setOnline(true)
    oldReconnect()
    assert.equal(sockets.length, 2)
    assert.equal(tasks.size, 1)
    sockets[1].onerror?.()
    assert.equal(feed.getSnapshot().retryAt, 101_000)
    feed.stop()
  })

  test('should retain the subscription acknowledgement deadline while market ticks arrive', () => {
    const { feed, sockets, tasks, next, urls } = setup()
    feed.start()
    sockets[0].onopen?.()
    feed.setSymbols(['ETHUSDT'])
    next(500)
    const acknowledgementTimer = [...tasks.entries()].find(([, task]) => task.delay === CONNECT_TIMEOUT_MS)
    assert.ok(acknowledgementTimer)
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 99 }))
    sockets[0].onmessage?.(message('200', 1, 'ETHUSDT'))
    assert.equal(tasks.has(acknowledgementTimer[0]), true)
    assert.equal(tasks.size, 2)
    next(CONNECT_TIMEOUT_MS)
    assert.equal(feed.getSnapshot().message, 'Binance did not confirm the pair change. Retrying automatically.')
    assert.equal(tasks.size, 1)
    next(1000)
    assert.equal(urls[1], `${TEST_STREAM_ENDPOINT}?streams=ethusdt@miniTicker`)
    feed.stop()
  })

  test('should wait for acknowledgement before applying the latest desired subscriptions', () => {
    const { feed, sockets, tasks, next, sent } = setup()
    feed.start()
    sockets[0].onopen?.()
    feed.setSymbols(['ETHUSDT'])
    next(500)
    feed.setSymbols(['ETHUSDT', 'ADAUSDT'])
    feed.setSymbols(['ETHUSDT', 'LINKUSDT'])
    assert.equal(sent.length, 1)
    assert.equal([...tasks.values()].some((task) => task.delay === 500), false)
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 1 }))
    assert.equal([...tasks.values()].some((task) => task.delay === CONNECT_TIMEOUT_MS), false)
    next(500)
    assert.deepEqual(JSON.parse(sent[1]), {
      method: 'SUBSCRIBE',
      params: ['linkusdt@miniTicker'],
      id: 2,
    })
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 1 }))
    assert.equal([...tasks.values()].some((task) => task.delay === CONNECT_TIMEOUT_MS), true)
    sockets[0].onmessage?.(JSON.stringify({ result: null, id: 2 }))
    assert.equal(tasks.size, 1)
    assert.equal([...tasks.values()][0].delay, STALE_TIMEOUT_MS)
    feed.stop()
  })

  test('should reconnect when sending a subscription request fails', () => {
    const { feed, sockets, tasks, next } = setup()
    feed.start()
    sockets[0].onopen?.()
    sockets[0].send = () => { throw new Error('Socket closed') }
    feed.setSymbols(['ETHUSDT'])
    next(500)
    assert.equal(feed.getSnapshot().message, 'Could not update market subscriptions. Retrying automatically.')
    assert.equal(tasks.size, 1)
    next(1000)
    assert.equal(sockets.length, 2)
    feed.stop()
  })

  test.each(['debounce', 'acknowledgement'] as const)(
    'should clear subscription %s and stale timers on stop and ignore their old callbacks',
    (stage) => {
      const { feed, sockets, tasks, next, sent } = setup()
      feed.start()
      sockets[0].onopen?.()
      feed.setSymbols(['ETHUSDT'])
      if (stage === 'acknowledgement') next(500)
      const oldCallbacks = [...tasks.values()].map((task) => task.callback)
      const sentCount = sent.length
      assert.equal(tasks.size, 2)
      feed.stop()
      assert.equal(tasks.size, 0)
      feed.start()
      const snapshot = feed.getSnapshot()
      oldCallbacks.forEach((callback) => callback())
      assert.equal(feed.getSnapshot(), snapshot)
      assert.equal(sent.length, sentCount)
      assert.equal(tasks.size, 1)
      assert.equal(sockets.length, 2)
      feed.stop()
    },
  )
})
