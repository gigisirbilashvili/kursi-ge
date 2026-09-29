import { Container, Link } from '@mui/material'

import type { IAppLayoutProps } from './types'

export function AppLayout({ header, children }: IAppLayoutProps) {
  return <>
    <Link
      href="#main-content"
      sx={{ bgcolor: 'background.paper' }}
      className="fixed top-2 left-4 z-[1500] -translate-y-[200%] rounded-xl px-4 py-2 focus:translate-y-0"
    >
      Skip to content
    </Link>
    {header}
    <Container component="main" id="main-content" tabIndex={-1} maxWidth="lg" className="py-8 outline-none sm:py-10">
      {children}
    </Container>
  </>
}
