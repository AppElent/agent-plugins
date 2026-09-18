---
name: cleaning-up-codebases
description: Use when reviewing a codebase for cruft, dead code, anti-patterns, scope creep, or architectural drift — an audit that asks "should this exist?" before "how do we improve it?", tiers the findings, and negotiates with the owner before deleting anything.
---

# Cleaning up codebases

An audit, not a refactor. The output is a **tiered findings report the owner
approves**, and then — only then — the deletions.

The question is always **"should this exist?"** before **"how do we make this
better?"** A dead function does not need better error handling. A module that
belongs in another repo does not need a nicer abstraction.

**Delete more lines than you add.** If a cleanup pass grows the codebase, it was
not a cleanup pass.

## Step 1 — Understand intent before judging anything

You cannot call something scope creep without knowing the scope. Read, in order:

- `README.md`, and the project's own agent instructions (`CLAUDE.md`, `AGENTS.md`).
- Design docs / ADRs (`docs/`, `docs/adr/`, `CONTEXT.md`) — these record decisions
  that look arbitrary from the code alone.
- `git log --oneline -50` and `git log --since='6 months ago' --name-only --format=` —
  what is actually being worked on, and which files nobody has touched.
- The dependency manifest (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`).
  Dependencies describe the real scope more honestly than the README does.

Write down the project's purpose in one sentence. Every later finding is measured
against that sentence.

## Step 2 — Establish the baseline, then scan

**Baseline first.** Record the exact current state before touching anything:

```
<lint>  → N errors, M warnings
<test>  → N passed, M failed, K skipped
<build> → succeeds / fails, output size
```

If the baseline is already red, say so and stop cleaning until it is green or the
owner accepts it. You cannot prove you broke nothing against a broken baseline.

Then scan. `references/scans.md` has concrete commands per ecosystem. Look for:

**Dead code** — unused imports and exports, uncalled functions, files nothing
imports, orphaned assets, dark feature flags, commented-out blocks, duplicate
implementations of the same thing.

**Quality signals** — swallowed errors (`catch {}`), `TODO`/`FIXME`/`HACK`
comments, functions over 100 lines, files over 500 lines, copy-pasted logic,
`any`/`# type: ignore` clusters, disabled lint rules.

**Scope creep** — features that do not serve the one-sentence purpose, modules
that want to be their own package, dependencies pulled in for one call site,
config for environments that no longer exist.

Count everything. "23 TODO comments, 9 of them from 2023" is a finding. "There
is some technical debt" is not.

## Step 3 — Evaluate at two altitudes

**Macro (project):** Does the directory structure still match how the code is
organized? Are the configs (CI, linter, tsconfig, Dockerfile) describing a
project that still exists? Are there two ways to do the same thing?

**Micro (file):** Do the tests assert behavior or just that nothing threw? Are
there god objects? Are there abstractions with exactly one implementation —
interfaces, factories, strategy patterns, base classes — that were built for a
second case that never arrived?

## Step 4 — Question every major feature

For each significant component, answer three questions with evidence:

1. Does it serve the stated purpose?
2. Is it actually used? (Grep for call sites. Check analytics/logs if they exist.)
3. Is it finished, or is it a half-built idea that is now load-bearing?

A "no" on any of these is a finding, not a verdict. The owner decides.

## Step 5 — Tier the findings

| Tier | What it is | Effort | Risk |
|------|-----------|--------|------|
| **T1** | Safe deletions — dead code, orphaned files, unused deps, commented-out blocks | Minutes | Near zero |
| **T2** | Isolated fixes — swallowed errors, stale comments and docs, dead config | Hours | Low, local |
| **T3** | Focused refactors — consolidating duplicate logic, collapsing single-use abstractions | Days | Medium |
| **T4** | Architectural changes — restructuring, extracting or removing a module | Weeks | High |

Every finding names its file, its evidence, and its tier. `references/report-template.md`
is the format.

## Step 6 — Negotiate with the owner

**Present the report. Do not start deleting.**

Never assume what the owner values. That "dead" module may be the next quarter's
plan; that duplicate implementation may be a deliberate fork mid-migration; that
stale draft may be a draft.

Ask specifically: which T1 items may go now, which findings are actually
intentional, which tiers are worth scheduling at all. T3 and T4 are proposals
with trade-offs, not tasks.

## Step 7 — Execute safe-first

In tier order, T1 → T2 → T3 → T4, and never start a tier before the previous one
is verified green.

Within a tier, work in small commits — one category of deletion per commit, so a
revert is surgical. After **each** change:

```
<build> && <test> && <lint>
```

Broken? Revert that change immediately. Do not debug forward during a cleanup —
the whole value of the pass is that it provably changed nothing observable.

## Step 8 — Verify against the baseline

Compare to the Step 2 numbers and report the delta concretely:

- Lint/test/build state — must be at least as good as the baseline.
- Lines added vs. deleted. Deleted should dominate.
- Build output — for a site or bundle, the page count, route list, or bundle size
  should be unchanged unless a change was meant to alter it.
- What was deferred, and why.

## Stop if any of these is true

- **You are writing more code than you are deleting.** You have drifted into
  feature work. Go back to the report.
- **You proposed an event bus, a registry, a plugin system, or a base class**
  during dead-code removal. Removing code does not require new architecture.
- **You have not asked the owner what they want to keep.** Everything after
  Step 5 is blocked on that answer.
- **The baseline was never recorded**, so "still works" is an opinion.
- **You are fixing something you should be deleting** — no error handling, tests,
  types, or docs for code that is a candidate for removal.

See `references/anti-patterns.md` for the longer list and how each one shows up.

## Self-improvement

See `skills/workflow/references/self-improvement.md`.
