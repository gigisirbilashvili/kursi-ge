import { Container, Link, StyledEngineProvider, ThemeProvider } from '@mui/material'

import { HomePage } from '../pages/home'
import { useMarketFeed } from '../entities/currency'
import { useSelectedPairs } from '../features/manage-pairs'
import { themes } from './config/theme'
import { useColorMode } from './model/useColorMode'
import { AppHeader } from './ui/AppHeader/AppHeader'

export function App() {
  const { mode, toggleMode } = useColorMode()
  const { symbols, currencies, addPair, removePair } = useSelectedPairs()
  const { snapshot, retry } = useMarketFeed(symbols)
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={themes[mode]}>
        <Link
          href="#main-content"
          className="fixed top-2 left-4 z-[1500] -translate-y-[200%] rounded-xl bg-white px-4 py-2 focus:translate-y-0"
        >
          Skip to content
        </Link>

        <AppHeader connectionStatus={snapshot.status} mode={mode} onToggleMode={toggleMode} />

        <Container
          component="main"
          id="main-content"
          tabIndex={-1}
          maxWidth="lg"
          className="py-8 outline-none sm:py-10"
        >
          <HomePage
            market={snapshot}
            onRetry={retry}
            currencies={currencies}
            onAddPair={addPair}
            onRemovePair={removePair}
          />
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
