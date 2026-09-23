import { useEffect, useState } from 'react'

import { CURRENCIES, STALE_TIMEOUT_MS } from '../../../../entities/currency'
import { MarketPrice } from '../MarketPrice/MarketPrice'
import { SessionChange } from '../SessionChange/SessionChange'
import type { IMarketPanelProps } from './types'

export function MarketPanel({ snapshot, onRetry }: IMarketPanelProps) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const hasPrices = Object.keys(snapshot.quotes).length > 0
  const isConnected = snapshot.status === 'connected'
  const isWaiting = !hasPrices && (snapshot.status === 'connecting' || snapshot.status === 'reconnecting')
  const isUnavailable = !isConnected && snapshot.status !== 'connecting'
  const latestUpdate = Math.max(0, ...Object.values(snapshot.quotes).map(({ receivedAt }) => receivedAt))
  const age = latestUpdate ? Math.max(0, Math.floor((now - latestUpdate) / 1000)) : null
  const isQuoteStale = (symbol: string) => !isConnected || now - (snapshot.quotes[symbol]?.receivedAt ?? 0) >= STALE_TIMEOUT_MS

  return (
    <section aria-labelledby="spot-market-heading" className="mt-8 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <h2 id="spot-market-heading" className="text-base font-semibold">Spot markets</h2>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">{CURRENCIES.length} assets</span>
        </div>
        <span className="text-xs text-muted">Binance · USDT pairs</span>
      </div>

      <div role="status" aria-live="polite" className={`border-b border-border px-5 py-3 text-sm sm:px-6 ${isUnavailable ? 'bg-warning-soft text-stale' : 'bg-background text-muted'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            {snapshot.message ?? (isConnected ? 'Receiving market prices from Binance.' : 'Connecting to Binance. Waiting for the first prices…')}
            {isUnavailable && hasPrices && ' Last-known prices are shown below.'}
          </p>
          {isUnavailable && (
            <button type="button" onClick={onRetry} disabled={snapshot.status === 'disconnected'} className="min-h-10 rounded-lg border border-brand-muted bg-white px-4 py-2 text-xs font-semibold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50">
              Retry connection
            </button>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Live cryptocurrency prices in USDT, latest tick direction, and percentage change since opening this page.</caption>
          <thead className="border-b border-border bg-white text-xs text-muted">
            <tr>
              <th scope="col" className="px-6 py-4 text-left font-medium">Asset</th>
              <th scope="col" className="px-6 py-4 text-right font-medium">Price (USDT)</th>
              <th scope="col" className="px-6 py-4 text-right font-medium">Change since opening</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CURRENCIES.map((currency) => (
              <tr key={currency.symbol} className="transition-colors hover:bg-background">
                <th scope="row" aria-label={`${currency.name}, ${currency.ticker}/USDT`} className="px-6 py-5 text-left font-normal">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${currency.badgeClass}`}>{currency.ticker}</span>
                    <div><p className="font-semibold">{currency.name}</p><p className="mt-1 text-xs text-muted">{currency.ticker}/USDT</p></div>
                  </div>
                </th>
                <td className="px-6 py-5 text-right"><MarketPrice quote={snapshot.quotes[currency.symbol]} isStale={isQuoteStale(currency.symbol)} /></td>
                <td className="px-6 py-5 text-right"><SessionChange quote={snapshot.quotes[currency.symbol]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label="Cryptocurrency markets" className="divide-y divide-border sm:hidden">
        {CURRENCIES.map((currency) => (
          <li key={currency.symbol} className="px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${currency.badgeClass}`}>{currency.ticker}</span>
                <div><p className="text-sm font-semibold">{currency.name}</p><p className="mt-1 text-xs text-muted">{currency.ticker}/USDT</p></div>
              </div>
              <div className="text-right text-sm"><MarketPrice quote={snapshot.quotes[currency.symbol]} isStale={isQuoteStale(currency.symbol)} /></div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 text-xs">
              <span className="text-muted">Since opening</span>
              <SessionChange quote={snapshot.quotes[currency.symbol]} />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background px-5 py-4 text-xs leading-5 text-muted sm:px-6">
        <p>Arrows beside prices show the latest tick. Percentages compare with your first session price.</p>
        <p>{age === null ? (isWaiting ? 'Waiting for market data' : 'No prices received') : `Last update ${age < 2 ? 'just now' : `${age}s ago`}`}</p>
      </div>
    </section>
  )
}
