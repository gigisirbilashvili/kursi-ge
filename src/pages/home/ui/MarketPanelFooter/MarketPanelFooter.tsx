import { useEffect, useState } from 'react'
import { Stack, Typography } from '@mui/material'

import { useMarketStatus, useMarketValue } from '../../../../entities/currency'

export function MarketPanelFooter() {
  const [now, setNow] = useState(Date.now)
  const status = useMarketStatus()
  const latestUpdate = useMarketValue((snapshot) =>
    Math.max(0, ...Object.values(snapshot.quotes).map(({ receivedAt }) => receivedAt)))
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const age = latestUpdate ? Math.max(0, Math.floor((now - latestUpdate) / 1000)) : null
  const isWaiting = !latestUpdate && (status === 'connecting' || status === 'reconnecting')
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
