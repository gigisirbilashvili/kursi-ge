import { IconButton, Tooltip } from '@mui/material'

import { FavoriteIcon } from '../../../../assets/icons'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import type { IMarketCurrencyActionsProps } from './types'

export function MarketCurrencyActions({
  currency,
  isFavorite,
  toggleFavorite,
  hide,
}: Readonly<IMarketCurrencyActionsProps>) {
  return (
    <>
      <Tooltip
        title={
          isFavorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
      >
        <IconButton
          size="small"
          color={isFavorite ? "primary" : "default"}
          aria-label={`${isFavorite ? "Remove" : "Add"} ${currency.name} ${isFavorite ? "from" : "to"} favorites`}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(currency.symbol)}
        >
          <FavoriteIcon size={20} isFilled={isFavorite} />
        </IconButton>
      </Tooltip>

      <AppButton
        size="small"
        onClick={() => hide(currency.symbol)}
        aria-label={`Hide ${currency.name}`}
      >
        Hide
      </AppButton>
    </>
  )
}
