---
name: web-project
description: Use when inspecting an app's web capability evidence or handling app issues through the existing web project entry point.
---

# Web app status

Read the app's appelent.json and local guideline index/app.md. list shows recorded IDs, versions, options, and partial steps without mutation. status checks this plugin's MCP FEATURE and the available web procedure evidence.

For app-wide baseline/auth/i18n/CLI versions and --all registry operations, load development's development-project skill when available; those FEATURE owners moved to development. If unavailable, show recorded values and report that version comparison needs the owning plugin. Never infer missing adoption from an unavailable plugin.

Baseline step selectors remain defined in web-baseline. Preserve partial records. Changes to app records require successful adoption, not merely a status check. For web UI work, use the app's installed guidelines.

## Issues: target repo and type labels

`issue`/`issues`/`fix` all operate on GitHub issues. Two things are shared
across the three verbs; the per-verb steps below refer back to this section.

**Target repo.** An explicit runtime issue target from the calling feature router remains AppElent/appelent-packages; the default catalog target below applies to skill and guideline issues. Every `gh` call below uses `<target repo>`, resolved by
which front door invoked the verb:

- Via **`/web:project`** (or app-side natural language) → **this app's
  own GitHub repo**. Resolve it by running, in the app dir,
  `gh repo view --json nameWithOwner -q .nameWithOwner` (this reads the
  `origin` remote). If it can't resolve — no `origin` remote, `gh` not
  authenticated, or issues disabled on the repo — report the failure from
  `gh` plainly and **stop**. Never silently fall back to the catalog repo.
- Via **`/web:feature`** (or feature/catalog-shaped natural language) →
  `AppElent/agent-plugins` (the catalog repo), fixed. See
  `../web-feature/SKILL.md` for that entry point.

**Type label (inferred, not asked).** Classify the issue text into exactly
one type and apply that as the label — this stays zero-friction, so infer
and apply rather than interviewing the user:

| Label | When | Ensure-exists color / description |
|---|---|---|
| `bug` | broken/incorrect behavior, an error, a crash, a regression ("X doesn't work / is wrong") | `d73a4a` — "Something isn't working" |
| `documentation` | docs / README / comments / `FEATURE.md` wording or examples missing or wrong | `0075ca` — "Improvements or additions to documentation" |
| `enhancement` | a new capability, improvement, or idea — **the default when ambiguous** | `a2eeef` — "New feature or request" |
| `question` | an open question that needs an answer before anything is built | `d876e3` — "Further information is requested" |

Ensure the chosen label exists before applying it:
`gh label list --repo <target repo> --search <label>`; only if absent,
`gh label create <label> --repo <target repo> --color <color>
--description "<description>"` using the row above. These are GitHub's
default labels, so this is usually a no-op.

## issue <text>

Zero-friction: file `<text>` as a GitHub issue against `<target repo>`,
without interviewing the user or interrupting whatever they're doing.
Reachable via natural language, e.g. "note an idea: X", "suggest that
we...", "report a bug: Y", "file an issue for Z". This is the canonical
procedure — `/web:feature issue` is an alternate entry point to the
same steps below (differing only in `<target repo>`).

1. Use the user's one-line text as the issue title. If their message
   included more context, use it as the issue body; otherwise leave the
   body empty.
2. Infer the type label from the text and ensure it exists — see "Issues:
   target repo and type labels" above.
3. File the issue: `gh issue create --repo <target repo> --title "<text>"
   --body "<context or empty string>" --label <inferred label>`.
4. No follow-up questions. Report the outcome — the issue URL `gh issue
   create` prints and which label was applied, e.g.
   `Filed #42 (bug) → AppElent/satisfactory: <title>` — and stop. If the
   inference was a guess, say so briefly so the user can relabel on GitHub.

## issues

List open issues and resume one via full brainstorming. Reachable via
natural language, e.g. "what issues do I have?", "let's work on one of my
issues". This is the canonical procedure — `/web:feature issues` is an
alternate entry point to the same steps below (differing only in `<target
repo>`).

1. List open candidates: `gh issue list --repo <target repo> --state open`
   (no label filter — show issues of every type, so nothing is hidden;
   this also surfaces any legacy `catalog-suggestion`-labeled issues).
   Show the user each issue's number, title, and type label.
2. Let the user pick one, by number or by naming it. If their answer
   matches more than one listed issue, or none, ask them to pick by number
   instead of guessing.
3. Fetch the full issue: `gh issue view <n> --repo <target repo>`.
4. Use that issue's title and body as the starting context for the
   `brainstorming` skill, in place of a blank user prompt — the rest of
   the flow (clarifying questions, design, plan) proceeds exactly as it
   would for any other brainstorming request.
5. Once that work concludes, offer to close the issue: `gh issue close <n>
   --repo <target repo>`. Never close it without asking — same "propose,
   don't silently act" principle `status` and `apply` already follow for
   app-side edits.

## fix <n> [n...]

Triage one or more issues with a lightweight analyze-then-choose loop,
instead of going straight into full brainstorming for every issue
regardless of how simple it is — a good fit for `bug`-type issues that
often just need a direct fix. Reachable via natural language, e.g. "fix
issue #3", "let's knock out a couple of these". `/web:feature fix` is
an alternate entry point to the same steps below (differing only in
`<target repo>`).

1. For each issue number given: `gh issue view <n> --repo <target repo>`
   to get its title/body/label.
2. **Small analysis per issue**, done by you, not delegated to a skill:
   figure out where the change actually belongs — this app repo, the
   catalog repo checkout (see "Locating the catalog repo checkout" in
   `../web-feature/SKILL.md`), a specific feature's `FEATURE.md`/
   `SKILL.md`, or somewhere else entirely — and sketch one concrete
   solution: which files change, roughly how, and any real open question
   or risk you hit while sketching it.
3. **Propose, then ask.** Show the user the sketch per issue and ask
   whether to `brainstorm/plan` it or `just go`:
   - If step 2 produced a single confident, low-risk solution, offer both
     options but default the recommendation to `just go`.
   - If step 2 surfaced a genuine design choice, ambiguity, or a solution
     you're not confident in, say so and recommend `brainstorm/plan`
     instead of asking — same "flag uncertainty explicitly" principle as
     everywhere else.
4. **`brainstorm/plan`** — hand off exactly like `issues` above (steps
   4-5): the issue's title/body/your analysis as context for the
   `brainstorming` skill, then offer to close the issue once that
   concludes.
5. **`just go`** — implement the sketched solution directly in the
   repo/location identified in step 2, following the normal skills that
   would apply to that kind of change anyway (e.g. `test-driven-development`
   for app code, `pnpm check` for catalog edits). If the fix
   lands in the catalog's `skills/` or `commands/`, bump the plugin version
   in the same commit — see the repository ownership guidance in `../web-feature/SKILL.md`. No brainstorming/writing-plans
   ceremony. Once it's done and verified, offer to close the issue — never
   close it without asking.
6. With multiple issue numbers: work through steps 1-3 for each before
   acting on any of them, so the user sees every proposal up front and can
   route each one (`brainstorm/plan` vs `just go` vs skip) independently,
   rather than being surprised mid-batch.

## Self-improvement

When any subcommand above is done, follow the reflection in
`../web-feature/references/self-improvement.md` — notice what was unclear
or underspecified about *this skill* (its own instructions, not the app you were
working in) and offer to file it back to the catalog. Nothing noteworthy is the
normal outcome — say nothing then.

Note the target repo: a reflection issue always goes to the catalog repo
(`AppElent/agent-plugins`), **not** this app's repo, even though this front
door's own `issue` verb files against the app. This skill lives in the catalog,
so feedback about it belongs there. See "Target repo: always the catalog" in that
reference for why this overrides "Issues: target repo and type labels" above.
