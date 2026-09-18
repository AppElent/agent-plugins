# Findings report template

The deliverable of Steps 1–5. It goes to the owner **before** any change.

---

## Codebase cleanup — <repo> @ <commit sha>

**Stated purpose:** <one sentence from the README/docs — the yardstick for every
scope finding below>

**Scope of this audit:** <directories or subsystems covered, and what was excluded>

### Baseline

| Check | Command | Result |
|---|---|---|
| Lint | `<cmd>` | N errors, M warnings |
| Tests | `<cmd>` | N passed, M failed, K skipped |
| Build | `<cmd>` | succeeds; <pages / bundle size / artifacts> |

### Summary

| Tier | Findings | Est. effort | Approx. lines removed |
|---|---|---|---|
| T1 safe deletions | N | minutes | ~N |
| T2 isolated fixes | N | hours | ~N |
| T3 focused refactors | N | days | — |
| T4 architectural | N | weeks | — |

---

### T1 — Safe deletions

| # | File / location | Finding | Evidence |
|---|---|---|---|
| 1 | `src/lib/legacyPaths.ts` | Unused module, 214 lines | No importers (knip, confirmed by repo-wide grep) |
| 2 | `static/images/*` (12 files) | Orphaned assets | Filenames appear in no source, template, or content file |

### T2 — Isolated fixes

| # | File / location | Finding | Evidence |
|---|---|---|---|
| 1 | `src/api/client.ts:88` | Swallowed error — empty catch hides network failures | — |

### T3 — Focused refactors (proposals)

**1. <title>** — `<files>`
- What: <the duplication or single-use abstraction>
- Why it matters: <concrete consequence, not "cleaner">
- Cost: <est.> · Risk: <what could break> · If we do nothing: <consequence>

### T4 — Architectural (proposals)

Same shape as T3, with the alternatives spelled out — including "leave it".

---

### Questions for the owner

1. `<module>` looks unused — planned work, or may it go?
2. `<thing>` exists twice — is that a migration in flight?
3. Which tiers are worth scheduling at all?

**Nothing is deleted until these are answered.**

---

## Post-execution summary (Step 8)

| Check | Baseline | After | Δ |
|---|---|---|---|
| Lint | | | |
| Tests | | | |
| Build output | | | |
| Lines | | | −N / +M |

**Deferred:** <findings approved but not done, and why>
