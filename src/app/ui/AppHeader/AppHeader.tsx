import { AppBar, Button, Container, Link, Stack, Toolbar, Typography } from '@mui/material'

import { ConnectionStatus } from '../../../shared/ui/connection-status'
import type { IAppHeaderProps } from './types'

export function AppHeader({ connectionStatus, mode, onToggleMode }: IAppHeaderProps) {
  return (
    <AppBar
      component="header"
      position="static"
      elevation={0}
      className="border-b border-white/10 bg-header"
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
              Kursi{' '}
              <Typography variant="spanBold" color="headerMuted">
                Crypto
              </Typography>
            </Link>

            <Typography variant="caption" color="headerCaption">
              Market dashboard
            </Typography>
          </Stack>

          <Stack className="flex-row flex-wrap items-center gap-2">
            <ConnectionStatus status={connectionStatus} />
            <Button
              onClick={onToggleMode}
              size="small"
              className="text-white"
              aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} theme`}
            >
              {mode === 'light' ? 'Dark mode' : 'Light mode'}
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
