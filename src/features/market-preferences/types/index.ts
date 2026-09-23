export type TSortField = 'name' | 'price' | 'change'
export type TSortDirection = 'asc' | 'desc'
export type TMarketFilter = 'all' | 'favorites'

export interface IMarketPreferences {
  favorites: readonly string[]
  hidden: readonly string[]
}
