---
name: scan-codebase
description: Use when scanning an app for Appelent adoption gaps, reusable functionality to capture, engineering improvements, or evidence-backed opportunities for added product features.
---

# Scan a codebase for useful next work

Produce a prioritized, executable backlog grounded in this app. Scanning is read-only unless the user also asks to implement findings.

## Task

### 1. Inventory and choose coverage

Read repo instructions, package targets, `appelent.json`, and existing issue/plan documents. Run the installed `appelent scan --json` and `appelent doctor --json` when available. Scan is a bounded inventory, not a UX verdict; report skipped targets and limited coverage. Do not fetch credentials, import application configuration, run setup, or provision resources for an inventory.

Compare existing behavior with the installed CLI's capability list and the catalog descriptors. Keep four finding groups: adoption drift, potential reusable contributions, app engineering improvements, and potential product additions. Map mechanical observations to adoption drift or engineering improvements, stable repeated behavior to reusable contributions, and product additions only to source-backed hypotheses; the scanner must not present a missing library or import as demand.

### 2. Verify candidates in source and user journeys

For each retained candidate, cite the actual file/symbol and explain the concrete consequence. Inspect tests and an existing equivalent before recommending another component or workflow. Shared dependencies or similar filenames are prompts to investigate, not proof of duplication.

For web/native screen-state review, read [scoped UI guidance](references/ui-review.md). For native work also use the installed mobile design/rules/release skill appropriate to the finding; report that coverage as unavailable if those skills or a device are absent. Sample initial/empty/error/refresh/mutation states, authentication and accessibility rather than counting imports.

For product additions, trace a real user flow, known request, abandoned handoff, or domain constraint. Label unsupported demand as a hypothesis, with a validation experiment. Research competitors only when requested or needed for the chosen finding, with dated primary evidence. Do not invent user demand from a missing library.

### 3. Deliver an actionable plan

Each finding includes: group, priority, confidence, source evidence, user/engineering impact, owning repo, selected form, smallest implementation step, dependencies, acceptance checks, and effort range. Keep `observed` evidence separate from `review-needed` candidates, state bounded/skipped coverage, and include intentionally deferred findings with why. Prefer a short ranked set over an unreviewed dump.

Separate mechanical fixes from design choices and external/device prerequisites. Route reusable contributions to development’s capture-feature skill when available; otherwise record the evidence and intended owner for a later capture. App-specific work stays in the app. Recommend a sequence with independent PR-sized steps. Save the report when requested. Filing issues, changing apps, and recording guideline reviews are separate actions requiring scope from the user.

## Self-improvement

Follow [the catalog reflection](../workflow/references/self-improvement.md), once per invocation.
