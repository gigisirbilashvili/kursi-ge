# Kursi Crypto Dashboard

A responsive frontend-only cryptocurrency dashboard with live Binance Spot data. Built with React, TypeScript, Vite, React Compiler, Material UI, Emotion, and Tailwind CSS.

## Development

Run these commands from the repository root:

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The public Binance market feed needs no API key or environment file.

```bash
npm run lint
npm run build
npm run test:market
npm run test:dashboard
npm run test:calculator
npm run test:bonuses
```

Use `npm run preview` after building to preview the production output.

## Architecture

![Feature-Sliced Design architecture](https://feature-sliced.design/assets/ideal-img/visual_schema.b6c18f6.1030.jpg)

Dependency direction: app -> processes -> pages -> features -> entities -> shared. Layers can import lower layers directly, skipping intermediate layers.

```text
src/
  main.tsx                  React bootstrap
  app/                      Composition, routing, providers
    App.tsx
    index.ts
    config/theme.ts         Material UI palette and component defaults
    styles/index.css        Global CSS, theme tokens, and Tailwind
    ui/AppHeader/           Brand and market connection display
  processes/                Reserved for multi-step workflows
  pages/home/
    index.ts                Public API
    ui/                     Market introduction, desktop table, mobile cards
    lib/                    Price formatting
  features/                 User actions, grouped into named slices
    market-preferences/     Favorites, hiding, filtering, sorting, persistence
    significant-alerts/     Session threshold tracking and notifications
    convert-currency/       Live conversion, input validation, and calculator UI
    manage-pairs/           Persistent pair selection and add/remove controls
    price-history/          Session chart from collected WebSocket prices
    target-alerts/          Persistent one-shot target-price alerts
  entities/currency/        Binance transport, quote model, market-feed hook
    api/                    Browser socket adapter and message validation
    config/                 Default pairs, supported market catalog, and timing limits
    model/                  Feed lifecycle and React subscription
    lib/                    Session percentage and tick-direction calculations
    types/                  Domain and transport contracts
  shared/                   Domain-independent UI, utilities, configuration
```

The processes layer follows the requested article and stays empty until needed.

## Current implementation

The responsive header and pale background follow the [visual reference](https://pixel-perfect-canvas-2478.lovable.app/). The implementation is written independently. The app-owned Material UI theme provides the Kursi palette, typography, breakpoints, and component defaults. The main content shares the header's 1280px container and responsive gutters.

The app starts one Binance market feed and passes its current connection status to the header and its snapshot to the home page. The feed uses a single combined WebSocket connection, initially tracking BTC/USDT, ETH/USDT, SOL/USDT, BNB/USDT, and XRP/USDT. Users can add or remove pairs from a curated catalog of ten USDT markets. The header supports connecting, connected, reconnecting, disconnected, and error states with text and a colored indicator. Connected means a valid market update has arrived, not merely that the socket opened.

The current dashboard includes:

- Five live USDT pairs with current price, latest-tick arrows, session percentage change, and loading placeholders.
- Favorite stars and an All/Favorites filter, persisted in `localStorage`.
- Hide controls, a hidden-currency count, and a restore view. Hidden choices survive refresh; hiding does not unsubscribe a pair from the feed.
- Search by name or symbol, with Clear inside the search field and an empty-results state.
- Ascending/descending sorting by name, current price, or signed session percentage change. Search and visibility filters apply before sorting; unpriced currencies stay at the bottom. Live updates can change the order when sorting by price or change.
- Dismissible alerts at ±2% from the first session price. Each alert records the currency, initial/current prices, percentage, and direction. Repeated updates beyond the same threshold do not create duplicates. Returning inside the range rearms the alert; crossing directly to the opposite threshold also triggers a new alert. The latest ten alerts are retained for the current page session.
- A conversion calculator with source/target selectors, decimal amount input, Swap, and a result that updates with live quotes. It supports all currently tracked currencies, including currencies hidden from the market list. Removing a selected currency makes the calculator fall back to an available pair.
- Responsive market cards below 900px and a table on wider screens, plus connection, loading, error, stale-price, and empty states.

The UI uses Material UI with Emotion, including Box, Stack, Typography, AppBar, Card, Table, List, Avatar, Chip, Alert, Button, TextField, Select, Tooltip, and Skeleton. Component styling uses Tailwind classes rather than sx or inline styles. Tailwind theme and utility layers are imported without preflight so MUI form defaults are preserved. The header switches between light and dark Kursi palettes. The first visit follows the system preference; an explicit choice is saved in localStorage. A system sans-serif fallback is used when Inter is unavailable.

## Live market behavior

- Data source: Binance Spot's public market-data endpoint, using combined `@miniTicker` streams. The close-price field `c` supplies the latest price; Binance's 24-hour statistics are not used for session change. See the [official stream documentation](https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md).
- The first valid price for each symbol becomes its session baseline. It survives reconnects and resets when the app is freshly loaded or a removed pair is added again. Percentage change is `(current - initial) / initial * 100`.
- Tick arrows compare current and previous prices. An unchanged tick is neutral. Session change is calculated independently and may point in the opposite direction.
- Prices stay at full numeric precision in the model; formatting occurs only in the UI. Low-priced assets retain additional decimal places.
- Messages must contain the expected stream, event type, supported symbol, a finite positive price, and a positive integer event timestamp. Invalid messages are ignored with an error status; the next valid update clears the error. Older and duplicate timestamps do not overwrite current quotes.
- Failed connections retry after 1, 2, 4, 8, 16, then at most 30 seconds. A valid update resets the backoff. Initial connection attempts time out after 12 seconds; opened connections with no valid updates time out after 30 seconds.
- Browser offline events stop retrying and display Disconnected. Coming online reconnects automatically. A manual Retry connection button is available during errors and reconnection.
- Last-known prices remain visible during outages. Each quote is marked stale when disconnected or when it has not updated for 30 seconds. The calculator withholds its result while either selected quote is stale, missing, or the connection is not connected.
- Socket handlers, retry/watchdog timers, subscriptions, and browser network listeners are cleaned up. Obsolete socket callbacks cannot change the active feed. React Strict Mode is supported.
- The application owns the feed lifecycle; the currency entity has no dependency on pages or app. The home page consumes the entity's public API.

## Calculator behavior

The calculator uses `amount × (source USDT price / target USDT price)`. It derives the result from the latest snapshot without another request or WebSocket connection. Swapping exchanges the two selected currencies and preserves the entered amount. Selecting the same currency gives a 1:1 conversion once its live price is available.

Zero and positive decimal amounts are accepted. Empty input prompts for an amount; negative values, text, comma decimals, exponential input, non-finite values, and amounts above `Number.MAX_SAFE_INTEGER` produce no result. Computation keeps numeric precision until display; results use up to twelve significant digits, with scientific notation for very small values. Results are estimates and exclude fees. Input and currency choices reset on a fresh page load.

## Implemented bonuses

- **Session history:** a responsive, accessible chart shows the latest 360 accepted updates for a selected pair, collected from this session's WebSocket. Timestamps determine horizontal spacing. History survives reconnects but resets on reload or removing a pair. The point limit bounds memory usage; flat prices and loading/disconnected states are supported.
- **Dynamic pairs:** Manage pairs adds/removes BTC, ETH, SOL, BNB, XRP, ADA, DOGE, LINK, AVAX, and LTC against USDT. Five are selected initially; at least one stays selected. The curated catalog avoids accepting nonexistent symbols. Selection persists. Favorites and hidden preferences remain saved when removing a pair.
- **Live subscriptions:** pair changes are batched into Binance SUBSCRIBE/UNSUBSCRIBE commands on the existing connection. Requests are spaced at least 500ms apart, with one awaiting acknowledgment at a time. Rapid edits are coalesced. Removed symbols are ignored immediately; acknowledgments are not parsed as prices. Failed or unacknowledged commands trigger recovery. Reconnects use the latest selection, and cleanup cancels subscription timers.
- **Target alerts:** choose a tracked currency, a positive USDT target, and an inclusive at-or-above/at-or-below condition. Up to 20 alerts are saved locally, including their triggered state. Each fires once and records the triggering price. Rearm enables another trigger; a condition already satisfied fires immediately when a fresh quote is available. Removing a pair pauses its pending alerts until re-added. Missing, stale, and disconnected prices never trigger alerts. These are in-page alerts monitored while the app is open, without background push or email.
- **Light/dark theme:** MUI palettes and Tailwind semantic tokens switch together, including chart, inputs, price changes, and status colors. The choice persists across reloads.
- **Unit tests:** calculator and percentage-change coverage is joined by deterministic subscription, history-retention, target-validation, firing/rearming, saved-state restoration, and stale-data tests.

No additional runtime library was needed. The chart uses an SVG plot rendered through MUI Box; the rest of the UI continues to use MUI and Tailwind classes.

## Rules for future implementation

- Keep static images in `public/images`. Use SVG React components from `shared/ui/icons` for UI icons, with explicit numeric `width` and `height` props on every use. Icons share `TSVGIconProps`, default to `currentColor`, and are decorative by default; the surrounding control supplies its accessible name. For example: `<SortIcon width={15} height={15} />`. The public `sort.svg` is a standalone static version; UI code uses the typed component.
- Slices on the same layer remain independent. Compose separate features in a page or higher layer.
- Expose each slice through index.ts. Consumers import the public API, never another slice's internal files.
- Within a slice, use direct relative imports rather than its own barrel. The project currently uses relative paths; no aliases are configured.
- Add segments such as ui, model, api, lib, and types only as needed. App and shared are organized by technical purpose rather than business slices.
- Keep page-specific assets and styles in the page. Keep global styles and the Tailwind import in app/styles/index.css.
- Keep functionality local to its page until extraction has a concrete benefit. Do not add empty components, services, or stores.
- For example, currency conversion belongs in features/convert-currency; a currency domain model belongs in entities/currency; a generic button belongs in shared/ui/button.
- Use Material UI components for interface elements and layout. Use Tailwind className utilities for styling instead of sx or inline styles, preserving semantic elements through component props. StyledEngineProvider places MUI styles in the mui CSS layer, before Tailwind utilities, so classes override component defaults without !important. Shared palette and typography defaults remain in the MUI theme. Keep the Tailwind import for existing global styles.
- Follow the naming, types, import ordering, JSX, and comment conventions in ../rule.md.

## Verification

ESLint restricts upward imports with path patterns. Same-layer isolation and public API boundaries also require review; lint is not a complete dependency graph validator.

Run npm run test:lint after lint rule changes. Run npm run docs:lint after lint configuration changes to regenerate ../rule.md.

Run `npm run test:calculator` for cross-rate calculations, validation, live quote changes, missing prices, and stale/disconnected handling. Run `npm run test:dashboard` for market preference selection and alert threshold behavior. Run `npm run test:market` for deterministic parser, session-price, out-of-order-message, reconnection/backoff, timeout, offline/retry, and cleanup tests. These use controlled sockets and timers without depending on external market movement. Run `npm run test:bonuses` for target-price validation, firing/rearming, saved-state restoration, and stale/missing quote protection. Browser smoke checks should also confirm real prices update and that desktop and mobile layouts remain readable.
