import { createBrowserSocket } from '../api/createBrowserSocket.ts'
import { parseMarketSocketMessage } from '../api/parseMarketMessage.ts'
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
import type { IMarketFeedOptions, IMarketSnapshot, IMarketSocket, IMarketTick, TMarketSocketData } from '../types/index.ts'

function createStreamUrl(streamEndpoint: string, desiredSymbols: ReadonlySet<string>) {
  const streams = [...desiredSymbols].map((symbol) => `${symbol.toLowerCase()}@miniTicker`)
  return `${streamEndpoint}?streams=${streams.join('/')}`
}

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
  let desiredSymbols = new Set(
    options.symbols?.filter((symbol) => validSymbols.has(symbol)) ??
      CURRENCIES.map(({ symbol }) => symbol),
  )
  if (!desiredSymbols.size) desiredSymbols = new Set(CURRENCIES.map(({ symbol }) => symbol))
  let subscribedSymbols = new Set<string>()
  let requestId = 0
  let pendingSubscriptionId: number | null = null
  let socket: IMarketSocket | null = null
  let isOpen = false
  let isActive = false
  let isOnline = true
  let generation = 0
  let reconnectAttempt = 0
  let connectionTimeout: ReturnType<typeof setTimeout> | undefined
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let staleDataTimeout: ReturnType<typeof setTimeout> | undefined
  let subscriptionDebounceTimer: ReturnType<typeof setTimeout> | undefined
  let subscriptionAckTimeout: ReturnType<typeof setTimeout> | undefined

  function publish(patch: Partial<IMarketSnapshot>) {
    snapshot = { ...snapshot, ...patch }
    listeners.forEach((listener) => listener())
  }

  function clearTimer(timer: ReturnType<typeof setTimeout> | undefined): undefined {
    if (timer !== undefined) cancel(timer)
    return undefined
  }

  function isCurrentGeneration(connectionGeneration: number) {
    return isActive && generation === connectionGeneration
  }

  function scheduleForCurrentGeneration(callback: () => void, delay: number) {
    const connectionGeneration = generation
    return schedule(() => {
      if (isCurrentGeneration(connectionGeneration)) callback()
    }, delay)
  }

  function releaseConnection() {
    generation += 1
    isOpen = false
    pendingSubscriptionId = null
    connectionTimeout = clearTimer(connectionTimeout)
    reconnectTimer = clearTimer(reconnectTimer)
    staleDataTimeout = clearTimer(staleDataTimeout)
    subscriptionDebounceTimer = clearTimer(subscriptionDebounceTimer)
    subscriptionAckTimeout = clearTimer(subscriptionAckTimeout)
    if (!socket) return
    socket.onopen = null
    socket.onmessage = null
    socket.onclose = null
    socket.onerror = null
    socket.close()
    socket = null
  }

  function scheduleReconnect(message: string) {
    if (isOnline && reconnectTimer !== undefined) return
    releaseConnection()
    if (!isActive) return
    if (!isOnline) {
      publish({
        status: 'disconnected',
        message: 'You are offline. Reconnection will resume when your network returns.',
        retryAt: null,
      })
      return
    }
    const delay = Math.min(
      INITIAL_RETRY_DELAY_MS * 2 ** Math.min(reconnectAttempt, 5),
      MAX_RETRY_DELAY_MS,
    )
    reconnectAttempt += 1
    reconnectTimer = scheduleForCurrentGeneration(() => {
      reconnectTimer = undefined
      connect()
    }, delay)
    publish({ status: 'reconnecting', message, retryAt: now() + delay })
  }

  function resetStaleTimeout(message: string) {
    staleDataTimeout = clearTimer(staleDataTimeout)
    staleDataTimeout = scheduleForCurrentGeneration(() => {
      staleDataTimeout = undefined
      scheduleReconnect(message)
    }, STALE_TIMEOUT_MS)
  }

  function queueSubscriptions() {
    if (!isOpen || pendingSubscriptionId !== null || subscriptionDebounceTimer !== undefined) return
    if (
      desiredSymbols.size === subscribedSymbols.size &&
      [...desiredSymbols].every((symbol) => subscribedSymbols.has(symbol))
    ) return
    subscriptionDebounceTimer = scheduleForCurrentGeneration(() => {
      subscriptionDebounceTimer = undefined
      sendSubscriptionChanges()
    }, 500)
  }

  function sendSubscriptionChanges() {
    if (!socket || !isOpen) return
    const removed = [...subscribedSymbols].filter((symbol) => !desiredSymbols.has(symbol))
    const added = [...desiredSymbols].filter((symbol) => !subscribedSymbols.has(symbol))
    const changes = removed.length ? removed : added
    if (!changes.length) return
    const method = removed.length ? 'UNSUBSCRIBE' : 'SUBSCRIBE'
    pendingSubscriptionId = ++requestId
    try {
      socket.send(JSON.stringify({
        method,
        params: changes.map((symbol) => `${symbol.toLowerCase()}@miniTicker`),
        id: pendingSubscriptionId,
      }))
      changes.forEach((symbol) => {
        if (removed.length) subscribedSymbols.delete(symbol)
        else subscribedSymbols.add(symbol)
      })
      subscriptionAckTimeout = scheduleForCurrentGeneration(() => {
        subscriptionAckTimeout = undefined
        scheduleReconnect('Binance did not confirm the pair change. Retrying automatically.')
      }, CONNECT_TIMEOUT_MS)
    } catch {
      scheduleReconnect('Could not update market subscriptions. Retrying automatically.')
    }
  }

  function handleSubscriptionResponse(id: number | null, isAccepted: boolean) {
    if (pendingSubscriptionId === null || id !== pendingSubscriptionId) return
    if (!isAccepted) {
      scheduleReconnect('Binance rejected the pair change. Retrying automatically.')
      return
    }
    subscriptionAckTimeout = clearTimer(subscriptionAckTimeout)
    pendingSubscriptionId = null
    queueSubscriptions()
  }

  function handleMarketTick(tick: IMarketTick) {
    if (!desiredSymbols.has(tick.symbol)) return
    const previous = snapshot.quotes[tick.symbol]
    if (previous && tick.eventTime <= previous.eventTime) return
    connectionTimeout = clearTimer(connectionTimeout)
    resetStaleTimeout('Market updates stopped. Last-known prices may be stale.')
    reconnectAttempt = 0
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

  function handleMessage(data: TMarketSocketData) {
    const message = parseMarketSocketMessage(data)
    switch (message.kind) {
      case 'ticker':
        handleMarketTick(message.tick)
        return
      case 'subscription':
        handleSubscriptionResponse(message.id, message.isAccepted)
        return
      case 'invalid':
        publish({ status: 'error', message: message.message })
    }
  }

  function handleOpen() {
    isOpen = true
    connectionTimeout = clearTimer(connectionTimeout)
    queueSubscriptions()
    resetStaleTimeout('No valid market prices received. Retrying automatically.')
  }

  function handleClose() {
    scheduleReconnect('The connection was lost. Retrying automatically.')
  }

  function handleError() {
    scheduleReconnect('Could not reach Binance. Retrying automatically.')
  }

  function attachSocketHandlers(currentSocket: IMarketSocket) {
    const connectionGeneration = generation
    currentSocket.onopen = () => {
      if (isCurrentGeneration(connectionGeneration)) handleOpen()
    }
    currentSocket.onmessage = (data) => {
      if (isCurrentGeneration(connectionGeneration)) handleMessage(data)
    }
    currentSocket.onclose = () => {
      if (isCurrentGeneration(connectionGeneration)) handleClose()
    }
    currentSocket.onerror = () => {
      if (isCurrentGeneration(connectionGeneration)) handleError()
    }
  }

  function connect() {
    releaseConnection()
    if (!isActive || !isOnline) return
    publish({ status: reconnectAttempt === 0 ? 'connecting' : 'reconnecting', retryAt: null })
    try {
      subscribedSymbols = new Set(desiredSymbols)
      socket = createSocket(createStreamUrl(options.streamEndpoint, desiredSymbols))
      attachSocketHandlers(socket)
      connectionTimeout = scheduleForCurrentGeneration(() => {
        connectionTimeout = undefined
        scheduleReconnect('The market connection timed out. Retrying automatically.')
      }, CONNECT_TIMEOUT_MS)
    } catch {
      scheduleReconnect('Could not open the market connection. Retrying automatically.')
    }
  }

  return {
    setSymbols(next: readonly string[]) {
      const selected = new Set(next.filter((symbol) => validSymbols.has(symbol)))
      if (
        !selected.size ||
        (selected.size === desiredSymbols.size && [...selected].every((symbol) => desiredSymbols.has(symbol)))
      )
        return
      desiredSymbols = selected
      publish({
        quotes: Object.fromEntries(
          Object.entries(snapshot.quotes).filter(([symbol]) => desiredSymbols.has(symbol)),
        ),
        history: Object.fromEntries(
          Object.entries(snapshot.history).filter(([symbol]) => desiredSymbols.has(symbol)),
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
      else scheduleReconnect('You are offline.')
    },
    stop() {
      isActive = false
      releaseConnection()
    },
    setOnline(hasNetwork: boolean) {
      isOnline = hasNetwork
      if (!isActive) return
      if (isOnline) {
        reconnectAttempt = 0
        connect()
      } else scheduleReconnect('You are offline.')
    },
    retry() {
      if (!isActive || !isOnline) return
      reconnectAttempt = 0
      connect()
    },
  }
}
