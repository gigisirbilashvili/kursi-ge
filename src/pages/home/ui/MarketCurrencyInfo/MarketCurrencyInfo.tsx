import { Avatar, Box, Stack, Typography } from '@mui/material'

import type { IMarketCurrencyInfoProps } from './types'

export function MarketCurrencyInfo({
  currency,
  isCompact = false,
}: Readonly<IMarketCurrencyInfoProps>) {
  return (
    <Stack className={isCompact ? "min-w-0 flex-row items-center gap-2" : "flex-row items-center gap-3"}>
      <Avatar
        aria-hidden="true"
        sx={{
          bgcolor: `${currency.badgeTone}.main`,
          color: `${currency.badgeTone}.contrastText`,
        }}
        className={isCompact ? "size-9 text-[9px] font-bold" : "size-10 text-[10px] font-bold"}
      >
        {currency.ticker}
      </Avatar>

      <Box>
        <Typography component="p" variant="spanBold">
          {currency.name}
        </Typography>
        <Typography color="textSecondary" variant="caption">
          {currency.ticker}/USDT
        </Typography>
      </Box>
    </Stack>
  )
}
