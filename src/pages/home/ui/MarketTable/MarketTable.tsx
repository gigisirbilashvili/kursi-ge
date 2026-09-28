import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

import { MarketCurrencyInfo } from '../MarketCurrencyInfo/MarketCurrencyInfo'
import { MarketCurrencyActions } from '../MarketCurrencyActions/MarketCurrencyActions'
import { MarketPrice } from '../MarketPrice/MarketPrice'
import { SessionChange } from '../SessionChange/SessionChange'
import type { IMarketTableProps } from './types'

export function MarketTable({
  visibleCurrencies,
  favorites,
  toggleFavorite,
  hide,
}: Readonly<IMarketTableProps>) {
  return (
    <TableContainer className="hidden md:block">
      <Table
        sx={{ "& .MuiTableCell-root": { borderColor: "divider" } }}
        className="table-fixed [&_.MuiTableCell-root]:px-6 [&_.MuiTableCell-root]:py-5 [&_.MuiTableCell-head]:py-4 [&_.MuiTableCell-head]:text-xs"
      >
        <Box component="caption" className="sr-only">
          Live cryptocurrency prices in USDT, latest tick direction,
          percentage change since opening, favorite status, and visibility
          actions.
        </Box>

        <TableHead>
          <TableRow>
            <TableCell scope="col">Asset</TableCell>
            <TableCell scope="col" align="right">
              Price (USDT)
            </TableCell>

            <TableCell scope="col" align="right">
              Change since opening
            </TableCell>

            <TableCell scope="col" align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {visibleCurrencies.map((currency) => {
            const isFavorite = favorites.includes(
              currency.symbol,
            );
            return (
              <TableRow
                key={currency.symbol}
                hover
                className="last:[&_.MuiTableCell-root]:border-b-0"
              >
                <TableCell
                  component="th"
                  scope="row"
                  aria-label={`${currency.name}, ${currency.ticker}/USDT`}
                >
                  <MarketCurrencyInfo currency={currency} />
                </TableCell>

                <TableCell align="right">
                  <MarketPrice
                    symbol={currency.symbol}
                  />
                </TableCell>

                <TableCell align="right">
                  <SessionChange
                    symbol={currency.symbol}
                  />
                </TableCell>

                <TableCell align="right">
                  <Stack className="flex-row items-center justify-end gap-1">
                    <MarketCurrencyActions
                      currency={currency}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavorite}
                      hide={hide}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
