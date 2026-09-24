import { Container, Link, StyledEngineProvider, ThemeProvider } from '@mui/material'

import { HomePage } from '../pages/home'
import { useMarketFeed } from '../entities/currency'
import { theme } from './config/theme'
import { AppHeader } from './ui/AppHeader/AppHeader'

export function App() {
  const { snapshot, retry } = useMarketFeed()
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={theme}>
        <Link
          href="#main-content"
          className="fixed top-2 left-4 z-[1500] -translate-y-[200%] rounded-xl bg-white px-4 py-2 focus:translate-y-0"
        >
          Skip to content
        </Link>

        <AppHeader connectionStatus={snapshot.status} />

        <Container
          component="main"
          id="main-content"
          tabIndex={-1}
          maxWidth="lg"
          className="py-8 outline-none sm:py-10"
        >
          <HomePage market={snapshot} onRetry={retry} />
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
