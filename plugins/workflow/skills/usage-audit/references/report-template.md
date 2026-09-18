# Usage audit report template

The deliverable of steps 0–6. It goes to the owner **before** any change, and it
lives in the session scratchpad — never in the app's git tree.

---

## Usage audit — <repo> @ <commit sha>

**Scope:** <which providers and which parts of the app; what was excluded>

**Method:** <what was measured from a dashboard or API, what the user pasted,
what was derived from code alone>

### Baseline

One row per meter that is actually on. `—` where the meter could not be read;
never a guess.

| Provider | Meter | Current | Limit | Source | Read how |
|---|---|---|---|---|---|
| Convex | Function calls | 180k / month | 1M | quotas.md 2026-08-29 | dashboard, pasted by user |
| Convex | Database I/O | — | 1 GB | quotas.md 2026-08-29 | not readable |
| Cloudflare | Worker requests | 4.1k / day | 100k / day | quotas.md 2026-08-29 | dashboard analytics |

If a `Last verified` date in `quotas.md` is stale, say so here rather than
quietly using it.

### Multiplier table

The most quotable part of the report. Lead with it.

| Operation | Where | Meter | Multiplied by | Class | Bounded? |
|---|---|---|---|---|---|
| `useQuery(api.recipes.list)` | `src/routes/recipes.tsx:22` | Convex calls + egress | every mount of `/recipes` | per-mount | no |
| `db.query("courses").collect()` | `convex/courses.ts:15` | Convex I/O | table size x subscribers | per-item | no |
| `updateRecipe` in `onChange` | `src/components/RecipeForm.tsx:64` | Convex calls + writes | every keystroke | per-interaction | no |
| Nightly digest cron | `convex/crons.ts:8` | Convex calls | once a day | constant | yes |

### Summary

| Tier | Findings | Decision needed |
|---|---|---|
| No-regret | N | none — approve as a batch |
| Scaling | N | when to schedule |
| Trade-off | N | yes, one per finding |
| Noted | N | none |

---

### No-regret

Costs nothing to adopt, loses nothing. Worth doing at any usage level.

| # | Where | Finding | Size | Meter | Fix | Cost |
|---|---|---|---|---|---|---|
| 1 | `convex/courses.ts:15` | Unindexed full scan | whole table per call | Convex I/O | add index, query with it | none |
| 2 | `src/integrations/convex/provider.tsx:9` | Query cache instantiated but never connected | every read is a fresh per-mount subscription | Convex calls + egress | connect it and route reads through it | none — dependency already installed |

### Scaling

Fine now, breaks with more users or more data. Ordered per-interaction →
per-item → per-mount.

**1. <title>** — `<file:line>`
- **Size:** <the unit and its multiplier>
- **Meter:** <which one, and the current headroom against it>
- **Breaks when:** <the concrete condition — "at ~2,000 recipes", "at 50 concurrent editors">
- **Fix:** <what to change>
- **Cost of the fix:** <what is given up, or "none">

### Trade-off

Real savings with a real cost. **The owner decides these; do not pre-apply
them.**

**1. <title>** — `<file:line>`
- **Saves:** <meter and rough magnitude, labelled measured or estimated>
- **Gives up:** <liveness, freshness, offline behaviour, complexity>
- **If we do nothing:** <consequence, including "nothing until X">
- **Alternatives:** <including "leave it">

### Noted

Measured, negligible, does not change shape with scale. Listed so the next audit
does not re-derive them.

| Where | Observation | Why it is not a finding |
|---|---|---|

---

### Questions for the owner

1. Does `<screen>` need live updates, or is commit-on-save acceptable?
2. `<feature>` is unbounded — is the data expected to grow, or is it capped in
   practice?
3. Which tiers are worth scheduling at all?

**Nothing is changed until these are answered.**

---

## Post-fix summary

| Meter | Before | After | Δ | Measured? |
|---|---|---|---|---|

**Behaviour changes shipped:** <every trade-off applied, in plain language —
what stopped being live, what got staler>

**Deferred:** <approved but not done, and why>

**Unverified:** <anything whose effect cannot be confirmed until real traffic
runs through it>
