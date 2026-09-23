# Kursi — Feature-Sliced Design

React, TypeScript, Vite, React Compiler, and Tailwind CSS.

## Development

Run npm install, then npm run dev. Validate changes with npm run build and npm run lint.

## Architecture

![Feature-Sliced Design architecture](./design-schema.jpg)

Dependency direction: app -> processes -> pages -> features -> entities -> shared. Layers can import lower layers directly, skipping intermediate layers.

```text
src/
  main.tsx                  React bootstrap
  app/                      Composition, routing, providers
    App.tsx
    index.ts
    styles/index.css        Global CSS, theme tokens, and Tailwind
    ui/AppHeader/           Brand and market connection display
  processes/                Reserved for multi-step workflows
  pages/home/
    index.ts                Public API
    ui/                     Market page introduction
  features/                 User actions, grouped into named slices
  entities/                 Domain concepts, grouped into named slices
  shared/                   Domain-independent UI, utilities, configuration
```

The processes layer follows the requested article and stays empty until needed.

## Current implementation

The responsive header and pale background follow the [visual reference](https://pixel-perfect-canvas-2478.lovable.app/). The implementation is written independently. Global Tailwind theme tokens provide the palette for upcoming dashboard components. The main content shares the header's 1280px container and responsive gutters.

The header accepts a typed connection status. It currently displays Disconnected because no WebSocket connection has been implemented. The status component supports connecting, connected, reconnecting, disconnected, and error states with text and a colored indicator. Future connection logic should pass its real state into the header.

The home page contains the market title and introduction. Live Binance prices, search/sorting, persistent favorites and hidden assets, conversion, and session alerts are still to be implemented according to Take-home-assigment.docx. The reference's mock-data behavior is not part of the implementation.

The current UI uses React and Tailwind without additional component libraries. It follows a light palette regardless of system theme; optional theme switching remains future work. A system sans-serif fallback is used when Inter is unavailable.

## Rules for future implementation

- Slices on the same layer remain independent. Compose separate features in a page or higher layer.
- Expose each slice through index.ts. Consumers import the public API, never another slice's internal files.
- Within a slice, use direct relative imports rather than its own barrel. The project currently uses relative paths; no aliases are configured.
- Add segments such as ui, model, api, lib, and types only as needed. App and shared are organized by technical purpose rather than business slices.
- Keep page-specific assets and styles in the page. Keep global styles and the Tailwind import in app/styles/index.css.
- Keep functionality local to its page until extraction has a concrete benefit. Do not add empty components, services, or stores.
- For example, currency conversion belongs in features/convert-currency; a currency domain model belongs in entities/currency; a generic button belongs in shared/ui/button.
- Use Tailwind utilities for new styling where suitable and preserve existing styles unless the task calls for changes.
- Follow the naming, types, import ordering, JSX, and comment conventions in ../rule.md.

## Verification

ESLint restricts upward imports with path patterns. Same-layer isolation and public API boundaries also require review; lint is not a complete dependency graph validator.

Run npm run test:lint after lint rule changes. Run npm run docs:lint after lint configuration changes to regenerate ../rule.md.
