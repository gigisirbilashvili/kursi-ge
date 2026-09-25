import type { CSSProperties } from 'react'
import type {} from '@mui/material/styles'
import type {} from '@mui/material/Typography'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    spanBold: CSSProperties
    body2Bold: CSSProperties
  }

  interface TypographyVariantsOptions {
    spanBold?: CSSProperties
    body2Bold?: CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    spanBold: true
    body2Bold: true
  }
}
