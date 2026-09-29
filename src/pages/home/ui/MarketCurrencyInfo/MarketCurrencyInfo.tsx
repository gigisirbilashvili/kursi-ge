import { Avatar, Box, Stack, Typography } from '@mui/material'

import type { IMarketCurrencyInfoProps } from './types'

export function MarketCurrencyInfo({
  name, ticker, pairText, badgeBackground, badgeColor,
  isCompact = false,
}: Readonly<IMarketCurrencyInfoProps>) {
  return (
    <Stack className={isCompact ? "min-w-0 flex-row items-center gap-2" : "flex-row items-center gap-3"}>
      <Avatar
        aria-hidden="true"
        sx={{
          bgcolor: badgeBackground,
          color: badgeColor,
        }}
        className={isCompact ? "size-9 text-[9px] font-bold" : "size-10 text-[10px] font-bold"}
      >
        {ticker}
      </Avatar>

      <Box>
        <Typography component="p" variant="spanBold">
          {name}
        </Typography>
        <Typography color="textSecondary" variant="caption">
          {pairText}
        </Typography>
      </Box>
    </Stack>
  )
}
