---
name: mobile-foundation
description: Use when adding an Expo native target to an Appelent app or adopting shared native setup, auth, locale and release mechanisms in an existing mobile app.
---

# Adopt native mobile capabilities

## App-local guidelines

Before implementing or reviewing an app, read docs/guidelines/shared/README.md when present, load the relevant sets, then read docs/guidelines/app.md for app decisions and documented exceptions. These are the app's pinned rules. Report missing guideline setup when relevant; do not install or update it as a side effect of a UI review.

## Task

### 1. Establish the native boundary

Read `FEATURE.md`, the installed @appelent/dev README/help, app package targets and current Expo/EAS config. Preserve identifiers, routes, theme, SDK and provider ownership. Mobile is explicit opt-in. Use the installed mobile front door/design/rules/release skills when relevant; avoid copying their checklists into the app. Read the app's local guideline index and app.md. Use this plugin's mobile-design, mobile-rules, and mobile-release skills for the relevant review.

### 2. Plan and apply supported wiring

Inspect appelent --version, --help, and capabilities --json. Plan mobile.foundation explicitly with recipe plan; for release configuration also plan mobile.release. Review conflicts and manual requirements, then apply and verify only the requested capabilities. Use development's dev skill when available; otherwise use the installed CLI docs. A plugin supplies no CLI executable.

Read the package READMEs before integrating `@appelent/auth/native` or `@appelent/i18n/native`; keep navigation, copy, dictionaries, Clerk token-cache/secure-store wiring and user provisioning app-owned. The native locale helper accepts synchronous device and preference adapters and resolves the first frame synchronously; async hydration is an app concern.

Use workspace-selected backend URLs and explicit Metro ports. A physical device must be able to reach a local backend; loopback from a phone is not the host. Persistent backend/Metro run actions remain separate from setup.

### 3. Verify development and release separately

Build/typecheck core before dependent targets. Run native pure-logic/UI tests and app typecheck, then exercise a development client on device. Cover session loading, login/finalization/logout, new-user provisioning, both locales, persistence, keyboard, safe areas, network recovery and main navigation.

For release, verify profile/environment/channel and native runtime compatibility before choosing build or OTA update. Pass the resolved runtime from the selected existing binary to the pure `validateNativeOtaRelease` guard; it rejects missing, policy or placeholder runtimes and does not calculate fingerprints or query EAS. Separate build, update and submit authorization. Signing/store membership, artwork, privacy data and store review requirements remain explicit app prerequisites. Do not mark device or store acceptance from a config receipt.

## Self-improvement

Follow [the catalog reflection](../mobile/references/self-improvement.md), once per invocation.
