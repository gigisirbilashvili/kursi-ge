import { AppBar, Container, Link, Stack, Toolbar, Typography } from '@mui/material'

import { useMarketStatus } from '../../../entities/currency'
import { KursiLogo } from '../../../assets'
import { AppButton } from '../../../shared/ui/AppButton/AppButton'
import { ConnectionStatus } from '../../../shared/ui/connection-status'
import type { IAppHeaderProps } from './types'

export function AppHeader({ mode, onToggleMode }: IAppHeaderProps) {
  const connectionStatus = useMarketStatus()
  return (
    <AppBar
      component="header"
      position="static"
      elevation={0}
      color="header"
      sx={{ borderColor: 'headerBorder.main' }}
      className="border-b"
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters className="flex-wrap justify-between gap-3 py-4">
          <Stack className="min-w-0 flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link
              href="/"
              aria-label="Kursi Crypto home"
              underline="none"
              color="headerPrimary"
              className="shrink-0 text-base font-semibold"
            >
              <KursiLogo />
            </Link>

            <Typography variant="caption" color="headerCaption">
              Market dashboard
            </Typography>
          </Stack>

          <Stack className="flex-row flex-wrap items-center gap-2">
            <ConnectionStatus status={connectionStatus} />
            <AppButton
              onClick={onToggleMode}
              size="small"
              color="headerPrimary"
              aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} theme`}
            >
              {mode === 'light' ? 'Dark mode' : 'Light mode'}
            </AppButton>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
