import { Container, CssBaseline, Link, ThemeProvider } from '@mui/material'

import { HomePage } from '../pages/home'
import { useMarketFeed } from '../entities/currency'
import { theme } from './config/theme'
import { AppHeader } from './ui/AppHeader/AppHeader'

export function App() {
  const { snapshot, retry } = useMarketFeed()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Link href="#main-content" sx={{ position: 'fixed', top: 8, left: 16, zIndex: 1500, transform: 'translateY(-200%)', bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, '&:focus': { transform: 'translateY(0)' } }}>
        Skip to content
      </Link>
      <AppHeader connectionStatus={snapshot.status} />
      <Container component="main" id="main-content" tabIndex={-1} maxWidth="lg" sx={{ py: { xs: 4, sm: 5 }, outline: 'none' }}>
        <HomePage market={snapshot} onRetry={retry} />
      </Container>
    </ThemeProvider>
  )
}
