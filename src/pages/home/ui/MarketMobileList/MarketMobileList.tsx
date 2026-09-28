import { List, ListItem, Stack, Typography } from '@mui/material'

import { MarketCurrencyInfo } from '../MarketCurrencyInfo/MarketCurrencyInfo'
import { MarketCurrencyActions } from '../MarketCurrencyActions/MarketCurrencyActions'
import { MarketPrice } from '../MarketPrice/MarketPrice'
import { SessionChange } from '../SessionChange/SessionChange'
import type { IMarketMobileListProps } from './types'

export function MarketMobileList({
  visibleCurrencies,
  snapshot,
  favorites,
  isQuoteStale,
  toggleFavorite,
  hide,
}: Readonly<IMarketMobileListProps>) {
  return (
    <List
      aria-label="Cryptocurrency markets"
      disablePadding
      className="block md:hidden"
    >
      {visibleCurrencies.map((currency) => {
        const isFavorite = favorites.includes(
          currency.symbol,
        );
        return (
          <ListItem
            key={currency.symbol}
            divider
            className="block p-5 last:border-b-0"
          >
            <Stack className="flex-row items-center justify-between gap-2">
              <MarketCurrencyInfo currency={currency} isCompact />

              <MarketPrice
                quote={snapshot.quotes[currency.symbol]}
                isStale={isQuoteStale(currency.symbol)}
              />
            </Stack>

            <Stack className="mt-4 flex-row items-center justify-between gap-2">
              <Typography color="textSecondary" variant="caption">
                Since opening
              </Typography>

              <SessionChange quote={snapshot.quotes[currency.symbol]} />
            </Stack>

            <Stack className="mt-3 flex-row items-center justify-end gap-2">
              <MarketCurrencyActions
                currency={currency}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                hide={hide}
              />
            </Stack>
          </ListItem>
        );
      })}
    </List>
  )
}
