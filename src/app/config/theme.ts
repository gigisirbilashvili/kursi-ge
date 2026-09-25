import { createTheme } from '@mui/material/styles'

function createColorTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#efa7cf' : '#651947' },
      secondary: { main: '#D6BAC9' },
      background: {
        default: isDark ? '#181218' : '#FCF7F9',
        paper: isDark ? '#251d25' : '#ffffff',
      },
      text: { primary: isDark ? '#f7edf3' : '#3A0B1F', secondary: isDark ? '#beafba' : '#7c7278' },
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
    },
    shape: { borderRadius: 12 },
  })
}

export const themes = { light: createColorTheme('light'), dark: createColorTheme('dark') }
