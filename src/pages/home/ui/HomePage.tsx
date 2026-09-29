import { Box, Typography } from "@mui/material";

import { PairManager } from '../../../features/manage-pairs'
import { PriceHistory } from '../../../features/price-history'
import { TargetAlerts } from '../../../features/target-alerts'
import { ConversionCalculator } from '../../../features/convert-currency'
import { useHomePageModel } from '../model/useHomePageModel'
import { MarketPanel } from './MarketPanel/MarketPanel'

import { AppChip } from "../../../shared/ui/AppChip/AppChip";
import type { IHomePageProps } from "./types";

export function HomePage({ currencies, onAddPair, onRemovePair }: IHomePageProps) {
  const { session, targets } = useHomePageModel()
  return (
    <Box component="section" aria-labelledby="market-heading">
      <Typography
        component="h1"
        variant="h1"
        id="market-heading"
        className="text-2xl sm:text-3xl"
      >
        Crypto market
      </Typography>

      <Typography color="textSecondary" className="mt-2 max-w-2xl">
        Live prices, favorites, alerts, and currency conversions.
      </Typography>

      <AppChip
        label="Prices quoted in USDT · Binance Spot"
        isBrand
        className="mt-3"
      />

      <PairManager currencies={currencies} onAdd={onAddPair} onRemove={onRemovePair} />
      <MarketPanel currencies={currencies} alerts={session.alerts} onDismissAlert={session.dismiss} />
      <ConversionCalculator currencies={currencies} />
      <PriceHistory currencies={currencies} />
      <TargetAlerts currencies={currencies} alerts={targets.alerts} onAdd={targets.add} onRearm={targets.rearm} onRemove={targets.remove} />
    </Box>
  );
}
