import { ConnectionStatus } from '../../../shared/ui/connection-status'
import type { IAppHeaderProps } from './types'

export function AppHeader({ connectionStatus }: IAppHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-header">
      <div className="mx-auto flex min-h-15 w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <a href="/" aria-label="Kursi Crypto home" className="shrink-0 rounded-sm text-base font-semibold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-muted">
            Kursi <span className="text-brand-muted">Crypto</span>
          </a>
          <span className="text-xs text-white/60">Market dashboard</span>
        </div>
        <ConnectionStatus status={connectionStatus} />
      </div>
    </header>
  )
}
