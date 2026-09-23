import { MarketPanel } from './MarketPanel/MarketPanel'
import type { IHomePageProps } from './types'

function HomePage({ market, onRetry }: IHomePageProps) {
  return (
    <section aria-labelledby="market-heading">
      <h1 id="market-heading" className="text-2xl leading-9 font-semibold tracking-tight sm:text-3xl">
        Crypto market
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Live prices, your favorites, and instant conversions.
      </p>
      <p className="mt-3 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
        Prices quoted in USDT · Binance Spot
      </p>
      <MarketPanel snapshot={market} onRetry={onRetry} />
    </section>
  )
}

export default HomePage
