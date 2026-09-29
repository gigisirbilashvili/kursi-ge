import type { ICurrency } from '../../../../entities/currency'

export interface IHomePageProps {
  currencies: readonly ICurrency[]
  onAddPair: (symbol: string) => void
  onRemovePair: (symbol: string) => void
}
