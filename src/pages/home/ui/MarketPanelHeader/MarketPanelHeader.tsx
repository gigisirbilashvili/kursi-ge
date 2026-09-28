import { Stack, Typography } from '@mui/material'

import { AppAlert } from '../../../../shared/ui/AppAlert/AppAlert'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { AppChip } from '../../../../shared/ui/AppChip/AppChip'
import type { IMarketPanelHeaderProps } from './types'

export function MarketPanelHeader({
  visibleCount,
  snapshot,
  isUnavailable,
  isConnected,
  hasPrices,
  onRetry,
}: Readonly<IMarketPanelHeaderProps>) {
  return (
    <>
      <Stack
        sx={{ borderColor: "divider" }}
        className="flex-row flex-wrap items-center justify-between gap-4 border-b p-5 sm:p-6"
      >
        <Stack className="flex-row items-center gap-3">
          <Typography component="h2" variant="h2" id="spot-market-heading">
            Spot markets
          </Typography>

          <AppChip
            label={`${visibleCount} visible`}
            isBrand
          />
        </Stack>

        <Typography color="textSecondary" variant="caption">
          Binance · USDT pairs
        </Typography>
      </Stack>

      <AppAlert
        aria-live="polite"
        severity={isUnavailable ? "warning" : isConnected ? "success" : "info"}
        icon={false}
        sx={{
          bgcolor: isUnavailable ? "warningSoft.main" : "background.default",
          borderColor: "divider",
        }}
        className="rounded-none border-b px-5 sm:px-6 [&_.MuiAlert-message]:w-full"
      >
        <Stack className="flex-row flex-wrap items-center justify-between gap-3">
          <Typography
            variant="body2"
            color={isUnavailable ? "warning" : "textSecondary"}
          >
            {snapshot.message ??
              (isConnected
                ? "Receiving market prices from Binance."
                : "Connecting to Binance. Waiting for the first prices…")}
            {isUnavailable &&
              hasPrices &&
              " Last-known prices are shown below."}
          </Typography>
          {isUnavailable && (
            <AppButton
              variant="outlined"
              size="small"
              onClick={onRetry}
              disabled={snapshot.status === "disconnected"}
              className="min-h-10"
            >
              Retry connection
            </AppButton>
          )}
        </Stack>
      </AppAlert>
    </>
  )
}
