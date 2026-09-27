import type { CSSProperties } from 'react'
import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles'
import type {} from '@mui/material/AppBar'
import type {} from '@mui/material/Button'
import type {} from '@mui/material/Chip'
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
    brandSoft: PaletteColor
    positiveSoft: PaletteColor
    negativeSoft: PaletteColor
    neutralSoft: PaletteColor
    warningSoft: PaletteColor
    header: PaletteColor
    headerBorder: PaletteColor
    headerStatus: PaletteColor
    headerPrimary: PaletteColor
    headerMuted: PaletteColor
    headerCaption: PaletteColor
    surfaceShadow: PaletteColor
    statusPending: PaletteColor
    badgeAmber: PaletteColor
    badgeViolet: PaletteColor
    badgeEmerald: PaletteColor
    badgeYellow: PaletteColor
    badgeSlate: PaletteColor
    badgeBlue: PaletteColor
    badgeRed: PaletteColor
  }

  interface PaletteOptions {
    brandSoft?: PaletteColorOptions
    positiveSoft?: PaletteColorOptions
    negativeSoft?: PaletteColorOptions
    neutralSoft?: PaletteColorOptions
    warningSoft?: PaletteColorOptions
    header?: PaletteColorOptions
    headerBorder?: PaletteColorOptions
    headerStatus?: PaletteColorOptions
    headerPrimary?: PaletteColorOptions
    headerMuted?: PaletteColorOptions
    headerCaption?: PaletteColorOptions
    surfaceShadow?: PaletteColorOptions
    statusPending?: PaletteColorOptions
    badgeAmber?: PaletteColorOptions
    badgeViolet?: PaletteColorOptions
    badgeEmerald?: PaletteColorOptions
    badgeYellow?: PaletteColorOptions
    badgeSlate?: PaletteColorOptions
    badgeBlue?: PaletteColorOptions
    badgeRed?: PaletteColorOptions
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

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    headerPrimary: true
  }
}

declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    header: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    brandSoft: true
    positiveSoft: true
    negativeSoft: true
    neutralSoft: true
    headerStatus: true
  }
}
