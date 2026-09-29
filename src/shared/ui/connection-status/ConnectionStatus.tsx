import { Box } from '@mui/material'

import { AppChip } from '../AppChip/AppChip'
import type { IConnectionStatusProps } from './types'

export function ConnectionStatus({ label, color, ariaLabel }: IConnectionStatusProps) {
  return (
    <AppChip
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={ariaLabel}
      icon={
        <Box
          component="span"
          aria-hidden="true"
          sx={{ bgcolor: color }}
          className="size-2 rounded-full"
        />
      }
      label={label}
      variant="outlined"
      color="headerStatus"
      className="h-7.5 shrink-0 font-medium [&_.MuiChip-icon]:mr-0.5 [&_.MuiChip-icon]:ml-3"
    />
  )
}
