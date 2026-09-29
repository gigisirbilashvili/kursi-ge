export interface IMarketPriceViewState {
  isWaiting: boolean
  isStale: boolean
  direction: 'up' | 'down' | 'unchanged'
  color: string
  priceText: string
  tickTitle: string
  tickText: string
}
