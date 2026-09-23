---
name: dev
description: Use when operating the Appelent developer CLI to scaffold or adopt apps, apply recipes, inspect configuration, route environment values, or prepare and clean T3/Orca workspace resources.
---

# Operate the Appelent developer CLI

Use this skill for `appelent` / `@appelent/dev`. The sibling `cli` skill concerns shipping an app-user CLI with `@appelent/cli`. For changes to the tooling implementation itself, use the sibling maintain-repo skill and the explicit source checkout’s contributor instructions.

## Task

### 1. Inspect and plan

Read `FEATURE.md`, [working with apps](../../references/working-with-apps.md), repo instructions and the app's `appelent.json`. Locate the actual executable: use the app's pinned dependency with `pnpm exec appelent` when installed; use the reviewed global executable for host bootstrap before dependencies exist. For local CLI development, build `@appelent/dev` in the explicitly resolved appelent-packages checkout and invoke its absolute `packages/dev/dist/bin.js` path with Node from the target app directory. The plugin supplies guidance; installing it does not install the CLI or provider tools.

Check `--version`, top-level help, and the selected subcommand's help. Read the matching installed package README/docs; resolve a packages source checkout as described in working-with-apps when those docs are unavailable. A local candidate version does not establish registry availability. Preserve unrelated dependency versions when installing or upgrading the CLI.

Use `doctor --json` for configuration/tooling checks and `capabilities --json` for supported recipe IDs. Doctor performs bounded local metadata/version probes without authentication or manifest execution. Use `scan --json` for a bounded inventory; use workflow's scan-codebase skill when available for source review or product hypotheses are requested. Treat an unsupported subcommand as a version/capability gap, not permission to invent an equivalent mutation.

### 2. Apply the relevant operation

- **Scaffolding and app wiring:** use `create`, `adopt`, `add`, or `upgrade`, preceded by `--dry-run` or `recipe plan <id>`. Select explicit capabilities for a narrow request; default adoption/upgrade can span the web baseline. `create --dry-run` plans the initial starter and identifies follow-up recipes that require the generated files. Resolve customization conflicts from source evidence; use `recipe verify <id>` afterward. `upgrade` reconciles recipes, not arbitrary dependency versions.
- **Environment routing:** use `env check/plan/apply/generate` and the app-owned manifest. `env check` without an environment needs no credentials; plans for an environment read the canonical source. Use `--only file` for local-only destinations. Infisical JSON stays in memory until explicit destination writers run; workspace-generated backend URLs/keys keep their own owner. Report names and placements, never values. Provider writes must match the requested environment and scope.
- **Workspace resources:** use `workspace prepare` and its dry run with an explicit backend mode. T3/Orca own Git worktrees and persistent server actions. `workspace clean` mutates owned resources and has no dry run; `workspace gc --dry-run` / `--apply` reconcile removed checkouts. Preserve ledgers for retry, report pending expiry honestly, and keep a parent's backend key/URL out of child selection.
- **Host wiring:** use `host plan|apply t3|orca`. Inspect native settings before replacing an action. T3 requires an exact action selection for replacement; Orca may report registration-required, in which case follow its supported native settings. Read the package's host/workspace docs for recovery and machine prerequisites.

Prefer `--json` when interpreting results programmatically. Check exit status and conflicts before continuing dependent operations. Keep configuration receipts separate from completed feature adoption and live acceptance.

- **Guidelines:** read the app's local guideline index and app.md. When installing/updating is in scope, use guidelines list/plan/apply with a reviewed versioned bundle and explicit sets for first installation. Updates stop on local edits; app.md remains app-owned. Run guidelines check offline afterward.

### 3. Verify adoption

Run checks for the changed targets. For workspace/provider changes, complete the authorized development pilot, including retry, two-workspace isolation and cleanup after checkout removal. Preserve compatibility wrappers until the replacement is proven. Record only completed feature steps; list outstanding provider/host/device checks separately. A configured recipe is not evidence of a successful deployment or device review.

## Self-improvement

Follow [the catalog reflection](../development-feature/references/self-improvement.md). The front-door invocation covers this reflection when reached through apply.
