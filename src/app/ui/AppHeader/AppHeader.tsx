import { AppBar, Container, Link, Stack, Toolbar, Typography } from '@mui/material'

import { ConnectionStatus } from '../../../shared/ui/connection-status'
import type { IAppHeaderProps } from './types'

export function AppHeader({ connectionStatus }: IAppHeaderProps) {
  return (
    <AppBar component="header" position="static" elevation={0} sx={{ bgcolor: '#24040A', borderBottom: '1px solid #ffffff1a' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 1.5, justifyContent: 'space-between', py: 2 }}>
          <Stack direction="row" sx={{ minWidth: 0, flexWrap: 'wrap', alignItems: 'baseline', columnGap: 1.5, rowGap: 0.5 }}>
            <Link href="/" aria-label="Kursi Crypto home" underline="none" sx={{ color: 'white', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>
              Kursi <Typography component="span" sx={{ color: 'secondary.main', fontWeight: 'inherit' }}>Crypto</Typography>
            </Link>
            <Typography variant="caption" sx={{ color: '#ffffff99' }}>Market dashboard</Typography>
          </Stack>
          <ConnectionStatus status={connectionStatus} />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
