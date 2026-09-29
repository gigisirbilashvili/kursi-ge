import { Container, CssBaseline, Link, StyledEngineProvider, ThemeProvider } from '@mui/material'

import { HomePage } from '../pages/home'
import { MarketFeedProvider } from '../entities/currency'
import { useSelectedPairs } from '../features/manage-pairs'
import { env } from '../shared/config/env'
import { Toaster } from '../shared/ui/Toaster/Toaster'
import { themes } from './config/theme'
import { useColorMode } from './model/useColorMode'
import { AppHeader } from './ui/AppHeader/AppHeader'

export function App() {
  const { mode, toggleMode } = useColorMode()
  const { symbols, currencies, addPair, removePair } = useSelectedPairs()
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={themes[mode]}>
        <CssBaseline enableColorScheme />
        <Toaster mode={mode} />
        <Link
          href="#main-content"
          sx={{ bgcolor: 'background.paper' }}
          className="fixed top-2 left-4 z-[1500] -translate-y-[200%] rounded-xl px-4 py-2 focus:translate-y-0"
        >
          Skip to content
        </Link>

        <MarketFeedProvider initialOptions={{ streamEndpoint: env.streamEndpoint }} symbols={symbols}>
          <AppHeader mode={mode} onToggleMode={toggleMode} />

          <Container
            component="main"
            id="main-content"
            tabIndex={-1}
            maxWidth="lg"
            className="py-8 outline-none sm:py-10"
          >
            <HomePage
              currencies={currencies}
              onAddPair={addPair}
              onRemovePair={removePair}
            />
          </Container>
        </MarketFeedProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
