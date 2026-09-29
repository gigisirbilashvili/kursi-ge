import { createContext } from 'react'

import type { createMarketFeed } from './createMarketFeed'

export const MarketFeedContext = createContext<ReturnType<typeof createMarketFeed> | null>(null)
