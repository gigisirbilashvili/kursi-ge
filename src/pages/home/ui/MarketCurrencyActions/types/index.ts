export interface IMarketCurrencyActionsProps {
  isFavorite: boolean
  favoriteTitle: string
  favoriteLabel: string
  hideLabel: string
  onToggleFavorite: () => void
  onHide: () => void
}
