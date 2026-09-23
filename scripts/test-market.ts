import assert from 'node:assert/strict'
import { test } from 'node:test'

import { parseMarketMessage } from '../src/entities/currency/api/parseMarketMessage.ts'
import { CONNECT_TIMEOUT_MS, MARKET_STREAM_URL, MAX_RETRY_DELAY_MS, STALE_TIMEOUT_MS } from '../src/entities/currency/config/constants.ts'
import { createMarketFeed } from '../src/entities/currency/model/createMarketFeed.ts'
import type { IMarketSocket } from '../src/entities/currency/types/index.ts'

function message(price: string, eventTime = 1, symbol = 'BTCUSDT') {
  return JSON.stringify({ stream: `${symbol.toLowerCase()}@miniTicker`, data: { e: '24hrMiniTicker', s: symbol, c: price, E: eventTime } })
}

function setup() {
  const sockets: IMarketSocket[] = []
  const closed = new Set<IMarketSocket>()
  const tasks = new Map<ReturnType<typeof setTimeout>, { callback: () => void; delay: number }>()
  let sequence = 0
  const feed = createMarketFeed({
    createSocket(url) {
      assert.equal(url, MARKET_STREAM_URL)
      const socket: IMarketSocket = {
        onopen: null, onmessage: null, onclose: null, onerror: null,
        close() { closed.add(socket) },
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
    cancel(id) { tasks.delete(id) },
  })
  const next = () => {
    const first = tasks.entries().next().value
    assert.ok(first)
    tasks.delete(first[0])
    first[1].callback()
  }
  return { feed, sockets, closed, tasks, next }
}

await test('parses only valid supported Binance prices', () => {
  assert.deepEqual(parseMarketMessage(message('123.45')), { symbol: 'BTCUSDT', price: 123.45, eventTime: 1 })
  for (const price of ['0', '-1', '', 'Infinity', 'NaN', '1e3', ' 2 ']) assert.equal(parseMarketMessage(message(price)), null)
  for (const value of ['not json', 'null', '{}', message('2', 1, 'FAKEUSDT'), message('2', -1), message('2', 1.5), 123, null]) assert.equal(parseMarketMessage(value), null)
  assert.equal(parseMarketMessage(JSON.stringify({ stream: 'ethusdt@miniTicker', data: { e: '24hrMiniTicker', s: 'BTCUSDT', c: '5', E: 1 } })), null)
})

await test('tracks initial, previous and current prices without stale or duplicate updates', () => {
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

await test('reconnects with capped backoff, preserves prices and ignores old socket callbacks', () => {
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

await test('recovers from malformed data and times out silent connections', () => {
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

await test('handles offline state, manual retry and Strict Mode start/stop without leaked sockets', () => {
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

await test('constructor failures retry and subscribers unsubscribe cleanly', () => {
  const { feed, sockets } = setup()
  let count = 0
  const unsubscribe = feed.subscribe(() => { count += 1 })
  feed.start()
  assert.equal(count, 1)
  unsubscribe()
  sockets[0].onmessage?.(message('1'))
  assert.equal(count, 1)
  feed.stop()
  const brokenFeed = createMarketFeed({ createSocket() { throw new Error('Unavailable') } })
  brokenFeed.start()
  assert.equal(brokenFeed.getSnapshot().status, 'reconnecting')
  brokenFeed.stop()
})
