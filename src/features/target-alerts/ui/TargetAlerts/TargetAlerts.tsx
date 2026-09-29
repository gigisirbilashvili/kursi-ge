import { Stack } from '@mui/material'

import { useTargetAlertsModel } from '../../model/useTargetAlertsModel'
import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import { TargetAlertForm } from '../TargetAlertForm/TargetAlertForm'
import { TargetAlertItem } from '../TargetAlertItem/TargetAlertItem'
import type { ITargetAlertsProps } from './types'

export function TargetAlerts(props: ITargetAlertsProps) {
  const {
    form,
    items,
    isFull,
    isEmpty,
  } = useTargetAlertsModel(props)
  return (
    <SectionCard headingId="target-alert-heading" className="p-5 sm:p-6">
      <SectionHeader
        headingId="target-alert-heading"
        title="Price alerts"
        description="Choose a target in USDT. Alerts fire once when the condition is met, including if it is already met. Saved on this device; monitored while this page is open."
      />

      <TargetAlertForm {...form} />

      {isFull && (
        <StatusText className="mt-3">
          Limit of 20 alerts reached. Remove an alert to add another.
        </StatusText>
      )}

      <Stack className="mt-5 gap-3">
        {isEmpty && <StatusText>No target alerts yet.</StatusText>}
        {items.map(({ id, ...item }) => <TargetAlertItem key={id} {...item} />)}
      </Stack>
    </SectionCard>
  )
}
