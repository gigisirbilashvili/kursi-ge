import { CONNECTION_STATUS_COLORS, CONNECTION_STATUS_LABELS } from './constants'
import type { IConnectionStatusProps } from './types'

export function ConnectionStatus({ status }: IConnectionStatusProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs leading-4 font-medium text-white/85"
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${CONNECTION_STATUS_COLORS[status]}`} />
      <span className="sr-only">Market connection: </span>
      {CONNECTION_STATUS_LABELS[status]}
    </span>
  )
}
