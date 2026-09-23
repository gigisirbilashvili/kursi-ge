import { Box, Chip, Typography } from '@mui/material'

import { MarketPanel } from './MarketPanel/MarketPanel'
import type { IHomePageProps } from './types'

function HomePage({ market, onRetry }: IHomePageProps) {
  return (
    <Box component="section" aria-labelledby="market-heading">
      <Typography component="h1" variant="h1" id="market-heading" sx={{ fontSize: { xs: 24, sm: 30 } }}>Crypto market</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 672 }}>Live prices, your favorites, and instant conversions.</Typography>
      <Chip label="Prices quoted in USDT · Binance Spot" size="small" sx={{ mt: 1.5, bgcolor: '#fdeef3', color: 'primary.main', fontSize: 12 }} />
      <MarketPanel snapshot={market} onRetry={onRetry} />
    </Box>
  )
}

export default HomePage
