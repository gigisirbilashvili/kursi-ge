import { formatPrice } from '../../lib/formatPrice'
import type { IMarketPriceProps } from './types'

export function MarketPrice({ quote, isStale }: IMarketPriceProps) {
  if (!quote) return (
    <span className="inline-flex flex-col items-end gap-1.5">
      <span aria-hidden="true" className="h-5 w-24 rounded bg-brand-soft motion-safe:animate-pulse" />
      <span className="text-xs text-muted">Awaiting price</span>
    </span>
  )
  const direction = quote.direction === 'up' ? '↑' : quote.direction === 'down' ? '↓' : '−'
  const color = quote.direction === 'up' ? 'text-status-connected' : quote.direction === 'down' ? 'text-status-disconnected' : 'text-muted'
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-2 font-semibold tabular-nums">
        <span title={`Latest tick: ${quote.direction}`} className={`w-4 shrink-0 text-center ${color}`}>
          <span aria-hidden="true">{direction}</span>
          <span className="sr-only">Latest tick {quote.direction}. </span>
        </span>
        <span className="min-w-[10ch] text-right">{formatPrice(quote.price)}</span>
      </span>
      {isStale && <span className="text-xs font-medium text-stale">Last-known price</span>}
    </span>
  )
}
