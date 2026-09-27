import { createTheme } from '@mui/material/styles'

function createColorTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'
  const secondaryText = isDark ? '#beafba' : '#7c7278'
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#efa7cf' : '#651947' },
      secondary: { main: '#D6BAC9' },
      brandSoft: { main: isDark ? '#422a3b' : '#fdeef3', contrastText: isDark ? '#efa7cf' : '#651947' },
      positiveSoft: { main: isDark ? '#173c30' : '#eaf5ef', contrastText: isDark ? '#6bd4a4' : '#27815b' },
      negativeSoft: { main: isDark ? '#492731' : '#fcecef', contrastText: isDark ? '#ff91a8' : '#ba2646' },
      neutralSoft: { main: isDark ? '#422a3b' : '#fdeef3', contrastText: secondaryText },
      warningSoft: { main: isDark ? '#403324' : '#fff8eb' },
      header: { main: '#24040a', contrastText: '#ffffff' },
      headerBorder: { main: 'rgba(255, 255, 255, 0.1)' },
      headerStatus: { main: 'rgba(255, 255, 255, 0.05)', contrastText: 'rgba(255, 255, 255, 0.85)' },
      background: {
        default: isDark ? '#181218' : '#FCF7F9',
        paper: isDark ? '#251d25' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f7edf3' : '#3A0B1F',
        secondary: secondaryText,
      },
      headerPrimary: { main: '#ffffff' },
      headerMuted: { main: '#d6bac9' },
      headerCaption: { main: 'rgba(255, 255, 255, 0.6)' },
      surfaceShadow: { main: 'rgba(36, 4, 10, 0.03)' },
      statusPending: { main: '#d69c3c' },
      badgeAmber: { main: '#fffbeb', contrastText: '#92400e' },
      badgeViolet: { main: '#f5f3ff', contrastText: '#5b21b6' },
      badgeEmerald: { main: '#ecfdf5', contrastText: '#065f46' },
      badgeYellow: { main: '#fefce8', contrastText: '#854d0e' },
      badgeSlate: { main: '#f1f5f9', contrastText: '#334155' },
      badgeBlue: { main: '#eff6ff', contrastText: '#1e40af' },
      badgeRed: { main: '#fef2f2', contrastText: '#991b1b' },
      divider: isDark ? '#493a46' : '#eadde3',
      success: { main: isDark ? '#6bd4a4' : '#27815b' },
      error: { main: isDark ? '#ff91a8' : '#ba2646' },
      warning: { main: isDark ? '#ebc17b' : '#80551d' },
    },
    breakpoints: { values: { xs: 0, sm: 640, md: 900, lg: 1280, xl: 1536 } },
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      h1: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.025em' },
      h2: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '0.875rem', lineHeight: 1.7 },
      body2: { fontSize: '0.875rem' },
      spanBold: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.7 },
      body2Bold: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.43 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: { spanBold: 'span', body2Bold: 'p' },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { color: secondaryText },
        },
      },
      MuiChip: {
        variants: [
          {
            props: { color: 'headerStatus', variant: 'outlined' },
            style: ({ theme }) => ({
              backgroundColor: theme.palette.headerStatus.main,
              color: theme.palette.headerStatus.contrastText,
              borderColor: theme.palette.headerBorder.main,
            }),
          },
        ],
      },
    },
    shape: { borderRadius: 12 },
  })
}

export const themes = { light: createColorTheme('light'), dark: createColorTheme('dark') }
