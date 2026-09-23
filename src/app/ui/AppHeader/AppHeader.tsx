import { AppBar, Container, Link, Stack, Toolbar, Typography } from '@mui/material'

import { ConnectionStatus } from '../../../shared/ui/connection-status'
import type { IAppHeaderProps } from './types'

export function AppHeader({ connectionStatus }: IAppHeaderProps) {
  return (
    <AppBar component="header" position="static" elevation={0} className="border-b border-white/10 bg-header">
      <Container maxWidth="lg">
        <Toolbar disableGutters className="justify-between gap-3 py-4">
          <Stack className="min-w-0 flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link href="/" aria-label="Kursi Crypto home" underline="none" className="shrink-0 text-base font-semibold text-white">
              Kursi <Typography component="span" className="font-semibold text-brand-muted">Crypto</Typography>
            </Link>
            <Typography variant="caption" className="text-white/60">Market dashboard</Typography>
          </Stack>
          <ConnectionStatus status={connectionStatus} />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
