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
      icon={<Box component="span" aria-hidden="true" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CONNECTION_STATUS_COLORS[status] }} />}
      label={CONNECTION_STATUS_LABELS[status]}
      variant="outlined"
      size="small"
      sx={{ flexShrink: 0, height: 30, color: '#ffffffd9', borderColor: '#ffffff26', bgcolor: '#ffffff0d', '& .MuiChip-icon': { ml: 1.5, mr: 0.25 } }}
    />
  )
}
