# Kursi — Feature-Sliced Design

React, TypeScript, Vite, React Compiler, and Tailwind CSS.

## Development

Run npm install, then npm run dev. Validate changes with npm run build and npm run lint.

## Architecture

Reference: https://serhiikoziy.medium.com/feature-sliced-design-architecture-in-react-with-typescript-447dc5e6a411

Dependency direction: app -> processes -> pages -> features -> entities -> shared. Layers can import lower layers directly, skipping intermediate layers.

```text
src/
  main.tsx                  React bootstrap
  app/                      Composition, routing, providers
    App.tsx
    index.ts
    styles/index.css        Global CSS and Tailwind
  processes/                Reserved for multi-step workflows
  pages/home/
    index.ts                Public API
    ui/                     HomePage and styles
    assets/                 Starter screen images
  features/                 User actions, grouped into named slices
  entities/                 Domain concepts, grouped into named slices
  shared/                   Domain-independent UI, utilities, configuration
```

The processes layer follows the requested article and stays empty until needed. The original starter screen remains the home page.

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
