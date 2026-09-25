import type { CSSProperties } from 'react'
import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles'
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

  interface Palette {
    headerPrimary: PaletteColor
    headerMuted: PaletteColor
    headerCaption: PaletteColor
  }

  interface PaletteOptions {
    headerPrimary?: PaletteColorOptions
    headerMuted?: PaletteColorOptions
    headerCaption?: PaletteColorOptions
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    spanBold: true
    body2Bold: true
  }

  interface TypographyPropsColorOverrides {
    headerPrimary: true
    headerMuted: true
    headerCaption: true
  }
}
