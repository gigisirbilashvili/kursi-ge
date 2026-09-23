import { Box, Chip, Typography } from '@mui/material'

import { MarketPanel } from './MarketPanel/MarketPanel'
import type { IHomePageProps } from './types'

function HomePage({ market, onRetry }: IHomePageProps) {
  return (
    <Box component="section" aria-labelledby="market-heading">
      <Typography component="h1" variant="h1" id="market-heading" className="text-2xl sm:text-3xl">Crypto market</Typography>
      <Typography className="mt-2 max-w-2xl text-muted">Live prices, your favorites, and instant conversions.</Typography>
      <Chip label="Prices quoted in USDT · Binance Spot" size="small" className="mt-3 bg-brand-soft text-xs font-medium text-brand" />
      <MarketPanel snapshot={market} onRetry={onRetry} />
    </Box>
  )
}

export default HomePage
