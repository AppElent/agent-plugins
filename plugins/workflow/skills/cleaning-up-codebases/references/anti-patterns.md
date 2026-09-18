# Anti-patterns during a cleanup

Each of these is a way a cleanup quietly turns into something else. The tell is
listed first, because you will recognize the tell before you recognize the
mistake.

## Writing more than you delete

**Tell:** the diff is green-heavy.

A cleanup that adds net lines is a feature branch wearing a cleanup's name. Stop,
re-read the approved findings list, drop everything not on it.

## Introducing architecture while removing code

**Tell:** the words "event bus", "registry", "plugin system", "base class",
"abstract factory", or "we could generalize this" appear in a cleanup PR.

Removing dead code requires deleting dead code. If a real structural problem
surfaced, it is a **T4 finding for the report** — not a thing to build now.

## Fixing what you should be deleting

**Tell:** you just added error handling, a test, a type, or a doc comment to
something you had already flagged as unused.

Ask "should this exist?" first, every time. Polishing a corpse is the most common
way cleanup effort is wasted.

## Deleting before asking

**Tell:** the first commit lands before the owner has seen the report.

The owner knows things the code does not record: the migration in flight, the
feature planned for next quarter, the fork that is deliberate, the draft that is
a draft. Present findings; let them choose. Never assume what the owner values.

## Vague findings

**Tell:** "there's some technical debt in the auth layer."

Findings are counted and located: "`src/auth/` has 9 TODOs, 4 of them from 2023,
and `legacyLogin.ts` (312 lines) has no importers." A number can be acted on; an
impression cannot.

## Mixing tiers in one commit

**Tell:** a commit contains both a file deletion and a refactor.

When something breaks you must be able to revert the exact category that broke
it. One category per commit; T1 fully verified before T2 starts.

## Trusting the tool

**Tell:** "knip says it is unused, so I removed it."

Static analysis misses dynamic imports, string-keyed lookups, reflection, DI
containers, test fixtures, a library's public API surface, and anything reached
only from config. Confirm each hit with a repo-wide grep for the bare name —
including config, docs, and CI files — before it goes on the T1 list.

## Cleaning against a red baseline

**Tell:** "those tests were already failing."

Then you cannot prove your change is safe. Get the baseline green, or get the
owner to accept it explicitly, before deleting anything.

## Scope-creeping the audit itself

**Tell:** an audit scoped to one directory now spans the repo, and the report is
400 items long.

A report nobody can read gets nothing approved. Scope the audit, ship the report,
let a second pass cover the rest.
