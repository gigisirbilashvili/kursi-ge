import type { ReactNode } from 'react'

import type { IMarketCurrencyInfoProps } from '../ui/MarketCurrencyInfo/types'
import type { IMarketCurrencyActionsProps } from '../ui/MarketCurrencyActions/types'

export interface IMarketRowView {
  id: string
  label: string
  info: IMarketCurrencyInfoProps
  actions: IMarketCurrencyActionsProps
  price: ReactNode
  change: ReactNode
}

export interface IMarketRowsProps {
  rows: readonly IMarketRowView[]
}
