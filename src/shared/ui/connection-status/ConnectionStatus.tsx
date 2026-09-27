import { Box, Chip } from '@mui/material'

import { CONNECTION_STATUS_COLORS, CONNECTION_STATUS_LABELS } from './constants'
import type { IConnectionStatusProps } from './types'

export function ConnectionStatus({ status }: IConnectionStatusProps) {
  return (
    <Chip
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Market connection: ${CONNECTION_STATUS_LABELS[status]}`}
      icon={
        <Box
          component="span"
          aria-hidden="true"
          sx={{ bgcolor: CONNECTION_STATUS_COLORS[status] }}
          className="size-2 rounded-full"
        />
      }
      label={CONNECTION_STATUS_LABELS[status]}
      variant="outlined"
      color="headerStatus"
      size="small"
      className="h-7.5 shrink-0 font-medium [&_.MuiChip-icon]:mr-0.5 [&_.MuiChip-icon]:ml-3"
    />
  )
}
