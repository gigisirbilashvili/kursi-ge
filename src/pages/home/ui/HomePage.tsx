import { Box, Chip, Typography } from '@mui/material'

import { PairManager } from '../../../features/manage-pairs'
import { PriceHistory } from '../../../features/price-history'
import { useSignificantAlerts } from '../../../features/significant-alerts'
import { TargetAlerts, useTargetAlerts } from '../../../features/target-alerts'
import { ConversionCalculator } from '../../../features/convert-currency'
import { usePriceToasts } from '../model/usePriceToasts'
import { MarketPanel } from './MarketPanel/MarketPanel'
import type { IHomePageProps } from './types'

function HomePage({ market, onRetry, currencies, onAddPair, onRemovePair }: IHomePageProps) {
  const { alerts: sessionAlerts, dismiss: dismissSessionAlert } = useSignificantAlerts(market)
  const { alerts: targetAlerts, add, rearm, remove } = useTargetAlerts(market)
  usePriceToasts(sessionAlerts, targetAlerts)

  return (
    <Box component="section" aria-labelledby="market-heading">
      <Typography component="h1" variant="h1" id="market-heading" className="text-2xl sm:text-3xl">
        Crypto market
      </Typography>

      <Typography className="mt-2 max-w-2xl text-muted">
        Live prices, favorites, alerts, and currency conversions.
      </Typography>

      <Chip
        label="Prices quoted in USDT · Binance Spot"
        size="small"
        className="mt-3 bg-brand-soft text-xs font-medium text-brand"
      />

      <PairManager currencies={currencies} onAdd={onAddPair} onRemove={onRemovePair} />

      <MarketPanel
        snapshot={market}
        onRetry={onRetry}
        currencies={currencies}
        alerts={sessionAlerts}
        onDismissAlert={dismissSessionAlert}
      />

      <ConversionCalculator market={market} currencies={currencies} />

      <PriceHistory market={market} currencies={currencies} />

      <TargetAlerts
        market={market}
        currencies={currencies}
        alerts={targetAlerts}
        onAdd={add}
        onRearm={rearm}
        onRemove={remove}
      />
    </Box>
  )
}

export default HomePage
