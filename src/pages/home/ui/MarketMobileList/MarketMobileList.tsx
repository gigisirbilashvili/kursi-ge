import { List, ListItem, Stack, Typography } from '@mui/material'

import { MarketCurrencyInfo } from '../MarketCurrencyInfo/MarketCurrencyInfo'
import { MarketCurrencyActions } from '../MarketCurrencyActions/MarketCurrencyActions'
import type { IMarketMobileListProps } from './types'

export function MarketMobileList({ rows }: Readonly<IMarketMobileListProps>) {
  return (
    <List
      aria-label="Cryptocurrency markets"
      disablePadding
      className="block md:hidden"
    >
      {rows.map((row) => {
            return (
          <ListItem
            key={row.id}
            divider
            className="block p-5 last:border-b-0"
          >
            <Stack className="flex-row items-center justify-between gap-2">
              <MarketCurrencyInfo {...row.info} isCompact />

              {row.price}
            </Stack>

            <Stack className="mt-4 flex-row items-center justify-between gap-2">
              <Typography color="textSecondary" variant="caption">
                Since opening
              </Typography>

              {row.change}
            </Stack>

            <Stack className="mt-3 flex-row items-center justify-end gap-2">
              <MarketCurrencyActions {...row.actions} />
            </Stack>
          </ListItem>
        );
      })}
    </List>
  )
}
