# Kursi Crypto Dashboard

A frontend-only cryptocurrency dashboard built with React and TypeScript. It receives Binance Spot prices over WebSocket and includes favorites, hidden currencies, search, sorting, conversion, session-change alerts, price history, configurable target alerts, and light/dark themes.

## Installation and running

Use Node.js **20.19+ within 20.x, or 22.12+**, with npm, matching the installed Vite engine requirement. Run commands from the `kursi-ge` directory:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build and local preview:

```bash
npm run build
npm run preview
```

The tracked `.env` contains a public market-data endpoint so a clone can run without an API key:

```dotenv
VITE_MARKET_STREAM_ENDPOINT=wss://data-stream.binance.vision/stream
```

Override it in `.env.local` if necessary. The value is a base combined-stream endpoint; the feed appends its selected streams. Vite includes this configuration in the client build. Restart the development server or rebuild after changing it. [Environment configuration](src/shared/config/env.ts) trims and validates the required value when the module loads.

## Assignment alignment

Reviewed against the supplied **Take-home-assigment.docx** on **2026-09-29**. Source inspection and automated tests indicate that **all 9 core feature areas are implemented**. This is a requirement checklist, not an evaluator's score. Live Binance connectivity and visual behavior at different viewport sizes were not manually retested during this review.

| Core requirement | Status | Current implementation and evidence |
| --- | --- | --- |
| 1. Live cryptocurrency rates | Implemented | Five default pairs: BTC, ETH, SOL, BNB, and XRP against USDT. Quote subscriptions update prices without a page reload. Rows expose symbols, price direction, favorites, and hide actions; hidden items have a separate restore list. See [feed](src/entities/currency/model/createMarketFeed.ts) and [market panel](src/pages/home/ui/MarketPanel/MarketPanel.tsx). |
| 2. Latest price-change indicator | Implemented | Arrows use the latest tick direction, with green for up, red for down, and neutral color for unchanged prices. [Regression tests](src/pages/home/ui/MarketPrice/MarketPrice.test.tsx) cover color changes in both theme modes. |
| 3. Significant price-change alert | Implemented | The first accepted price is the session baseline. Alerts trigger at +2% or -2%, include all required details, and do not repeat while the pair remains in the same threshold zone. See [tracker](src/features/significant-alerts/lib/createAlertTracker.ts) and [alert display preparation](src/pages/home/lib/createMarketAlertViews.ts). |
| 4. Currency calculator | **Implemented** | Source/target selection, amount entry, swap, cross-rate calculation, and invalid/negative input validation are implemented. [useConversionCalculator](src/features/convert-currency/model/useConversionCalculator.ts) updates the displayed result immediately whenever either selected price changes. |
| 5. Persistent favorites | Implemented | Favorite toggles, All/Favorites filtering, and browser-storage persistence. See [preferences hook](src/features/market-preferences/model/useMarketPreferences.ts). |
| 6. Persistent hidden currencies | Implemented | Hide, list hidden currencies, and restore; hidden selections persist. Hiding does not unsubscribe a pair. See [toolbar](src/pages/home/ui/MarketToolbar/MarketToolbar.tsx) and the preferences feature. |
| 7. Search and sorting | Implemented | Search by name, ticker, or pair symbol. Sort by name, current price, or session percentage change in either direction. See [selection rules](src/features/market-preferences/lib/preferences.ts). |
| 8. Connection state and cleanup | Implemented | Connected, reconnecting, and disconnected indicators; automatic retries, manual retry, online/offline handling, socket cleanup, and timer cleanup. See [feed owner](src/entities/currency/model/useMarketFeedOwner.ts) and [lifecycle tests](src/entities/currency/model/useMarketFeed.test.tsx). |
| 9. UI states | Implemented | Loading placeholders, connection/error messages, stale-price labels, empty search results, and waiting/invalid conversion states. See [panel tests](src/pages/home/ui/MarketPanel/MarketPanel.test.tsx). |

### Technical requirements

- React, TypeScript, and Binance WebSocket integration are present. The app has no backend.
- Responsive desktop table and mobile list layouts share row presentation and actions. Tailwind's `md` breakpoint is aligned with MUI at 900 px.
- Feature logic, React state/effects, and WebSocket ownership have separate modules. Shared controls and icons are reused.
- TypeScript types cover component props, market messages, quotes, and feature state. The reviewed source contains no explicit `any` annotations.
- ESLint includes TypeScript, React hooks, accessibility, naming, component-props, import-order, and FSD layer restrictions. There is no Prettier configuration or dedicated format script; linting is the configured code-quality check.
- Favorites and hidden currencies persist in `localStorage`. Storage failures fall back to current-session state and notify the user.

### Optional bonuses

All six listed bonus areas have implementations:

| Bonus | Implementation |
| --- | --- |
| Session price-history chart | [PriceHistory](src/features/price-history/ui/PriceHistory/PriceHistory.tsx) renders an interactive MUI line chart from in-memory session updates. |
| Dynamic pair selection | [PairManager](src/features/manage-pairs/ui/PairManager/PairManager.tsx) adds/removes supported pairs, prevents duplicates, and retains at least one pair. |
| Subscribe/unsubscribe on the existing socket | [createMarketFeed](src/entities/currency/model/createMarketFeed.ts) debounces subscription changes and waits for acknowledgements. |
| Configurable target-price alerts | [Target alerts](src/features/target-alerts/lib/createTargetAlerts.ts) support above/below targets, persistence, one-shot triggering, rearming, and removal. |
| Light/dark theme | [useColorMode](src/app/model/useColorMode.ts) manages the persisted choice; [themes](src/app/config/theme.ts) supply both palettes. |
| Calculator and percentage-change tests | [Calculator tests](src/features/convert-currency/lib/convertCurrency.test.ts) cover calculations and invalid values. [Feed tests](src/entities/currency/model/createMarketFeed.test.ts) cover baseline/percentage calculations; [alert tests](src/features/significant-alerts/lib/createAlertTracker.test.ts) cover thresholds and duplicate suppression. |

## Libraries used

- **React 19 and React DOM**: rendering, hooks, and external-store subscriptions.
- **TypeScript**: application and component types.
- **Vite and React Compiler**: development, production bundling, and compiler optimizations.
- **Material UI, Emotion, and Tailwind CSS**: controls, theme styling, and responsive layouts.
- **MUI X Charts**: session-history chart, axes, and tooltips.
- **React-Toastify**: transient notifications.
- **Jest, React Testing Library, jest-dom, and user-event**: unit and component tests.
- **ESLint and TypeScript/React/accessibility plugins**: code-quality and architecture checks.

## Architecture

The project follows FSD-style layers with downward runtime dependencies:

```text
app → pages → features → entities → shared
```

```text
src/
├── app/                 Application setup, theme, layout, and header
├── pages/home/          Dashboard composition and market display
├── features/
│   ├── manage-pairs/
│   ├── market-preferences/
│   ├── convert-currency/
│   ├── significant-alerts/
│   ├── target-alerts/
│   └── price-history/
├── entities/currency/   Market feed, WebSocket boundary, and quote state
├── shared/              Reusable UI, configuration, storage, and helpers
└── assets/              Icons and logo
```

Within a feature or page:

| Segment | Responsibility |
| --- | --- |
| `ui/` | Entry components call model hooks and render directly. Smaller presentational components receive prepared text, flags, lists, and event handlers. Component parameters destructure their props. |
| `model/` | React state, subscriptions, timers, persistence/notification effects, coordination, and preparation of display state. |
| `lib/` | Business rules, validation, calculations, and reusable transformations. |
| Supporting folders | `types/` holds contracts; `config/` holds configuration; the currency entity's `api/` handles browser sockets and message parsing. |

There is no `containers/` layer. For example, [ConversionCalculator](src/features/convert-currency/ui/ConversionCalculator/ConversionCalculator.tsx) calls its model hook and renders directly; [conversion rules](src/features/convert-currency/lib/convertCurrency.ts) live in `lib/`. Component props are defined in adjacent `types/index.ts` files. Slice entry points use `index.ts`; ESLint checks layer direction but does not enforce every public-API or cross-slice boundary.

`App` owns selected pairs above `MarketFeedProvider`. `HomePage` calls `useHomePageModel` to coordinate significant alerts, target alerts, and price notifications. Feature components manage their own inputs through model hooks. Price and session-change displays subscribe by symbol, while the market panel subscribes to quotes when sorting by market values.

## Technical decisions and assumptions

- **One feed owner:** `MarketFeedProvider` creates a stable market service. Its ownership hook starts/stops the feed and cleans up browser listeners. Descendants consume the existing service through context and `useSyncExternalStore`.
- **Connection recovery:** reconnect delays grow from 1 to 30 seconds. Connections and subscription acknowledgements time out after 12 seconds. Valid ticks reset the backoff. Generation checks ignore callbacks from released connections.
- **Pair changes:** updates are debounced for 500 ms, removals precede additions, and acknowledgements are processed one at a time. Removing a tracked pair clears its quote and history; re-adding it starts a new baseline for that pair. Hiding only affects list visibility.
- **Prices and baselines:** prices are Binance `miniTicker` last prices quoted in USDT. Session percentage change is `(current - initial) / initial * 100`, not Binance's 24-hour percentage. Baselines survive reconnects but reset after a reload or pair removal/re-addition.
- **Freshness:** quotes are treated as stale at 30 seconds. The UI retains last-known prices and suspends conversions when selected prices are stale or disconnected.
- **Calculator:** cross-rate is `source USDT price / target USDT price`. Results exclude fees and use JavaScript numbers, not arbitrary-precision accounting. Input, currency, and relevant market price changes recalculate the displayed result immediately. A regression test publishes changes to both selected prices and checks the result without advancing timers.
- **History:** the latest 360 accepted updates per pair are retained in memory. They are update counts, not candles or a fixed time window. The chart refreshes every 10 seconds, requires two points, and updates immediately on selection changes or first readiness. No historical REST request is made.
- **Alerts:** significant-change alerts retain the latest ten entries. Remaining in the same threshold zone does not create duplicates; returning inside the threshold and crossing again, or crossing to the opposite zone, can create another alert. Up to 20 configurable target alerts are saved; they are evaluated only while the app is open and can trigger immediately if their condition is already met.
- **Persistence:** tracked pairs, favorites, hidden currencies, target alerts, and theme choice use browser storage. Price history and session baselines are not persisted.

## Verification

```bash
npm run lint
npm run build
npm test -- --runInBand
```

Verified on **2026-09-29**: lint passed, production build passed, and **69 tests across 22 suites passed**. The build emitted a large-chunk warning: approximately 914 kB minified / 285 kB gzip for the main JavaScript bundle. These checks validate code and simulated market scenarios, not availability of the external Binance service.

Jest runs `.test.ts` unit tests in Node and `.test.tsx` component tests in jsdom. Coverage includes conversion validation, percentage changes, alert thresholds, storage failures, reconnect backoff, stale data, subscription acknowledgements, cleanup, panel actions, chart sampling, and arrow colors in both themes.

Focused commands:

```bash
npm run test:market
npm run test:dashboard
npm run test:calculator
npm run test:bonuses
npm test -- --runInBand src/pages/home
npm test -- --runInBand src/features/price-history
```

## Remaining work before submission

1. **Run a live browser smoke check.** Confirm Binance data arrives, disconnect/reconnect recovery, persistence after reload, theme switching, and desktop/mobile layouts. Automated tests use controlled feeds.
2. **Consider bundle splitting.** The current build succeeds but exceeds Vite's 500 kB chunk warning threshold. This is an optimization opportunity, not an explicit assignment blocker.
