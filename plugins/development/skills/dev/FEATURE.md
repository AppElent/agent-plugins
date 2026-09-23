---
name: dev
version: 3
description: Repeatable environment routing, app recipes, workspace lifecycle, host setup and codebase inventory
package: "@appelent/dev"
---

# Developer tooling

## What

The `appelent` CLI owns repeatable repository operations and records their actual mechanical evidence. T3 and Orca retain worktree creation, selection and deletion.

## Stack

Node >=22.15, pnpm 11, a project-local pinned `@appelent/dev`. Environment providers are explicit manifest destinations. Provider authentication is a prerequisite; the CLI does not create provider accounts.

## Architecture

Recipes plan changes, preserve custom source, and verify before recording configuration. Doctor uses bounded local metadata/version probes and static environment inspection; trusted environment commands are the only path that executes the app manifest. Static scan results feed a source review.

## Configuration

`appelent.json`, `env.manifest.ts`, nonsecret `.infisical.json`, and native host settings. See the package README for the current command/options contract. Keep project-specific identifiers, seed functions and source folders local.

## Changelog

- 3 — Route app-wide adoption through development, load pinned local guidelines, and verify platform-specific coverage.

- 2 — Clarify read-only probe/static-manifest boundaries and host plan/apply routing.
- 1 — Shared developer operations, recipes and conservative inventory with explicit verification boundaries.
