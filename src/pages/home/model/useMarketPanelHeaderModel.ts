import { useMarketFeed, useMarketStatus, useMarketValue } from '../../../entities/currency'
import type { IMarketPanelHeaderViewState } from './types/marketPanelHeader'

export function useMarketPanelHeaderModel(visibleCount: number): IMarketPanelHeaderViewState {
  const { retry } = useMarketFeed()
  const status = useMarketStatus()
  const message = useMarketValue((snapshot) => snapshot.message)
  const hasPrices = useMarketValue((snapshot) => Object.keys(snapshot.quotes).length > 0)
  const isConnected = status === 'connected'
  const isUnavailable = !isConnected && status !== 'connecting'
  const messageText = message ?? (isConnected ? 'Receiving market prices from Binance.' : 'Connecting to Binance. Waiting for the first prices…')
  return {
    visibleText: `${visibleCount} visible`, isUnavailable,
    severity: isUnavailable ? 'warning' : isConnected ? 'success' : 'info',
    messageText: messageText + (isUnavailable && hasPrices ? ' Last-known prices are shown below.' : ''),
    isRetryDisabled: status === 'disconnected', onRetry: retry,
  }
}
