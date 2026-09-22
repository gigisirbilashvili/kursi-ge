# Architecture instructions

All future implementation must follow Feature-Sliced Design and the detailed rules in README.md.

- Dependency direction: app → processes → pages → features → entities → shared. Import only lower layers or code inside the current slice.
- Keep same-layer slices independent. Compose them in a higher layer.
- Expose slices through index.ts. Consumers use public APIs; internal code uses direct relative imports.
- app owns composition, routing, providers, and global styles. main.tsx only bootstraps React.
- pages contains screens; features contains user actions; entities contains domain concepts; shared contains domain-independent building blocks. processes is reserved for workflows following the requested article.
- Create slices and segments only for actual functionality. Keep page-specific assets and styles with the page.
- Keep Tailwind's import in src/app/styles/index.css. Use Tailwind utilities for new styling where appropriate.
- Follow ../rule.md and existing ESLint conventions, including I-prefixed interfaces, E-prefixed enums, adjacent types folders for component props, type-only imports, and TODO:: comments only.
- Run npm run build and npm run lint after implementation. Run npm run test:lint for lint changes and npm run docs:lint after lint configuration changes.
- Review same-layer isolation and public API usage manually: current lint restrictions check upward import path patterns, not a complete dependency graph.
