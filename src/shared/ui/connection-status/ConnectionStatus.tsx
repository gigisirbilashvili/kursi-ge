import { Box, Chip } from '@mui/material'

import { CONNECTION_STATUS_CLASSES, CONNECTION_STATUS_LABELS } from './constants'
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
          className={`size-2 rounded-full ${CONNECTION_STATUS_CLASSES[status]}`}
        />
      }
      label={CONNECTION_STATUS_LABELS[status]}
      variant="outlined"
      size="small"
      className="h-7.5 shrink-0 border-white/15 bg-white/5 font-medium text-white/85 [&_.MuiChip-icon]:mr-0.5 [&_.MuiChip-icon]:ml-3"
    />
  )
}
