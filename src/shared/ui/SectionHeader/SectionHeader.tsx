import { Box, Typography } from '@mui/material'

import type { ISectionHeaderProps } from './types'

export function SectionHeader({
  title,
  description,
  headingId,
  descriptionVariant = 'body1',
}: ISectionHeaderProps) {
  return (
    <Box>
      <Typography component="h2" variant="h2" id={headingId}>
        {title}
      </Typography>
      <Typography color="textSecondary" variant={descriptionVariant} className="mt-1">
        {description}
      </Typography>
    </Box>
  )
}
