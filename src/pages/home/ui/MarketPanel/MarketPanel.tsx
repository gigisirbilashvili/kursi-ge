import { Box, Typography } from '@mui/material'

import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { useMarketPanel } from '../../model/useMarketPanel'
import { MarketPanelHeader } from '../MarketPanelHeader/MarketPanelHeader'
import { MarketAlerts } from '../MarketAlerts/MarketAlerts'
import { MarketToolbar } from '../MarketToolbar/MarketToolbar'
import { MarketTable } from '../MarketTable/MarketTable'
import { MarketMobileList } from '../MarketMobileList/MarketMobileList'
import { MarketPanelFooter } from '../MarketPanelFooter/MarketPanelFooter'
import type { IMarketPanelProps } from './types'

export function MarketPanel({
  snapshot,
  onRetry,
  currencies,
  alerts,
  onDismissAlert,
}: Readonly<IMarketPanelProps>) {
  const model = useMarketPanel(currencies, snapshot)
  return (
    <SectionCard headingId="spot-market-heading" hasShadow>
      <MarketPanelHeader
        snapshot={snapshot}
        visibleCount={currencies.length - model.controls.hiddenCurrencies.length}
        hasPrices={model.status.hasPrices}
        isConnected={model.status.isConnected}
        isUnavailable={model.status.isUnavailable}
        onRetry={onRetry}
      />
      <MarketAlerts alerts={alerts} onDismissAlert={onDismissAlert} />
      <MarketToolbar {...model.controls} />
      {model.rows.visibleCurrencies.length === 0 ? (
        <Box role="status" className="px-5 py-12 text-center sm:px-6">
          <Typography component="h3" variant="spanBold">
            No currencies found
          </Typography>

          <Typography color="textSecondary" className="mt-1">
            Try another search, switch to All, or restore a hidden currency.
          </Typography>
        </Box>
      ) : (
        <>
          <MarketTable {...model.rows} />
          <MarketMobileList {...model.rows} />
        </>
      )}
      <MarketPanelFooter age={model.status.age} isWaiting={model.status.isWaiting} />
    </SectionCard>
  )
}
