import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material'

import { HomePage } from '../pages/home'
import { MarketFeedProvider } from '../entities/currency'
import { useSelectedPairs } from '../features/manage-pairs'
import { env } from '../shared/config/env'
import { Toaster } from '../shared/ui/Toaster/Toaster'
import { themes } from './config/theme'
import { useColorMode } from './model/useColorMode'
import { AppHeader } from './ui/AppHeader/AppHeader'
import { AppLayout } from './ui/AppLayout/AppLayout'

export function App() {
  const { mode, toggleMode } = useColorMode()
  const { symbols, currencies, addPair, removePair } = useSelectedPairs()
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={themes[mode]}>
        <CssBaseline enableColorScheme />
        <Toaster mode={mode} />
        <MarketFeedProvider initialOptions={{ streamEndpoint: env.streamEndpoint }} symbols={symbols}>
          <AppLayout header={<AppHeader mode={mode} onToggleMode={toggleMode} />}>
            <HomePage
              currencies={currencies}
              onAddPair={addPair}
              onRemovePair={removePair}
            />
          </AppLayout>
        </MarketFeedProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
