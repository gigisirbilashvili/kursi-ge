import { STALE_TIMEOUT_MS } from '../../../entities/currency'
import type { IMarketSnapshot } from '../../../entities/currency'

export function getMarketPanelStatus(snapshot: IMarketSnapshot, now: number) {
  const hasPrices = Object.keys(snapshot.quotes).length > 0
  const isConnected = snapshot.status === 'connected'
  const isWaiting = !hasPrices && (snapshot.status === 'connecting' || snapshot.status === 'reconnecting')
  const isUnavailable = !isConnected && snapshot.status !== 'connecting'
  const latestUpdate = Math.max(0, ...Object.values(snapshot.quotes).map(({ receivedAt }) => receivedAt))
  const age = latestUpdate ? Math.max(0, Math.floor((now - latestUpdate) / 1000)) : null
  const isQuoteStale = (symbol: string) =>
    !isConnected || now - (snapshot.quotes[symbol]?.receivedAt ?? 0) >= STALE_TIMEOUT_MS

  return { hasPrices, isConnected, isWaiting, isUnavailable, age, isQuoteStale }
}
