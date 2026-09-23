import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#651947' },
    secondary: { main: '#D6BAC9' },
    background: { default: '#FCF7F9', paper: '#ffffff' },
    text: { primary: '#3A0B1F', secondary: '#7c7278' },
    divider: '#eadde3',
    success: { main: '#27815b' },
    error: { main: '#ba2646' },
    warning: { main: '#80551d' },
  },
  breakpoints: { values: { xs: 0, sm: 640, md: 900, lg: 1280, xl: 1536 } },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    h1: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.025em' },
    h2: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem', lineHeight: 1.7 },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
})
