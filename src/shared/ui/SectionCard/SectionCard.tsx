import { Card } from '@mui/material'

import type { ISectionCardProps } from './types'

export function SectionCard({ headingId, children, className, hasShadow = false }: ISectionCardProps) {
  return (
    <Card
      component="section"
      variant="outlined"
      aria-labelledby={headingId}
      sx={hasShadow ? { boxShadow: (theme) => `0 1px 3px ${theme.palette.surfaceShadow.main}` } : undefined}
      className={`mt-8 rounded-2xl${className ? ` ${className}` : ''}`}
    >
      {children}
    </Card>
  )
}
