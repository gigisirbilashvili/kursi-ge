import { Card, Stack, Typography } from '@mui/material'

import { TargetAlertForm } from '../TargetAlertForm/TargetAlertForm'
import { TargetAlertItem } from '../TargetAlertItem/TargetAlertItem'
import type { ITargetAlertsProps } from './types'

export function TargetAlerts({
  currencies,
  market,
  alerts,
  onAdd,
  onRearm,
  onRemove,
}: ITargetAlertsProps) {
  const isFull = alerts.length >= 20

  return (
    <Card
      component="section"
      variant="outlined"
      aria-labelledby="target-alert-heading"
      className="mt-8 rounded-2xl p-5 sm:p-6"
    >
      <Typography component="h2" variant="h2" id="target-alert-heading">
        Price alerts
      </Typography>

      <Typography color="textSecondary" className="mt-1">
        Choose a target in USDT. Alerts fire once when the condition is met, including if it is
        already met. Saved on this device; monitored while this page is open.
      </Typography>

      <TargetAlertForm currencies={currencies} isFull={isFull} onAdd={onAdd} />

      {isFull && (
        <Typography color="textSecondary" role="status" className="mt-3">
          Limit of 20 alerts reached. Remove an alert to add another.
        </Typography>
      )}

      <Stack className="mt-5 gap-3">
        {!alerts.length && <Typography color="textSecondary">No target alerts yet.</Typography>}
        {alerts.map((alert) => (
          <TargetAlertItem
            key={alert.id}
            alert={alert}
            currencies={currencies}
            marketStatus={market.status}
            onRearm={onRearm}
            onRemove={onRemove}
          />
        ))}
      </Stack>
    </Card>
  )
}
