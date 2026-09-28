import { Stack, Typography } from '@mui/material'

import type { IMarketPanelFooterProps } from './types'

export function MarketPanelFooter({ age, isWaiting }: Readonly<IMarketPanelFooterProps>) {
  return (
    <Stack
      color="text.secondary"
      sx={{ bgcolor: "background.default", borderColor: "divider" }}
      className="flex-row flex-wrap justify-between gap-2 border-t px-5 py-4 sm:px-6"
    >
      <Typography variant="caption">
        Arrows beside prices show the latest tick. Percentages compare with
        your first session price.
      </Typography>

      <Typography variant="caption">
        {age === null
          ? isWaiting
            ? "Waiting for market data"
            : "No prices received"
          : `Last update ${age < 2 ? "just now" : `${age}s ago`}`}
      </Typography>
    </Stack>
  )
}
