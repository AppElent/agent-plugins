# The job-level grid and the issue body

Companion to `feature-gap-analysis`. Steps 4 and 7 in the skill.

## Cell values

| Cell | Meaning |
|---|---|
| **absent** | Cannot do the job at all |
| **partial** | Does the easy case, punts on the hard one |
| **at par** | Same outcome, comparable effort |
| **ahead** | Fewer steps, fewer preconditions, or handles a case the others don't |
| **unknown** | Not researched, or no source good enough. Say so — never leave a cell blank |

Grade the *job*, not the feature label. If a competitor solves the job a
completely different way, that is still `at par` or `ahead` — the user does not
care which module did it.

## Grid

```markdown
| Job | Us | <Competitor A> | <Competitor B> | <Substitute> |
|---|---|---|---|---|
| <job in the user's words> | at par | ahead | absent | partial |
```

Under the grid, one evidence line per non-obvious cell:

```markdown
- **<Competitor A> / <job> — ahead.** <the specific difference, one sentence>
  — <source URL> — <date> — confirmed
```

## Worked example

Product purpose: *"lets a small shop owner get last month's numbers to their
accountant without a bookkeeper."*

| Job | Us | Ledgerly | Booksmith | A spreadsheet |
|---|---|---|---|---|
| Get last month's numbers to my accountant | partial | ahead | at par | partial |
| Chase an unpaid invoice | absent | at par | ahead | absent |
| Know if I can afford a hire | absent | absent | absent | partial |

- **Us / accountant handoff — partial.** Exports CSV of the current view only;
  no date-range selection, and no accountant-readable summary.
  — `src/routes/reports/export.tsx` — shipped
- **Ledgerly / accountant handoff — ahead.** Named accountant role with
  read-only access; no export step at all.
  — https://ledgerly.example/docs/accountant-access — 2026-03-11 — confirmed
- **Booksmith / chase an unpaid invoice — ahead.** Automated reminder schedule
  with escalation.
  — https://booksmith.example/changelog#2026-01 — 2026-01-22 — confirmed
- **Everyone / afford a hire — absent.** No product in the set does forward
  cash-flow projection. Game-changer candidate: see Pass C.

Note what the third row does. A job nobody serves is where Pass C candidates
come from, and it is only visible because the rows are jobs rather than features.

## Issue body skeleton

```markdown
## Scope and method

**Purpose:** <one sentence>
**Competitors:** direct — <a>, <b>; adjacent — <c>; substitute — <d>
**Sources:** <n> sources, dated <oldest>–<newest>. <x> confirmed, <y> likely,
<z> unverified.
**Our inventory:** derived from <routes | i18n keys | appelent.json>, corrected
by the owner on <date>.

## The grid

<grid + evidence lines>

## Table stakes — <n>

- **<feature>** — <k> of <n> competitors have it. <what it does for the job.>
  Touches <modules>. <existing data we already have.>

## Parity gaps — <n>

- **<job>** — ours: <depth>. Theirs: <depth>. The difference: <one sentence>.
  Fix: <the smallest change that closes it>.

## Game-changers — <n, or "none passed">

- **<candidate>**
  1. Nobody has it: <evidence>
  2. Changes what the user can do: <how>
  3. Defensible: <the asset, integration, or architecture>
  4. Buildable here: <the modules it rides on>

## Differentiators to protect — <n>

- **<feature>** — we're ahead because <why>. Don't break it by <risk>.

## Deliberate nos — <n>

- **<feature>** — <k> of <n> have it. Not building it because <reason from the
  purpose sentence>.

## Not done

- <competitor not researched, and why>
- <every unverified claim, and what would settle it>
```

Keep every list ordered by the Step 6 rule — competitors-that-have-it × cheapness
— not by how interesting the item is to write about.
