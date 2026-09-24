export interface ITargetAlert {
  id: string
  symbol: string
  target: number
  direction: 'above' | 'below'
  triggeredPrice?: number
}
