import { Stack, Typography } from '@mui/material'

import { useMarketPanelFooterModel } from '../../model/useMarketPanelFooterModel'

export function MarketPanelFooter() {
  const { updateText } = useMarketPanelFooterModel()
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
        {updateText}
      </Typography>
    </Stack>
  )
}
