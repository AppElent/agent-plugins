---
name: usage-audit
description: Audit a codebase for how it behaves against usage-metered service quotas — Convex function calls, database bandwidth and storage, Cloudflare Workers requests and CPU — and rank findings by what they scale with rather than by today's reading. Use when asked to optimize usage, cut service costs, stay inside a free or hobby tier, or when the question is "what happens when we get more users", "why is our Convex usage so high", "are we going to blow the free tier", "should this still be a live subscription", "do we need to write on every keystroke". Produces a tiered report and an optional GitHub issue, and never quotes a quota number it did not read. For Cloudflare implementation details use the `cloudflare`, `workers-best-practices` and `wrangler` skills.
---

# usage-audit

An audit of **growth shape**, not of current spend. It does not matter whether
the app does 20 writes a day or 25,000 — what matters is what that number is
multiplied by. A write per keystroke and a subscription per mount are wrong at
both.

> **A finding you cannot state the multiplier for is not a finding.**

The output is a tiered report the owner approves, and only then the fixes.

## What this skill does not own

- **How to implement a Cloudflare thing.** Cache rules, bindings, wrangler
  config, Workers idioms — `cloudflare`, `workers-best-practices` and
  `wrangler` own those. This skill decides *whether* the cost is worth paying;
  they decide *how*.
- **Current quota numbers.** They live in `references/quotas.md` as a dated
  snapshot with sources, and the provider's dashboard always beats the file.
- **Page-load performance.** `web-perf` owns Core Web Vitals. Overlap is real —
  a wasteful query is often also a slow one — but the yardstick here is the
  meter, not the millisecond.

## list

`/workflow:usage-audit list` is discovery only. Print the providers covered,
their meters, and the multiplier classes below, then stop. Audit nothing, read
no app code, write no report.

## Load only what you need

| If the question is | Read |
|---|---|
| Convex subscriptions, queries, mutations, actions, storage, previews | `references/convex.md` |
| Workers, Pages, KV, R2, D1, Durable Objects, Queues, Workers AI | `references/cloudflare.md` |
| What is the current free-tier limit, and when was it last checked | `references/quotas.md` |
| Clerk, Resend, Sentry, an LLM API — or adding a provider | `references/other-providers.md` |
| What does the report look like | `references/report-template.md` |

Do not load all five. A Convex-only audit is `convex.md` plus `quotas.md`.

## 0. Baseline — read the meters before reading the code

Record what the meters actually say, before forming any opinion:

- **Cloudflare** — the dashboard's Workers analytics, or the GraphQL Analytics
  API. `wrangler deployments list` and `wrangler tail` say what exists and what
  is being hit, not what it costs.
- **Convex** — the dashboard's usage page, per deployment. Remember that
  preview deployments are separate deployments.
- **Anything unreadable** — ask the user to paste the figures. Then say in the
  report that it was pasted, not measured by you.

Then open `references/quotas.md` and check its `Last verified` dates. If a
provider's section is older than about 90 days, re-verify it against the
vendor's own pricing page and offer to update the file — that is a toolbox
change and needs a plugin version bump, so propose it, do not do it silently.

**Never state a quota number from memory.** An unreadable meter is reported as
unreadable. A number you did not read this run does not appear in the report.

If the baseline cannot be established at all, the audit still runs — growth
shape is readable from code alone — but every impact claim is labelled as
unmeasured.

## 1. Inventory the meters that are actually on

Before judging anything, find out which meters exist. Most of this is fast:

- **Providers** — read the dependency manifest and the env vars, not the README.
- **Cloudflare surface** — `wrangler.jsonc` / `wrangler.toml`: which bindings
  (KV, R2, D1, Durable Objects, Queues, AI, Vectorize), any `triggers`/crons,
  any `limits` block, whether `observability` is enabled.
- **Deployments** — production, dev, and **the ones nobody counts**: per-branch
  and per-PR previews. A preview workflow that provisions a backend per pull
  request is a meter that runs without anyone opening the app.
- **Convex surface** — the function files, and whether any use `"use node"`,
  `ctx.scheduler`, `ctx.storage`, or a `crons.ts`.
- **Client wiring** — which client, whether a query cache is connected, and how
  reads are issued.

If the repo carries `appelent.json` and an `<!-- appelent-managed:start -->`
block in `CLAUDE.md`, it is an Appelent app: read `features.baseline.version` to
know which baseline steps ran, and expect the per-PR Convex + Worker preview
pair from baseline step 8.

State the surface in one paragraph and move on. An app with one Worker and no
bindings does not need a Cloudflare pass; say so and spend the time on the
database.

## 2. The multiplier table

The core artifact, and the most quotable part of the report. For every billable
operation, name what multiplies it:

| Operation | Meter | Multiplied by | Bounded? |
|---|---|---|---|
| `useQuery(api.recipes.list)` in `/recipes` | Convex fn calls + bandwidth | every mount of the route | no — grows with visits |
| `.collect()` on `courses` | Convex db bandwidth | table size x subscribers | no — grows with data |
| `useMutation` in `onChange` | Convex fn calls + writes | every keystroke | no |
| SSR render of `/` | Worker requests + CPU ms | every navigation and preload | no |
| Nightly cron | Convex fn calls | once a day, constant | yes |

Three multiplier classes, because each has a different fix:

- **Per-mount** — the cost repeats every time a component or route mounts.
  Fixed by cache lifetime and subscription reuse, not by making the query
  cheaper.
- **Per-item** — the cost scales with how much data exists. Fixed by indexes,
  pagination, limits, and returning narrower documents.
- **Per-interaction** — the cost scales with how much the user types, drags or
  toggles. Fixed by a local buffer and a commit-on-save.

A row whose "Multiplied by" cell says *constant* is almost never a finding, no
matter how large the number is.

## 3. Pass A — read shape

Detection patterns are in `references/convex.md` and `references/cloudflare.md`.
What to look for:

- **Subscription lifetime.** Does a live query re-open on every navigation to
  the same route? Is anything holding it across unmount? A per-mount
  resubscribe on a page the user visits repeatedly is the single most common
  finding in this stack.
- **Unbounded reads.** Collecting a whole table to render a list, or a filter
  that runs in the client over everything.
- **Missing indexes.** A scan costs bandwidth proportional to the table, not to
  the result.
- **Over-wide documents.** Fetching every field to render a title and a
  thumbnail.
- **Queries that fire and throw.** An authenticated query issued before auth
  resolves runs, fails, and runs again — two calls for one render.
- **Fan-out.** One query many clients subscribe to, over a table that is written
  often: every write pushes to every subscriber.
- **Preload settings.** Hover-triggered route preloads with no stale window turn
  a mouse sweep across a nav bar into a burst of loads.

## 4. Pass B — write shape, and the liveness test

The decision rule the whole skill hangs on:

> Before every write, ask: **is another client watching this right now, and does
> it need to see it before the user is done?**
>
> If no, it is local state until commit. Editing a recipe needs no live update.
> A shared board being edited by two people does.

Findings:

- **Writes bound to input events** — a mutation in `onChange`, `onValueChange`,
  or a `useEffect` keyed on a field that changes as fast as the user types.
- **Per-toggle persistence** — every checkbox, sort order or filter written
  through to the server when it could be local, or local plus one write on
  leave.
- **Write amplification** — a mutation that also triggers a refetch of the thing
  it just returned, or an optimistic update plus an invalidate.
- **Background burn** — schedulers and crons that run whether or not anyone is
  using the app. Constant, which makes them cheap to reason about and easy to
  forget.
- **Compute-metered work** — Node actions and long-running functions are billed
  on a different meter than queries. A loop that calls an action per item is the
  per-item class in disguise.
- **Storage that only grows** — uploads with no deletion path, events written
  forever, denormalized copies never cleaned up.

When a write genuinely needs to be live, say so and leave it. A finding that
removes a required live update is a bug, not a saving.

## 5. Pass C — edge and delivery

- **Requests and CPU per page view** — SSR renders on every navigation. What is
  rendered per request that could be static or cached?
- **Cache boundaries** — anything served from the origin that a cache could
  answer: static assets, immutable responses, public data.
- **Deployment sprawl** — dev and preview Workers, and whether teardown is
  symmetric. A preview that deletes the Worker but leaves the backend is a leak
  with a delay on it.
- **Separate paid axes** — LLM and third-party API calls made from the edge are
  metered by that vendor, not by Cloudflare. Report them separately or the
  totals mislead.

For every fix in this pass, take the mechanism from `cloudflare`,
`workers-best-practices` or `wrangler`. Do not invent Workers configuration
here.

## 6. Tier the findings

Every finding gets exactly one tier:

| Tier | Meaning |
|---|---|
| **No-regret** | Costs nothing to adopt and loses nothing — a local edit buffer, an index, gating a query on auth, deleting a dead subscription, turning on observability. Worth doing at any usage level. |
| **Scaling** | Fine today, breaks at more users or more data — unbounded reads, per-mount resubscribes, fan-out on a hot table. Fix before the growth, not after. |
| **Trade-off** | A real saving with a real cost — liveness lost, staleness introduced, complexity added. The owner decides. |
| **Noted** | Measured, negligible, and does not change shape with scale. Record it, do not act on it. |

**Fix order is no-regret → scaling → trade-off**, and the first one is the
non-obvious part. No-regret items usually look smaller than the scaling ones,
but they are unarguable, they need no decision, and several of them remove the
noise that makes a scaling finding hard to measure. Doing them first also means
the owner's attention is spent only on the findings that actually need a
judgement.

Within **scaling**, order by how fast the multiplier grows: per-interaction
before per-item before per-mount.

## 7. Report

Write it to the session scratchpad and render it in chat. **Never into the
app's git tree** — the durable record is the GitHub issue, not a file that rots
in the repo. Format: `references/report-template.md`.

Every finding carries four things:

- **Size** — the unit and its multiplier ("one query plus a full table read, per
  mount of `/courses`").
- **Impact** — which meter it lands on, and against which quota, with the
  baseline reading if there is one.
- **Severity** — the tier.
- **Cost of the fix** — what is given up. "None" is a valid and important
  answer; it is what makes something no-regret.

Label every estimate as an estimate. A number derived from an assumed traffic
figure is not a measurement, and mixing the two is how a report stops being
trusted.

## 8. Offer one GitHub issue

Ask first. If the user wants it, one issue in the current app's repo. Resolve
the target with:

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

If the repo cannot be resolved, `gh` is not authenticated, or issues are
disabled, stop and report the `gh` failure plainly. Never fall back to any other
repo.

Title:

```text
Usage audit: <scope> - <date>
```

Body: scope and method (including what was measured, what was pasted, and what
was estimated), the multiplier table, then the findings in tier order, then what
was not done and why. Each finding must be actionable on its own — file path,
the multiplier, the fix, and what the fix costs.

Label it `enhancement`. Ensure the label exists first (`gh label list --repo
<repo> --search enhancement`; create with `gh label create` only if absent —
`enhancement` is `a2eeef` / "New feature or request").

```bash
gh issue create --repo <target repo> --title "<title>" --body "<issue body>" --label enhancement
```

## 9. Fix on approval

Ask: **"Want me to fix any of this now?"** If no, stop.

If yes, work in tier order, smallest blast radius first. One commit per finding.
Run the project's typecheck, lint and tests after each. Never weaken a test to
pass.

Anything in the **trade-off** tier changes behaviour — state that in the commit
message and in the wrap-up, rather than presenting it as a pure optimization. A
user who discovers a screen stopped updating live because of a cost audit will
not trust the next one.

## Precedence — when guidance disagrees

1. **The app's repo beats this skill.** Existing patterns win; this is an audit,
   not a mandate to refactor.
2. **Measured beats estimated.** Estimates are always labelled.
3. **Growth shape beats current volume.** A small number with an unbounded
   multiplier outranks a large number that is constant.
4. **Cloudflare implementation belongs upstream** — `cloudflare`,
   `workers-best-practices`, `wrangler`. Apply the reason from here, take the
   mechanism from them.
5. **Convex API specifics come from current docs.** There is no Convex skill
   installed; nothing about its API is recalled from memory.
6. **Correctness and required liveness beat any saving.** Name the UX
   consequence inside the finding, or do not raise it.

## Stop if any of these is true

- **You are about to quote a quota number you did not read this run.** Go read
  it, or drop the claim.
- **You cannot say what a finding is multiplied by.** It is an observation, not
  a finding.
- **You are proposing a cache layer, a queue, a sync engine, or a
  state-management migration.** An audit does not introduce architecture.
- **You removed liveness from something two people edit at once.** That is a
  regression wearing an optimization's clothes.
- **You are optimizing a constant meter the app is nowhere near.** That is the
  Noted tier; leave it there.

## Sources

Distilled from the providers' own documentation, not from summaries:

- **Convex** — docs.convex.dev (pricing, limits, queries, pagination, indexes,
  actions, scheduling, file storage) and the TanStack Query integration docs.
- **Cloudflare** — developers.cloudflare.com (Workers limits and pricing, KV,
  R2, D1, Durable Objects, Queues, Workers AI).

Deliberately not owned here: **the numbers**. Free and hobby tier limits move,
and a skill that hardcodes them becomes a skill that lies. They live in
`references/quotas.md` as a dated snapshot with a source URL per row and an
explicit re-verify step, and the live dashboard overrides the file every time.

Cloudflare implementation guidance is deliberately not restated — the installed
`cloudflare`, `workers-best-practices` and `wrangler` skills are maintained
upstream and own it.

## Self-improvement

Once the report is delivered, follow the reflection in
`../workflow/references/self-improvement.md` — notice what was unclear or
underspecified about *this skill*: a multiplier class that did not fit a
finding, a tier that was ambiguous, a meter the references are silent on, a
provider that needed a section and did not have one. Not about the app you
audited — that belongs in the issue you just filed. Nothing noteworthy is the
normal outcome — say nothing then.
