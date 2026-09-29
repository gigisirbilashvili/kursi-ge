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
import type { IMarketTableProps } from './types'

export function MarketTable({ rows }: Readonly<IMarketTableProps>) {
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
          {rows.map((row) => {
            return (
              <TableRow
                key={row.id}
                hover
                className="last:[&_.MuiTableCell-root]:border-b-0"
              >
                <TableCell
                  component="th"
                  scope="row"
                  aria-label={row.label}
                >
                  <MarketCurrencyInfo {...row.info} />
                </TableCell>

                <TableCell align="right">
                  {row.price}
                </TableCell>

                <TableCell align="right">
                  {row.change}
                </TableCell>

                <TableCell align="right">
                  <Stack className="flex-row items-center justify-end gap-1">
                    <MarketCurrencyActions {...row.actions} />
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
