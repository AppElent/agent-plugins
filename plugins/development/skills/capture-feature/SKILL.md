---
name: capture-feature
description: Use when capturing implemented app functionality, a repeated workflow, or an engineering guideline into the Appelent catalog, or extending an existing capability from source evidence.
---

# Capture a reusable capability

Capture means implementing and documenting the reusable part. An unbuilt idea remains a proposal and receives no installed-feature stamp.

## Task

### 1. Establish evidence and ownership

Resolve the writable catalog checkout using [repository ownership](../../references/repositories.md). Read the source implementation and its tests in the originating app. Compare a second app when available; one app can justify a small recipe without pretending it proves a stable shared runtime API. Preserve unrelated working changes.

Read [capability forms](references/capability-forms.md). Identify the existing owning feature before creating a new one. State what remains app-owned, supported variants, and which layer each reusable part belongs to. Completion: a source-backed boundary, not a list of generic ideas.

### 2. Implement the selected forms

For runtime behavior, implement the smallest useful package API and behavior tests. For mechanical wiring, add a descriptor/recipe/check to `@appelent/dev` with plan/apply/verify, custom-source conflicts, repeatability, and explicit upgrade behavior. For reusable standards, edit the central guidelines/ source and bump its catalog version; keep app exceptions local. For agent judgment/procedures, update the owning skill and its scoped references. Keep agent procedures thin and discoverable.

Create or update the feature's `FEATURE.md` and executable `SKILL.md` using the agent-plugins checkout's CONTRIBUTING.md. A feature can compose multiple forms. Update current sections in place; preserve old step numbers. Use the actual package README for consumption details. If no implementation exists yet, produce a proposal with missing prerequisites instead of a stub advertised as installable.

### 3. Verify and make adoption explicit

Run affected package checks in appelent-packages and `pnpm check` in agent-plugins. Exercise supported shapes, already-applied state, customized conflicts, and an upgrade fixture. Check a packed consumer when exports/templates change. Bump all three manifests of each changed plugin for skill changes and package/recipe versions for their respective changes.

Record what passed and what still needs an app/provider/device pilot. Do not mark the originating app adopted merely because capture succeeded. Modify a consuming app only when migration is in scope; record its completed parts after its own checks. Publish, commit, or file issues only when included in the user's request or established workflow.

## Self-improvement

Follow [the catalog reflection](../development-feature/references/self-improvement.md), once per invocation.
