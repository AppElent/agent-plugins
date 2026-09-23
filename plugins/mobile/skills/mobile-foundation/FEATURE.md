---
name: mobile-foundation
version: 2
description: Opt-in native foundation and release configuration for Expo apps with shared auth and locale helpers
---

# Native mobile foundation

## What

Adds app-owned Expo wiring through developer recipes, then verifies authentication, locale behavior and device readiness. Existing routes, app identity, design and domain state stay with the app.

## Stack

Expo Router, Clerk, Convex and EAS for supported existing source shapes or the pinned recipe starter. Separate native entries in `@appelent/auth/native` and `@appelent/i18n/native` contain headless helpers. Web baseline/PWA remains independently usable.

## Architecture

The app composes providers, safe areas, splash readiness, navigation and user provisioning. Native locale/auth helpers accept app-owned adapters; locale resolution is synchronous-first-frame and does not provide async hydration. Recipes configure development-client and release settings; build, update and submit remain distinct operations. The pure OTA guard consumes an actual selected-binary runtime and fails closed on missing or policy-only values. Installed mobile skills own detailed design and release guidance.

## Configuration

App-owned identifiers, scheme, EAS project, profile/environment/channel mapping and workspace device URL. Signing credentials remain with their provider. Preserve SDK and dependency compatibility; use the installed CLI's capability/options contract.

## Changelog

- 2 — Document synchronous native locale resolution, app-owned token storage, and fail-closed OTA runtime evidence.
- 1 — Explicit native adoption and release workflow, separate from web viewport and PWA support.
