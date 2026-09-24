import { createBrowserSocket } from '../api/createBrowserSocket.ts'
import { parseMarketMessage } from '../api/parseMarketMessage.ts'
import {
  CONNECT_TIMEOUT_MS,
  INITIAL_RETRY_DELAY_MS,
  MARKET_STREAM_URL,
  MAX_RETRY_DELAY_MS,
  STALE_TIMEOUT_MS,
} from '../config/constants.ts'
import { updateQuote } from '../lib/updateQuote.ts'
import type { IMarketFeedOptions, IMarketSnapshot, IMarketSocket } from '../types/index.ts'

export function createMarketFeed(options: IMarketFeedOptions = {}) {
  const createSocket = options.createSocket ?? createBrowserSocket
  const now = options.now ?? Date.now
  const schedule = options.schedule ?? setTimeout
  const cancel = options.cancel ?? clearTimeout
  const listeners = new Set<() => void>()
  let snapshot: IMarketSnapshot = { status: 'connecting', quotes: {}, message: null, retryAt: null }
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
      socket = createSocket(MARKET_STREAM_URL)
      timer = schedule(() => {
        if (isCurrent()) reconnect('The market connection timed out. Retrying automatically.')
      }, CONNECT_TIMEOUT_MS)
      socket.onopen = () => {
        if (!isCurrent()) return
        if (timer !== undefined) cancel(timer)
        timer = schedule(() => {
          if (isCurrent()) reconnect('No valid market prices received. Retrying automatically.')
        }, STALE_TIMEOUT_MS)
      }
      socket.onmessage = (data) => {
        if (!isCurrent()) return
        const tick = parseMarketMessage(data)
        if (!tick) {
          publish({
            status: 'error',
            message: 'An invalid market update was ignored. Waiting for valid prices.',
          })
          return
        }
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
