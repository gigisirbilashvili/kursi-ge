import { IconButton, Tooltip } from '@mui/material'

import { FavoriteIcon } from '../../../../assets/icons'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import type { IMarketCurrencyActionsProps } from './types'

export function MarketCurrencyActions({
  isFavorite,
  favoriteTitle,
  favoriteLabel,
  hideLabel,
  onToggleFavorite,
  onHide,
}: Readonly<IMarketCurrencyActionsProps>) {
  return (
    <>
      <Tooltip
        title={favoriteTitle}
      >
        <IconButton
          size="small"
          color={isFavorite ? "primary" : "default"}
          aria-label={favoriteLabel}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
        >
          <FavoriteIcon size={20} isFilled={isFavorite} />
        </IconButton>
      </Tooltip>

      <AppButton
        size="small"
        onClick={onHide}
        aria-label={hideLabel}
      >
        Hide
      </AppButton>
    </>
  )
}
