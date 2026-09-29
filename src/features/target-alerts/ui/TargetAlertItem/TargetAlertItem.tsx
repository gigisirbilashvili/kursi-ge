import { Box, Stack, Typography } from '@mui/material'

import { AppAlert } from '../../../../shared/ui/AppAlert/AppAlert'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import type { ITargetAlertItemProps } from './types'

export function TargetAlertItem({
  title,
  statusText,
  hasTriggered,
  rearmLabel,
  removeLabel,
  onRearm,
  onRemove,
}: ITargetAlertItemProps) {
  return (
    <AppAlert
      role={hasTriggered ? 'status' : 'note'}
      severity={hasTriggered ? 'success' : 'info'}
      icon={false}
      className="[&_.MuiAlert-message]:w-full"
    >
      <Stack className="flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Box>
          <Typography component="p" variant="spanBold">
            {title}
          </Typography>
          <Typography variant="body2">{statusText}</Typography>
        </Box>

        <Stack className="flex-row gap-2">
          {hasTriggered && (
            <AppButton onClick={onRearm} aria-label={rearmLabel}>
              Rearm
            </AppButton>
          )}
          <AppButton onClick={onRemove} aria-label={removeLabel}>
            Remove
          </AppButton>
        </Stack>
      </Stack>
    </AppAlert>
  )
}
