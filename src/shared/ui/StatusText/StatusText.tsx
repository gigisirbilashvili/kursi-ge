import { Typography } from '@mui/material'

import type { IStatusTextProps } from './types'

export function StatusText({ children, tone = 'muted', variant = 'body1', className }: IStatusTextProps) {
  return (
    <Typography
      color={tone === 'warning' ? 'warning' : 'textSecondary'}
      variant={variant}
      role="status"
      className={className}
    >
      {children}
    </Typography>
  )
}
