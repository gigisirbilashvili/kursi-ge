import { createBrowserSocket } from '../api/createBrowserSocket.ts'
import { parseMarketMessage } from '../api/parseMarketMessage.ts'
import {
  CONNECT_TIMEOUT_MS,
  AVAILABLE_CURRENCIES,
  CURRENCIES,
  HISTORY_LIMIT,
  INITIAL_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  STALE_TIMEOUT_MS,
} from '../config/constants.ts'
import { updateQuote } from '../lib/updateQuote.ts'
import type { IMarketFeedOptions, IMarketSnapshot, IMarketSocket } from '../types/index.ts'

export function createMarketFeed(options: IMarketFeedOptions) {
  const createSocket = options.createSocket ?? createBrowserSocket
  const now = options.now ?? Date.now
  const schedule = options.schedule ?? setTimeout
  const cancel = options.cancel ?? clearTimeout
  const listeners = new Set<() => void>()
  let snapshot: IMarketSnapshot = {
    status: 'connecting',
    quotes: {},
    history: {},
    message: null,
    retryAt: null,
  }
  const validSymbols = new Set(AVAILABLE_CURRENCIES.map(({ symbol }) => symbol))
  let symbols = new Set(
    options.symbols?.filter((symbol) => validSymbols.has(symbol)) ??
      CURRENCIES.map(({ symbol }) => symbol),
  )
  if (!symbols.size) symbols = new Set(CURRENCIES.map(({ symbol }) => symbol))
  let subscribed = new Set<string>()
  let isOpen = false
  let requestId = 0
  let pendingId: number | null = null
  let subscriptionTimer: ReturnType<typeof setTimeout> | undefined
  let socket: IMarketSocket | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let attempt = 0
  let isActive = false
  let isOnline = true
  let generation = 0

  function publish(patch: Partial<IMarketSnapshot>) {
    snapshot = { ...snapshot, ...patch }
    listeners.forEach((listener) => listener())
  }

  function release() {
    isOpen = false
    pendingId = null
    if (subscriptionTimer !== undefined) cancel(subscriptionTimer)
    subscriptionTimer = undefined
    generation += 1
    if (timer !== undefined) cancel(timer)
    timer = undefined
    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      socket.onerror = null
      socket.close()
      socket = null
    }
  }

  function queueSubscriptions() {
    if (!isOpen || pendingId !== null || subscriptionTimer !== undefined) return
    if (symbols.size === subscribed.size && [...symbols].every((symbol) => subscribed.has(symbol)))
      return
    subscriptionTimer = schedule(() => {
      subscriptionTimer = undefined
      const removed = [...subscribed].filter((symbol) => !symbols.has(symbol))
      const added = [...symbols].filter((symbol) => !subscribed.has(symbol))
      const changes = removed.length ? removed : added
      if (!changes.length || !socket) return
      const method = removed.length ? 'UNSUBSCRIBE' : 'SUBSCRIBE'
      pendingId = ++requestId
      try {
        socket.send(
          JSON.stringify({
            method,
            params: changes.map((symbol) => `${symbol.toLowerCase()}@miniTicker`),
            id: pendingId,
          }),
        )
        changes.forEach((symbol) => {
          if (removed.length) subscribed.delete(symbol)
          else subscribed.add(symbol)
        })
        subscriptionTimer = schedule(() => {
          subscriptionTimer = undefined
          reconnect('Binance did not confirm the pair change. Retrying automatically.')
        }, CONNECT_TIMEOUT_MS)
      } catch {
        reconnect('Could not update market subscriptions. Retrying automatically.')
      }
    }, 500)
  }

  function reconnect(message: string) {
    release()
    if (!isActive) return
    if (!isOnline) {
      publish({
        status: 'disconnected',
        message: 'You are offline. Reconnection will resume when your network returns.',
        retryAt: null,
      })
      return
    }
    const delay = Math.min(INITIAL_RETRY_DELAY_MS * 2 ** Math.min(attempt, 5), MAX_RETRY_DELAY_MS)
    attempt += 1
    publish({ status: 'reconnecting', message, retryAt: now() + delay })
    timer = schedule(connect, delay)
  }

  function connect() {
    release()
    if (!isActive || !isOnline) return
    publish({ status: attempt === 0 ? 'connecting' : 'reconnecting', retryAt: null })
    const connectionGeneration = generation
    const isCurrent = () => isActive && generation === connectionGeneration
    try {
      subscribed = new Set(symbols)
      socket = createSocket(
        `${options.streamEndpoint}?streams=${[...symbols].map((symbol) => `${symbol.toLowerCase()}@miniTicker`).join('/')}`,
      )
      timer = schedule(() => {
        if (isCurrent()) reconnect('The market connection timed out. Retrying automatically.')
      }, CONNECT_TIMEOUT_MS)
      socket.onopen = () => {
        if (!isCurrent()) return
        isOpen = true
        queueSubscriptions()
        if (timer !== undefined) cancel(timer)
        timer = schedule(() => {
          if (isCurrent()) reconnect('No valid market prices received. Retrying automatically.')
        }, STALE_TIMEOUT_MS)
      }
      socket.onmessage = (data) => {
        if (!isCurrent()) return
        if (typeof data === 'string') {
          try {
            const response: unknown = JSON.parse(data)
            if (response && typeof response === 'object' && 'id' in response) {
              if (response.id !== pendingId || pendingId === null) return
              if (!('result' in response) || response.result !== null) {
                reconnect('Binance rejected the pair change. Retrying automatically.')
                return
              }
              if (subscriptionTimer !== undefined) cancel(subscriptionTimer)
              subscriptionTimer = undefined
              pendingId = null
              queueSubscriptions()
              return
            }
          } catch {
            publish({ status: 'error', message: 'An invalid market update was ignored.' })
            return
          }
        }
        const tick = parseMarketMessage(data)
        if (!tick) {
          publish({
            status: 'error',
            message: 'An invalid market update was ignored. Waiting for valid prices.',
          })
          return
        }
        if (!symbols.has(tick.symbol)) return
        const previous = snapshot.quotes[tick.symbol]
        if (previous && tick.eventTime <= previous.eventTime) return
        if (timer !== undefined) cancel(timer)
        timer = schedule(() => {
          if (isCurrent()) reconnect('Market updates stopped. Last-known prices may be stale.')
        }, STALE_TIMEOUT_MS)
        attempt = 0
        publish({
          status: 'connected',
          message: null,
          retryAt: null,
          quotes: { ...snapshot.quotes, [tick.symbol]: updateQuote(previous, tick, now()) },
          history: {
            ...snapshot.history,
            [tick.symbol]: [
              ...(snapshot.history[tick.symbol] ?? []),
              { time: tick.eventTime, price: tick.price },
            ].slice(-HISTORY_LIMIT),
          },
        })
      }
      socket.onclose = () => {
        if (isCurrent()) reconnect('The connection was lost. Retrying automatically.')
      }
      socket.onerror = () => {
        if (isCurrent()) reconnect('Could not reach Binance. Retrying automatically.')
      }
    } catch {
      reconnect('Could not open the market connection. Retrying automatically.')
    }
  }

  return {
    setSymbols(next: readonly string[]) {
      const selected = new Set(next.filter((symbol) => validSymbols.has(symbol)))
      if (
        !selected.size ||
        (selected.size === symbols.size && [...selected].every((symbol) => symbols.has(symbol)))
      )
        return
      symbols = selected
      publish({
        quotes: Object.fromEntries(
          Object.entries(snapshot.quotes).filter(([symbol]) => symbols.has(symbol)),
        ),
        history: Object.fromEntries(
          Object.entries(snapshot.history).filter(([symbol]) => symbols.has(symbol)),
        ),
      })
      queueSubscriptions()
    },
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    start(hasNetwork = true) {
      if (isActive) return
      isActive = true
      isOnline = hasNetwork
      if (isOnline) connect()
      else reconnect('You are offline.')
    },
    stop() {
      isActive = false
      release()
    },
    setOnline(hasNetwork: boolean) {
      isOnline = hasNetwork
      if (!isActive) return
      if (isOnline) {
        attempt = 0
        connect()
      } else reconnect('You are offline.')
    },
    retry() {
      if (!isActive || !isOnline) return
      attempt = 0
      connect()
    },
  }
}
