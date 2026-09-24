import type { ICurrency, IMarketSnapshot } from '../../../entities/currency/index.ts'
import type {
  IMarketPreferences,
  TMarketFilter,
  TSortDirection,
  TSortField,
} from '../types/index.ts'

export function normalizePreferences(
  value: unknown,
  validSymbols: ReadonlySet<string>,
): IMarketPreferences {
  if (!value || typeof value !== 'object') return { favorites: [], hidden: [] }
  const saved = value as Record<string, unknown>
  const symbols = (item: unknown) =>
    Array.isArray(item)
      ? [
          ...new Set(
            item.filter(
              (symbol): symbol is string => typeof symbol === 'string' && validSymbols.has(symbol),
            ),
          ),
        ]
      : []
  return { favorites: symbols(saved.favorites), hidden: symbols(saved.hidden) }
}

export function selectCurrencies(
  currencies: readonly ICurrency[],
  snapshot: IMarketSnapshot,
  preferences: IMarketPreferences,
  search: string,
  filter: TMarketFilter,
  sortField: TSortField,
  sortDirection: TSortDirection,
): ICurrency[] {
  const query = search.trim().toLocaleLowerCase()
  const favorites = new Set(preferences.favorites)
  const hidden = new Set(preferences.hidden)
  const direction = sortDirection === 'asc' ? 1 : -1
  return currencies
    .filter(
      ({ symbol, ticker, name }) =>
        !hidden.has(symbol) &&
        (filter === 'all' || favorites.has(symbol)) &&
        (!query ||
          name.toLocaleLowerCase().includes(query) ||
          ticker.toLocaleLowerCase().includes(query) ||
          symbol.toLocaleLowerCase().includes(query)),
    )
    .sort((left, right) => {
      if (sortField === 'name') return direction * left.name.localeCompare(right.name)
      const leftValue =
        snapshot.quotes[left.symbol]?.[sortField === 'price' ? 'price' : 'percentageChange']
      const rightValue =
        snapshot.quotes[right.symbol]?.[sortField === 'price' ? 'price' : 'percentageChange']
      if (leftValue === undefined)
        return rightValue === undefined ? left.name.localeCompare(right.name) : 1
      if (rightValue === undefined) return -1
      return direction * (leftValue - rightValue) || left.name.localeCompare(right.name)
    })
}
