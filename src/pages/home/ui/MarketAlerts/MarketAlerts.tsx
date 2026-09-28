import { Stack, Typography } from '@mui/material'

import { AVAILABLE_CURRENCIES } from '../../../../entities/currency'
import { AppAlert } from '../../../../shared/ui/AppAlert/AppAlert'
import { formatPrice } from '../../lib/formatPrice'
import type { IMarketAlertsProps } from './types'

export function MarketAlerts({ alerts, onDismissAlert }: Readonly<IMarketAlertsProps>) {
  return (
    <>{alerts.length > 0 && (
      <Stack
        aria-label="Significant price alerts"
        sx={{ borderColor: "divider" }}
        className="gap-2 border-b p-5 sm:p-6"
      >
        {alerts.map((alert) => {
          const currency = AVAILABLE_CURRENCIES.find(
            ({ symbol }) => symbol === alert.symbol,
          );
          return (
            <AppAlert
              key={alert.id}
              role="alert"
              severity={
                alert.direction === "increased" ? "success" : "warning"
              }
              onClose={() => onDismissAlert(alert.id)}
            >
              <Typography variant="body2Bold">
                {currency?.name ?? alert.symbol} (
                {currency?.ticker ?? alert.symbol}/USDT) {alert.direction} by{" "}
                {Math.abs(alert.percentageChange).toFixed(2)}% since you
                opened the page.
              </Typography>

              <Typography variant="caption">
                Initial: {formatPrice(alert.initialPrice)} USDT · Current:{" "}
                {formatPrice(alert.currentPrice)} USDT · Direction:{" "}
                {alert.direction}
              </Typography>
            </AppAlert>
          );
        })}
      </Stack>
    )}</>
  )
}
