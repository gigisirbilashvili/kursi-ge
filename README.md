# Kursi Crypto Dashboard

A responsive, frontend-only dashboard for live Binance Spot cryptocurrency prices. It covers the assignment's market view, calculator, favorites, visibility controls, search, sorting, connection states, and optional features.

## Installation

Install Node.js and npm, then run from the repository root:

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
- **React-Toastify** for transient notifications.
- **Jest, React Testing Library, jest-dom, and user-event** for tests; **ESLint** for code and architecture rules.

## Architecture

- First, I approached the task as if it were not just a take-home assignment, but a real production application that could grow significantly over time.

- nt architectural question: how should we structure the frontend so that it remains maintainable as the product grows, more features are introduced, and a larger development team starts working on it?

- here are several possible approaches. For example, a simple feature-based or component-based structure would be completely reasonable for an application of this size. However, I wanted to think beyond the current scope and consider how the codebase could evolve into a much larger platform.

- For that reason, I chose Feature-Sliced Design.

- For this particular assignment, I understand that FSD can be considered overengineering. However, I made that decision intentionally because it gives us clear architectural boundaries, predictable dependency rules, separation between business features and shared infrastructure, and better scalability from a development-team perspective.

- Of course, FSD also introduces additional structure and complexity, so there is a trade-off. For a small application, I would normally prefer a simpler architecture. In this case, I treated the assignment as an opportunity to demonstrate how I would structure a frontend that is expected to grow.

- The benefits and trade-offs of that decision are something I would be happy to discuss during the interview.

The runtime code follows Feature-Sliced Design's downward dependency direction: `app → pages → features → entities → shared`. Slices expose their public APIs through `index.ts`, and tests live beside the code they cover.

| Layer               | Responsibility                                                               |
| ------------------- | ---------------------------------------------------------------------------- |
| `app`               | Theme, global styles, providers, and dashboard composition.                  |
| `pages/home`        | The screen that brings market data and user features together.               |
| `features`          | Conversion, pair management, favorites and visibility, history, and alerts.  |
| `entities/currency` | Binance message parsing, market feed, quote state, and connection lifecycle. |
| `shared`            | Reusable controls, icons, notifications, storage helpers, and formatting.    |

The repository has an unused `processes` placeholder; no runtime code depends on it. This one-page app does not need a `widgets` layer.

## Implemented features

- Live prices for five default USDT pairs, with latest-price direction, session percentage change, loading placeholders, and responsive table/card layouts. The pair manager can track up to ten supported pairs.
- Favorites, hidden currencies with restore controls, search by name or symbol, and sorting by name, price, or session change. Favorites and visibility survive reloads.
- A calculator with source/target selectors, amount validation, and a swap action. It derives cross-rates from the selected currencies' USDT prices.
- Connection status, automatic reconnection, retry controls, stale-price handling, and clear loading, disconnected, error, and empty-search states.
- Alerts for a change of at least 2% from the first session price, with currency, initial/current price, percentage, and direction. The same threshold does not repeatedly fire until the price returns inside the range.
- Optional session price history, dynamic WebSocket subscribe/unsubscribe when tracked pairs change, configurable target-price alerts, light/dark themes, and automated tests.

## Technical decisions and assumptions

- The app is frontend-only. It uses one combined Binance `@miniTicker` WebSocket feed and treats USDT as the common quote currency. Pair changes update subscriptions on the existing socket. Socket listeners, timers, and subscriptions are cleaned up; failures reconnect with bounded backoff.
- The first valid price received for a pair is its session baseline. Session baselines, price history, and significant-change alerts reset when the page reloads. Quotes older than 30 seconds are treated as stale, while the last known price remains visible.
- Calculator results are estimates and exclude trading fees. Input or currency changes recalculate immediately; market-only changes are sampled every 30 seconds. Invalid, missing, or stale prices do not produce a conversion result.
- `localStorage` persists favorites, hidden and tracked pairs, target alerts, and theme choice. Storage failures fall back to in-memory state for the current session and surface a notification.
- Notifications appear at the upper right for six seconds. Repeated events update an existing toast; distinct price alerts can appear immediately without waiting in a queue. Inline validation remains visible beside the relevant input.

## Verification

```bash
npm run lint
npm run build
npm test -- --runInBand
```

Jest runs unit tests in Node and component tests with React Testing Library in jsdom. Tests sit beside the code they cover, and every `test` or `it` title starts with `should ` (enforced by ESLint). A browser smoke check should confirm live Binance prices, reconnection, and the desktop and mobile layouts.
