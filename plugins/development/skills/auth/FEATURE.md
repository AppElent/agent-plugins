---
name: auth
version: 3
description: Clerk-based authentication UI and theming shared across Appelent apps
package: "@appelent/auth"
---

# Auth

## What

Shared authentication chrome and theming for Appelent apps: a router-free,
config-driven `HeaderUser` component, theme tokens (`tokens.css`), and
`THEME_INIT_SCRIPT` for no-flash theme initialization. Clerk provides the
actual auth; Convex consumes it via the JWT template named `convex`.

## Stack

- Native option: `@appelent/auth/native` headless helpers; apps supply Clerk and secure-storage adapters, translated errors, navigation and provisioning. No Expo import is added to the web entry.

- Package: `@appelent/auth` (GitHub Packages)
- Auth provider: Clerk (`@clerk/clerk-react` peer dependency)
- Backend bridge: Convex `auth.config.ts` with the `convex` JWT template

## Architecture

- Apps import UI from the package barrel export; app-specific look comes
  from configuration, not forks.
- `THEME_INIT_SCRIPT` is inlined in `__root.tsx` `<head>`.
- The package README (`packages/auth/README.md`) is the integration
  source of truth, including for non-Claude agents.

## Configuration

- `.npmrc` GitHub Packages mapping for the `@appelent` scope (baseline)
- Clerk env vars per the app's `@t3-oss/env-core` schema
- `tokens.css` imported in the app's root stylesheet

## Changelog

- 3 — Route app-wide adoption through development, load pinned local guidelines, and verify platform-specific coverage.

- 2 — Separate native auth helpers and explicit app-owned adapter, copy and provisioning boundaries. Existing web integration remains supported.

- 1 — initial capture
