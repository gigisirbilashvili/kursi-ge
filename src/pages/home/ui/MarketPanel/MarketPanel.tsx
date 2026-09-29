import { Box, Typography } from '@mui/material'

import { useMarketPanel } from '../../model/useMarketPanel'
import { MarketPanelHeader } from '../MarketPanelHeader/MarketPanelHeader'
import { MarketPanelFooter } from '../MarketPanelFooter/MarketPanelFooter'
import { MarketPrice } from '../MarketPrice/MarketPrice'
import { SessionChange } from '../SessionChange/SessionChange'

import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { MarketAlerts } from '../MarketAlerts/MarketAlerts'
import { MarketToolbar } from '../MarketToolbar/MarketToolbar'
import { MarketTable } from '../MarketTable/MarketTable'
import { MarketMobileList } from '../MarketMobileList/MarketMobileList'
import type { IMarketPanelProps } from './types'

export function MarketPanel(props: IMarketPanelProps) {
  const model = useMarketPanel(props)
  const rows = model.rows.map(({ symbol, ...row }) => ({
    ...row,
    price: <MarketPrice symbol={symbol} />,
    change: <SessionChange symbol={symbol} />,
  }))
  const toolbar = model.controls
  const { alerts, hasAlerts, hasRows } = model
  return (
    <SectionCard headingId="spot-market-heading" hasShadow>
      <MarketPanelHeader visibleCount={model.visibleCount} />
      <MarketAlerts alerts={alerts} hasAlerts={hasAlerts} />
      <MarketToolbar {...toolbar} />
      {!hasRows ? (
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
          <MarketTable rows={rows} />
          <MarketMobileList rows={rows} />
        </>
      )}
      <MarketPanelFooter />
    </SectionCard>
  )
}
