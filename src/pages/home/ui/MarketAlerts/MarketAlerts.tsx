import { Stack, Typography } from '@mui/material'

import { AppAlert } from '../../../../shared/ui/AppAlert/AppAlert'
import type { IMarketAlertsProps } from './types'

export function MarketAlerts({ alerts, hasAlerts }: Readonly<IMarketAlertsProps>) {
  return (
    <>{hasAlerts && (
      <Stack
        aria-label="Significant price alerts"
        sx={{ borderColor: "divider" }}
        className="gap-2 border-b p-5 sm:p-6"
      >
        {alerts.map((alert) => {
          return (
            <AppAlert
              key={alert.id}
              role="alert"
              severity={alert.severity}
              onClose={alert.onDismiss}
            >
              <Typography variant="body2Bold">
                {alert.title}
              </Typography>

              <Typography variant="caption">
                {alert.detail}
              </Typography>
            </AppAlert>
          );
        })}
      </Stack>
    )}</>
  )
}
