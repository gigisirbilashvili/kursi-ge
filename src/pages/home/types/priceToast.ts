export interface IPriceToast {
  id: string
  message: string
  severity: 'success' | 'warning'
}

export interface IPriceToastSessionAlert {
  id: number
  symbol: string
  currentPrice: number
  percentageChange: number
  direction: 'increased' | 'decreased'
}

export interface IPriceToastTargetAlert {
  id: string
  symbol: string
  target: number
  direction: 'above' | 'below'
  triggeredPrice?: number
  triggerCount?: number
}
