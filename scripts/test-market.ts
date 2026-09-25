import assert from 'node:assert/strict'
import { test } from 'node:test'

import { parseMarketMessage } from '../src/entities/currency/api/parseMarketMessage.ts'
import {
  CONNECT_TIMEOUT_MS,
  MAX_RETRY_DELAY_MS,
  STALE_TIMEOUT_MS,
} from '../src/entities/currency/config/constants.ts'
import { createMarketFeed } from '../src/entities/currency/model/createMarketFeed.ts'
import type { IMarketSocket } from '../src/entities/currency/types/index.ts'

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
    createSocket(url) {
      urls.push(url)
      assert.ok(url.startsWith('wss://data-stream.binance.vision/stream?streams='))
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
  const next = () => {
    const first = tasks.entries().next().value
    assert.ok(first)
    tasks.delete(first[0])
    first[1].callback()
  }
  return { feed, sockets, closed, tasks, next, sent, urls }
}

await test('parses only valid supported Binance prices', () => {
  assert.deepEqual(parseMarketMessage(message('123.45')), {
    symbol: 'BTCUSDT',
    price: 123.45,
    eventTime: 1,
  })
  for (const price of ['0', '-1', '', 'Infinity', 'NaN', '1e3', ' 2 '])
    assert.equal(parseMarketMessage(message(price)), null)
  for (const value of [
    'not json',
    'null',
    '{}',
    message('2', 1, 'FAKEUSDT'),
    message('2', -1),
    message('2', 1.5),
    123,
    null,
  ])
    assert.equal(parseMarketMessage(value), null)
  assert.equal(
    parseMarketMessage(
      JSON.stringify({
        stream: 'ethusdt@miniTicker',
        data: { e: '24hrMiniTicker', s: 'BTCUSDT', c: '5', E: 1 },
      }),
    ),
    null,
  )
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
    createSocket() {
      throw new Error('Unavailable')
    },
  })
  brokenFeed.start()
  assert.equal(brokenFeed.getSnapshot().status, 'reconnecting')
  brokenFeed.stop()
})

await test('changes subscriptions on the same socket and ignores removed pairs', () => {
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
    'wss://data-stream.binance.vision/stream?streams=ethusdt@miniTicker/adausdt@miniTicker',
  )
  feed.stop()
  assert.equal(tasks.size, 0)
})

await test('coalesces rapid selection changes and handles rejected subscription requests', () => {
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

await test('retains bounded chronological session history and preserves it through reconnects', () => {
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
