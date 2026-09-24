import type { ICurrency } from '../../../../../entities/currency'

export interface IPairManagerProps {
  currencies: readonly ICurrency[]
  onAdd: (symbol: string) => void
  onRemove: (symbol: string) => void
}
