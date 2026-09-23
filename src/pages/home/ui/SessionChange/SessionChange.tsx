import { formatPrice } from '../../lib/formatPrice'
import type { ISessionChangeProps } from './types'

export function SessionChange({ quote }: ISessionChangeProps) {
  if (!quote) return <span className="text-muted" aria-label="Session change unavailable">—</span>
  const change = quote.percentageChange
  const formatted = change !== 0 && Math.abs(change) < 0.0001
    ? `${change > 0 ? '+' : '−'}<0.0001`
    : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: Math.abs(change) < 0.01 ? 4 : 2, signDisplay: 'exceptZero' }).format(change)
  const color = change > 0 ? 'bg-positive-soft text-status-connected' : change < 0 ? 'bg-negative-soft text-status-disconnected' : 'bg-brand-soft text-muted'
  return (
    <span
      title={`Since the first session price of ${formatPrice(quote.initialPrice)} USDT`}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${color}`}
    >
      <span aria-hidden="true" className="w-4 shrink-0 text-center text-lg leading-none">{change > 0 ? '↑' : change < 0 ? '↓' : '−'}</span>
      <span>{formatted}%</span>
    </span>
  )
}
