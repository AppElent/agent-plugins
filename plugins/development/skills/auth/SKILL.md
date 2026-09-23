---
name: auth
description: Use when adding or updating Appelent authentication across web or native app targets using the shared auth package.
---

# App authentication

Read `FEATURE.md` and [working with apps](../../references/working-with-apps.md). Inspect the selected targets, existing Clerk/Convex wiring, and the installed package version before changing code.

For a web target, follow the matching `@appelent/auth` README: config-driven HeaderUser, tokens.css, THEME_INIT_SCRIPT, and the Clerk-to-Convex JWT bridge. Preserve routes, app identity, header design, and user provisioning.

For an Expo/native target, follow the package's native section and import `@appelent/auth/native`. Keep Clerk token-cache/secure-store adapters, navigation, provider configuration, and provisioning app-owned. Use the mobile plugin's mobile-foundation skill when adopting the broader native setup; a missing mobile plugin does not justify importing web-only components into native.

Use CLI doctor and env check for supported diagnostics. There is no standalone auth-install recipe: integrate documented package APIs, using recipes only for capabilities actually listed by the installed CLI. Keep credential routing in the app's established environment mechanism.

Verify session loading, login/finalization, logout, new/existing accounts, and backend authorization on every selected target. Read installed local UI-state guidance for loading/error behavior. Record completed target coverage using the common adoption rules, not a hardcoded feature version.

For an update, compare the recorded FEATURE version and package API changes. A dependency bump alone is not verification of app integration.

## Self-improvement

Follow [the catalog reflection](../development-feature/references/self-improvement.md) once per invocation.
