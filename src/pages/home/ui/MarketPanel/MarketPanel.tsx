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
  currencies,
  alerts,
  onDismissAlert,
}: Readonly<IMarketPanelProps>) {
  const model = useMarketPanel(currencies)
  return (
    <SectionCard headingId="spot-market-heading" hasShadow>
      <MarketPanelHeader
        visibleCount={currencies.length - model.controls.hiddenCurrencies.length}
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
      <MarketPanelFooter />
    </SectionCard>
  )
}
