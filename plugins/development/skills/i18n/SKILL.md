---
name: i18n
description: Use when adding or extending app-wide localization, shared message dictionaries, locales, or web/native locale integration using Appelent packages.
---

# App-wide localization

Read `FEATURE.md` and [working with apps](../../references/working-with-apps.md). Identify the app's actual locales, target platforms, existing message ownership, persistence, and optional account preference synchronization.

Keep shared product vocabulary and typed dictionaries in an existing shared/core module when multiple targets use them. Platform-only copy can stay with its target. Preserve existing translations and choose one locale policy across the app; do not create unrelated web/native dictionaries for the same domain merely because there are two entry points.

Read the installed `@appelent/i18n` README for API and export contracts. There is no dedicated i18n CLI recipe. Use CLI diagnostics where relevant, then implement app-specific integration:

- **Web:** load the web plugin's `web-i18n` skill for the existing TanStack SSR, cookie, HTML lang, language-toggle, and optional Clerk-sync procedure. If unavailable, report the missing platform procedure and use the matching package README for supported integration; do not invent its contents.
- **Native:** use `@appelent/i18n/native` with app-owned device and preference adapters. Locale resolution is synchronous for the first frame; asynchronous storage hydration must be explicitly handled by the app. Keep browser cookies, document access, and TanStack server imports out of native code. Use mobile-foundation for broader provider wiring when available.

Load the app's local guidelines for long translations, larger text, and platform interactions. Verify message parity, interpolation/plurals, supported and unsupported saved locales, locale changes, persistence, and each target's first render. Web checks cover SSR/hydration; native checks include a device pass. Record only verified target coverage with the current FEATURE version.

## Self-improvement

Follow [the catalog reflection](../development-feature/references/self-improvement.md) once per invocation.
