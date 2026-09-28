# Kursi Crypto Dashboard

A responsive, frontend-only dashboard for live Binance Spot cryptocurrency prices. It covers the assignment's market view, calculator, favorites, visibility controls, search, sorting, connection states, and optional features.

## Installation

Use Node.js 20.19+ (20.x) or 22.12+ with npm, as required by the installed Vite version. Run these commands from the `kursi-ge` repository root:

```bash
npm install
```

The repository includes a `.env` file with `VITE_MARKET_STREAM_ENDPOINT`, the base endpoint for Binance's public market-data WebSocket. No API key is needed. To use a different endpoint locally, set the same variable in `.env.local`. The app requires this variable at startup.

## Running the project

```bash
npm run dev
```

Open the local URL printed by Vite. To check and preview a production build:

```bash
npm run build
npm run preview
```

## Libraries used

- **React and React DOM** for the interface and state; **TypeScript** for typed application code.
- **Vite** for development and builds, with the **React Compiler** Babel plugin.
- **Material UI and Emotion** for accessible controls, theme palettes, and component styling; **Tailwind CSS** for layout and spacing.
- **MUI X Charts** for the session price-history line chart, time/price axes, and interactive tooltips. The chart uses the existing MUI theme and refreshes every 10 seconds.
- **React-Toastify** for transient notifications.
- **Jest, React Testing Library, jest-dom, and user-event** for tests; **ESLint** for code and architecture rules.

## Architecture

The project uses Feature-Sliced Design to keep page composition, user interactions, domain state, and reusable UI separate. This adds structure for a small application, but makes ownership and dependency direction explicit as features grow.

The runtime code follows Feature-Sliced Design's downward dependency direction: `app → pages → features → entities → shared`. Slices expose their public APIs through `index.ts`, and tests live beside the code they cover.

| Layer               | Responsibility                                                               |
| ------------------- | ---------------------------------------------------------------------------- |
| `app`               | Theme, global styles, providers, and dashboard composition.                  |
| `pages/home`        | The screen that brings market data and user features together.               |
| `features`          | Conversion, pair management, favorites and visibility, history, and alerts.  |
| `entities/currency` | Binance message parsing, market feed, quote state, and connection lifecycle. |
| `shared`            | Reusable controls, notifications, storage helpers, and formatting.           |
| `assets`            | SVG icon components and the Kursi logo.                                     |

There are no `widgets` or `processes` directories in the current app. Market panel composition stays in `pages/home`; generic SVG icons and the logo live in `src/assets`. Component props are defined in adjacent `types/index.ts` files.

### Market feed ownership

`createMarketFeed` owns the WebSocket, parsing, retries, stale-data timers, subscriptions, and market snapshot. `useMarketFeed` bridges that store to React with `useSyncExternalStore`. Its effects only synchronize selected pairs, forward browser online/offline events, and start/stop the service.

`App` is the single feed owner. The hook lazily creates one service per mounted App and passes its snapshot and retry action down to the dashboard. Rerenders and pair changes reuse that instance; removing a dashboard child does not stop it. Unmounting App removes the browser listeners and stops the service. React Strict Mode may start, stop, and restart it during development, with only one socket active at a time.

An App-scoped instance keeps ownership explicit without a global singleton, reference counting, or a context provider. Call the hook once at the dashboard root rather than separately in each price widget. The endpoint and optional injected dependencies are fixed for that mounted instance; symbols remain reactive. The hook's optional third argument accepts the service's socket factory, clock, and timer dependencies for integration tests.

### WebSocket lifecycle

The service uses separate timers for connection timeout, reconnect delay, stale data, subscription debounce, and subscription acknowledgement. A failed connection schedules at most one reconnect, using exponential delays from 1 second up to 30 seconds. A valid market tick resets the backoff. Generation checks ignore socket callbacks and timers belonging to a released connection.

Connections and subscription acknowledgements time out after 12 seconds. An open connection without valid prices becomes stale after 30 seconds. Pair changes are debounced for 500 ms, with removals sent before additions and one acknowledgement awaited at a time. `desiredSymbols` tracks the selection; `subscribedSymbols` tracks the current socket subscriptions.

`parseMarketSocketMessage` parses each message once and returns a typed ticker, subscription response, or invalid-message result. It checks supported symbols, stream names, positive decimal prices, and timestamps. Invalid updates produce error state; valid updates can restore the connected state. React renders the service's `connecting`, `connected`, `reconnecting`, `disconnected`, and `error` statuses.

### Market panel

`pages/home/ui/MarketPanel` composes the header and connection message, alerts, toolbar and hidden-currency controls, desktop table, mobile list, and footer. `useMarketPanel` owns the panel's local controls and reuses `useMarketPreferences` and `selectCurrencies` from the existing market-preferences feature. `getMarketPanelStatus` calculates connection flags, last-update age, and stale quotes.

Desktop and mobile layouts share `MarketCurrencyInfo` and `MarketCurrencyActions`. `MarketPrice` and `SessionChange` remain in the home-page UI. Favorite, hide, and restore behavior stays in the market-preferences feature; presentational sections receive state and callbacks.

### Session price history

`features/price-history` renders the MUI X Charts Community `LineChart` using `market.history` from the same feed. Each currency retains its latest 360 accepted `{ time, price }` updates in memory. These are update counts, not fixed-duration candles, and no historical REST request is made.

The chart shows time and price axes, hover tooltips, low/high values, and the latest price. It follows the MUI theme and fills the available width. At least two points are required; flat-price data is given a small vertical range so the line stays visible. `useSampledValue` refreshes the displayed data every 10 seconds, with immediate updates when changing currencies or receiving the first two points. During a disconnection, existing history stays visible with a paused message. Reloading the page clears session history.

## Implemented features

- Live prices for five default USDT pairs, with latest-price direction, session percentage change, loading placeholders, and responsive table/card layouts. The pair manager can track up to ten supported pairs.
- Favorites, hidden currencies with restore controls, search by name or symbol, and sorting by name, price, or session change. Favorites and visibility survive reloads.
- A calculator with source/target selectors, amount validation, and a swap action. It derives cross-rates from the selected currencies' USDT prices.
- Connection status, automatic reconnection, retry controls, stale-price handling, and clear loading, disconnected, error, and empty-search states.
- Alerts for a change of at least 2% from the first session price, with currency, initial/current price, percentage, and direction. The same threshold does not repeatedly fire until the price returns inside the range.
- Session price history with interactive MUI charts, dynamic WebSocket subscribe/unsubscribe when tracked pairs change, configurable target-price alerts, light/dark themes, and automated tests.

## Technical decisions and assumptions

- The app is frontend-only. It uses one combined Binance `@miniTicker` WebSocket feed and treats USDT as the common quote currency. Pair changes update subscriptions on the existing socket. Socket listeners, timers, and subscriptions are cleaned up; failures reconnect with bounded backoff.
- The first valid price received for a pair is its session baseline. Session baselines, price history, and significant-change alerts reset when the page reloads. Quotes older than 30 seconds are treated as stale, while the last known price remains visible.
- Calculator results are estimates and exclude trading fees. Input or currency changes recalculate immediately; market-only changes are sampled every 30 seconds. Invalid, missing, or stale prices do not produce a conversion result.
- `localStorage` persists favorites, hidden and tracked pairs, target alerts, and theme choice. Storage failures fall back to in-memory state for the current session and surface a notification.
- Notifications appear at the upper right for six seconds. Repeated events update an existing toast; distinct price alerts can appear immediately without waiting in a queue. Inline validation remains visible beside the relevant input.

## Verification

```bash
npx tsc -b
npm run lint
npm run build
npm test -- --runInBand
```

Jest runs unit tests in Node and component tests with React Testing Library in jsdom. Tests sit beside the code they cover, and every `test` or `it` title starts with `should ` (enforced by ESLint). A browser smoke check should confirm live Binance prices, reconnection, and the desktop and mobile layouts.

Focused test commands:

```bash
npm run test:market
npm run test:dashboard
npm run test:calculator
npm run test:bonuses
npm test -- --runInBand src/pages/home
npm test -- --runInBand src/features/price-history
```

Coverage includes WebSocket timeouts, stale data, reconnect backoff, subscription acknowledgements, offline recovery, and old-generation callbacks; hook rerenders and Strict Mode cleanup; market search, favorites, hide/restore, sorting, and alerts; and chart rendering, flat prices, currency selection, and refresh timing. The chart integration tests render the real MUI component with a fixed test width. Jest setup provides a `structuredClone` fallback for jsdom.

The production build currently reports Vite's large-chunk warning. It still completes successfully; chart code splitting is a possible future optimization.
