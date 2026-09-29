import type { ReactNode } from 'react'

import type { IMarketFeedOptions } from '../../../types'

export interface IMarketFeedProviderProps {
  children: ReactNode
  initialOptions: IMarketFeedOptions
  symbols: readonly string[]
}
