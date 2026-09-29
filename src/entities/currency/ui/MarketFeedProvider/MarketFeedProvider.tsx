import { MarketFeedContext } from '../../model/marketFeedContext'
import { useMarketFeedOwner } from '../../model/useMarketFeedOwner'
import { useMarketStatus, useMarketValue } from '../../model/useMarketFeed'
import { useMarketNotifications } from '../../model/useMarketNotifications'
import type { IMarketFeedProviderProps } from './types'

function MarketNotifications() {
  const status = useMarketStatus()
  const message = useMarketValue((snapshot) => snapshot.message)
  useMarketNotifications({ status, message })
  return null
}

export function MarketFeedProvider({ children, initialOptions, symbols }: IMarketFeedProviderProps) {
  const feed = useMarketFeedOwner(initialOptions, symbols)
  return (
    <MarketFeedContext.Provider value={feed}>
      <MarketNotifications />
      {children}
    </MarketFeedContext.Provider>
  )
}
