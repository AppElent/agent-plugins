---
name: feature-gap-analysis
description: Compare this product's features against named competitors and file one triaged GitHub issue naming the parity gaps, the missing features, and the game-changers. Use when the user asks how the app stacks up against competitors, what features we're missing, where we're behind, what the competition just shipped, what table stakes we haven't met, or what would actually differentiate us — and before roadmap or prioritization planning. Grounds every competitor claim in a dated source, inventories our own features from the codebase, and compares at the job level rather than the feature-label level. For an inward audit of code quality use `cleaning-up-codebases`.
---

# feature-gap-analysis

`cleaning-up-codebases` asks "should this exist?". `mobile-audit` asks "where is
this app inconsistent with itself?". This one looks outward: **what have other
people shipped that we haven't, and what should we do about it?**

Three questions, and only these three:

1. Where do we have the feature but theirs is **materially better**?
2. What do they have that **we don't**?
3. What would be a **game-changer** — that nobody in the set has?

## The reframe: compare jobs, not feature labels

Two products that both "have export" are not at parity. One exports the current
view to CSV; the other schedules a nightly push to a warehouse. A feature-label
matrix collapses that difference to a pair of checkmarks, and the matrix always
flatters whoever built it.

**A competitor's feature list is a wish list until it is anchored to a job our
users actually do.** So the rows of the comparison are jobs, and every cell is
graded on **depth**, not presence.

## Three hard rules

1. **Every competitor claim carries a source and a date, or it is marked
   `unverified`.** A feature you inferred from a screenshot is a hypothesis. A
   feature you remember from training data is a guess — its age alone
   disqualifies it. Never write an unverified claim as if you observed it.
2. **Parity is not a goal.** A feature every competitor has may still be a
   deliberate no. This skill produces a report that proposes; the owner decides
   which gaps are gaps.
3. **Don't build while analyzing.** Findings first, in one issue. Building comes
   after, and only if asked.

## What you can and cannot see

**Knowable** — shipped features, public docs, changelogs and release notes,
pricing tiers and what each unlocks, integration catalogs, platform support,
app-store listings, and what reviewers complain about. This is most of the value.

**Not knowable** — usage, retention, revenue, what sits behind a sales call,
what's in private beta, what they're about to deprecate, and whether a marketing
page describes something that actually works. Also unknowable: why they built
it. Do not infer strategy from a feature.

Marketing pages overstate. Changelogs are the closest thing to truth. Rank
sources with `references/sources.md` and never let a homepage bullet outrank a
release note.

## 1. Frame — purpose, jobs, and the competitor set

**The purpose sentence.** Read `README.md`, the project's agent instructions
(`CLAUDE.md`, `AGENTS.md`), `docs/`, and the dependency manifest. Write the
product's purpose in one sentence. Every later finding is measured against it —
a missing feature that doesn't serve that sentence is a deliberate no, not a gap.

**The jobs.** Derive 3–7 jobs the product exists to finish, in the user's words,
not the codebase's ("get last month's numbers to my accountant", not "export
module"). These become the rows of the grid.

**The competitor set.** Name them in three tiers:

| Tier | What it means |
|---|---|
| **Direct** | Same job, same buyer — the ones we lose deals to |
| **Adjacent** | Overlapping job, different center of gravity |
| **Substitute** | What people use instead of any of us — a spreadsheet, a group chat, doing it by hand |

Include the substitute. It is usually the real competitor and it is always the
one nobody lists.

**Confirm the set with the user before researching anything.** Never analyze an
invented competitor set silently — the whole report inherits that mistake, and
research on the wrong three products is the most expensive way to be useless.

## 2. Inventory ours, from the codebase

The user's description of their own product is a pitch. The codebase is a
record. Build from the code first, then correct it with the user.

Enumerators, in order of signal:

- **Route/screen tree** (`src/routes/`, `app/`, the router config) — the
  user-visible surface, and the closest thing to a feature list that exists.
- **i18n message-tree keys** — in an Appelent app these are named after
  features and grouped by area. Best single enumerator when present.
- **`appelent.json`** installed features; `package.json` dependencies (an
  integration is a feature); feature flags and env vars that gate functionality.
- **Public API / server-fn surface** — what the product can do for a caller.
- `README.md`, and `git log --since='6 months ago' --name-only --format=` for
  what is recently real.

Then grade each by **depth**, not presence:

`shipped` · `partial` · `behind a flag` · `stubbed`

A stub counted as shipped poisons the whole grid — every gap it hides becomes
invisible. Count them honestly.

**Show the inventory to the user and ask for corrections before moving on.** The
codebase shows what exists, not what is live for customers, not what is
deprecated, and not what is discoverable enough for anyone to use.

## 3. Inventory theirs

Per competitor, research against the source ranking in `references/sources.md`.
Record every claim as:

```text
<feature> — <source URL> — <date> — confirmed | likely | unverified
```

- **confirmed** — named in docs, a changelog, or a pricing/feature matrix, or
  seen by the user in the product.
- **likely** — marketing copy or a third-party review site, corroborated once.
- **unverified** — a single marketing bullet, a screenshot, a blog post, or
  anything you inferred. Keep it, mark it, never rank on it alone.

User-supplied evidence — screenshots, pasted feature lists, an account they
actually have — outranks marketing copy. Date it anyway.

Stop researching a competitor when new sources stop changing the grid. Depth on
three competitors beats a homepage skim of eight.

## 4. Build the job-level grid

Rows = the jobs from Step 1. Columns = us + each competitor. Every cell is one
of four values, plus one line of evidence:

| Cell | Meaning |
|---|---|
| **absent** | Cannot do the job at all |
| **partial** | Does the easy case, punts on the hard one |
| **at par** | Same outcome, comparable effort |
| **ahead** | Fewer steps, fewer preconditions, or handles a case the others don't |

Format and a worked example: `references/grid-template.md`.

The grid is the artifact everything else derives from, and it leads the issue
body. If you cannot fill a cell, write `unknown` — a blank cell reads as
`absent` and quietly invents a gap.

## 5. The three verdict passes

### Pass A — parity gaps (we have it, theirs is better)

Judge on the depth axis: **fewer steps, fewer preconditions, better defaults,
handles the hard case ours punts on.** Each finding names the job, our current
depth, theirs, and the specific difference.

"They have a nicer UI" is not a finding. "Their import accepts CSV and ours
requires hand-written JSON" is.

### Pass B — missing (they have it, we don't)

For each, record **how many of the set have it**. That count is the whole signal:

- **Most of the set** ⇒ table stakes. Its absence is losing deals now.
- **One of the set** ⇒ their bet. Possibly a good one, possibly a dead end. Not
  automatically ours.

Then test it against the purpose sentence from Step 1. A feature that doesn't
serve it goes in the **deliberate no** row with the reason written down — naming
what you are choosing not to build is a finding, not an omission.

### Pass C — game-changers

A candidate must pass **all four** tests:

1. **Nobody in the set has it** — or nobody has it well.
2. **It changes what the user can do**, not how fast they do it. Speed is a
   parity fix.
3. **It is defensible for at least a release cycle** — a data asset only we
   hold, an integration only we have, a workflow only our architecture permits.
   If a competitor can copy it in a sprint, it is a feature, not a moat.
4. **It is buildable on what this repo already has.** Name the existing modules
   it would ride on. A game-changer that needs a different company is a daydream.

**"AI-powered X" is not a game-changer unless it passes all four** — and test 3
is where most of them die, because everyone has the same model API.

If nothing passes all four, **report zero**. A padded list of plausible-sounding
features is worse than an empty one, because it gets built. Say the pass found
none, and why.

## 6. Tier and size

Every finding gets exactly one tier:

| Tier | Meaning |
|---|---|
| **Table stakes** | Most of the set has it and we don't — its absence loses deals |
| **Parity gap** | We have it; theirs is materially better |
| **Differentiator** | We're ahead — protect and deepen it |
| **Game-changer** | Passes all four tests |
| **Deliberate no** | Named, with the reason we're not building it |

Order within a tier by *(number of competitors that have it) × (cheapness given
the current codebase)* — the count is already in hand from Pass B.

Size each item in **the app's own terms** — which routes, modules, and tables it
touches, and whether the data it needs already exists. Abstract t-shirt sizes
tell the owner nothing they could not have guessed.

Include the differentiators. A report that lists only shortfalls reads as noise;
the things we are already ahead on are what the roadmap must not break.

## 7. File one GitHub issue

One issue in the current product's repo, never a markdown file in the app.
Resolve the target repo with:

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

If the repo cannot be resolved, `gh` is not authenticated, or issues are
disabled, stop and report the `gh` failure plainly. Never fall back to any other
repo.

Title:

```text
Feature gap analysis: <product> vs <n> competitors - <date>
```

Body:

1. **Scope and method** — the purpose sentence, the competitor set with tiers,
   which sources were used and their dates, and the confirmed / likely /
   unverified split. A later reader must be able to tell how stale this is.
2. **The job-level grid** from Step 4. Lead with it.
3. **Table stakes**, each with the count of competitors that have it.
4. **Parity gaps**, each with the specific depth difference.
5. **Game-changers**, each scored against all four tests — or an explicit
   "none passed" with the reason.
6. **Differentiators** worth protecting.
7. **Deliberate nos**, with reasons.
8. **Not done** — competitors not researched, jobs not covered, every
   `unverified` claim, and what would settle each one.

Label it `enhancement`. Ensure the label exists first (`gh label list --repo
<repo> --search <label>`; create with `gh label create` only if absent —
`enhancement` is `a2eeef` / "New feature or request").

```bash
gh issue create --repo <target repo> --title "<title>" --body "<issue body>" --label <label>
```

## 8. Wrap up

Give the issue URL and a one-line recap — table-stakes count, parity-gap count,
game-changer count — then ask: **"Which of these should I open as its own
issue?"**

- If none: stop. The issue stays open as the record.
- If some: one child issue per accepted item, linked back to the analysis issue.
  Never batch several features into one issue — they get prioritized separately
  or not at all.

Do not start building unless asked.

## Stop if any of these is true

- **The competitor set was never confirmed by the user.** Everything after
  Step 1 is blocked on that answer.
- **A claim in the grid has no source and no `unverified` mark.** Fix it or cut
  it before the report goes anywhere.
- **The grid compares feature labels rather than jobs.** Rebuild it. A checkmark
  matrix is the failure mode this whole skill exists to avoid.
- **You are recommending parity for parity's sake** — a gap with no argument
  from the purpose sentence.
- **Every game-changer is an AI feature.** The pass failed; report zero.
- **The report has no differentiators and no deliberate nos.** You inventoried
  the competition, not the decision.
- **You started building.** Go back to the issue.

## Self-improvement

Once the issue is filed, follow the reflection in
`../workflow/references/self-improvement.md` — notice what was unclear or
underspecified about *this skill*: a pass that produced noise, a tier nothing
fit, a source class that was wrong every time, a job decomposition the grid
could not hold. Not about the product you analyzed — that belongs in the issue
you just filed. Nothing noteworthy is the normal outcome — say nothing then.
