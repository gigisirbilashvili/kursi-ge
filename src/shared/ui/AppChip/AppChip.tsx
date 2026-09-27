import { Chip } from '@mui/material'

import type { IAppChipProps } from './types'

export function AppChip({ isBrand = false, size = 'small', color, className, ...props }: IAppChipProps) {
  return (
    <Chip
      size={size}
      color={isBrand ? 'brandSoft' : color}
      className={isBrand ? `text-xs font-medium ${className ?? ''}`.trim() : className}
      {...props}
    />
  )
}
