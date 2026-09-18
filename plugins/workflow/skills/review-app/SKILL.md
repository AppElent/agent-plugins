---
name: review-app
description: Autonomously drive a local app through the active provider's browser automation, exercise it end-to-end, and produce a self-contained findings report. Use when asked to review an app, run an end-to-end review, find UI bugs automatically, or test a newly built flow.
---

# Review App

## Your role this run

Drive the app through the browser automation available in the active provider,
exercise it end-to-end, and write up everything you find. The required
capabilities are: start or connect to a local dev server, navigate, inspect the
accessible page structure, click and fill controls, resize the viewport,
capture screenshots, and inspect console and network failures. Resolve
ambiguity yourself; stop only for a genuine blocker such as a server that
cannot start.

This workflow targets local development only. Never use a production URL.

Provider adapters:

- Claude Code Preview: use the `preview_*` tools and `.claude/launch.json`.
- Codex: use the available browser/computer-use capability and start the dev
  server through the local shell when needed.
- Any other provider: proceed only when equivalent browser and local-server
  capabilities are available; otherwise report the missing capability.

## 1. Ground yourself in the project

- Inspect the project's configured development command. For Claude Preview,
  look for `.claude/launch.json`; if it is absent, create it from the actual
  `package.json` dev script and configured port, for example:
  ```json
  {
    "version": "0.0.1",
    "configurations": [
      { "name": "dev", "runtimeExecutable": "pnpm", "runtimeArgs": ["run", "dev"], "port": 3000 }
    ]
  }
  ```
  (use the actual dev command and port for this project — check `package.json` scripts and any vite/next config for the real port instead of assuming 3000).
- Skim `README.md` and `CLAUDE.md` (or equivalent) for: what the app does, what its main sections/tools are, key routes, and anything documented about a test-login convention or demo/seed data.

## 2. Resolve the scope argument

If invoked with an argument, work out what it means before doing anything else:

- **Route/section name** (e.g. `roadmaps`, `settings`) → narrow the crawl to pages under that section.
- **Viewport/theme mode** (e.g. `mobile`, `tablet`, `dark mode`, `light mode`) → call `preview_resize` with the matching `preset` and/or `colorScheme` before crawling, and specifically look for mode-related issues (dark-mode contrast, mobile overflow/nav collapse, tablet layout breaks).
- **"What we just built" / "what we just did" / "the feature we just added"** → run `git status --short` and `git diff` for uncommitted work, or `git log -1 --stat` if the tree is clean (meaning it was just committed). Map the changed files to routes (anything under `src/routes/**` or equivalent) and components (grep the repo for where a changed component is imported/used) and scope the crawl to just those pages/flows.
- Combinations (e.g. "dark mode on the item editor") → apply both narrowings.
- No argument → full-app pass from the root/dashboard route.

State your interpretation of the scope in one line before you start crawling — this becomes the Coverage note in the report later.

## 3. Start the preview and get your bearings

- Start or connect to the local server with the active provider's supported
  mechanism. If it fails or the expected port is unavailable, stop and report
  the blocker rather than retrying indefinitely.
- Navigate to the root route or scoped entry point and inspect the page
  structure to discover navigation.

## 4. Get past login, if there is one

If the target scope is behind a login wall:

- Look for an obvious test-account affordance first: a dev-mode banner/button (e.g. Clerk's "sign in as test user" in development instances), a visible "demo"/"test login" link, or seeded credentials documented in the README/CLAUDE.md you already read.
- Use whichever of those exists to get authenticated.
- If none exists, do not guess or invent credentials. Proceed with whatever is reachable unauthenticated, and note in the report that authed areas were not covered and why.

## 5. Crawl

Browse breadth-first from the entry points, following navigation and in-page
controls found through the provider's page inspection capability. Cap a
full-app pass at about 20 distinct pages or views.

On each page:

- Inspect structure/content and capture a screenshot for visual review.
- Inspect console output and note JavaScript errors.
- Inspect failed network requests when the provider exposes network data.
- Exercise the page's main interactive elements: open dialogs/panels, try key forms, and exercise CRUD where it's central to the page's purpose (creating, editing, deleting real records is fine — this only runs against a local dev server, and you don't need to clean up afterward). Prefer creating your own throwaway record and then deleting *that* to verify the create/edit/delete flow, rather than deleting pre-existing or seeded data, when both would exercise the same functionality.
- Do a quick accessibility pass over the snapshot: missing labels on inputs/buttons, missing alt text, elements that should be interactive but aren't exposed as such, obvious keyboard-nav dead ends.

You MUST stop crawling once you hit that budget or run out of new reachable pages, whichever comes first — even mid-section.

## 6. Pin down locations as you go

The moment something looks wrong, resolve where it lives in the code before moving on — read the route file for the current page, or grep for text/labels you saw on screen. Every finding in the final report must name a real file, not "the settings page" with no path.

## 7. Stay inside the app

CRUD on the app's own data is fine. Never trigger something with a real external effect — don't submit a form that would send a real email, hit a real payment provider, or call a real third-party webhook, even if the button is right there.

## 8. Create the GitHub issue

Create one GitHub issue in the current app repo. Resolve the target repo with:

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

If the repo cannot be resolved, `gh` is not authenticated, or issues are
disabled, stop and report the `gh` failure plainly. Never fall back to any
other repo.

Use this issue title:

```text
Automated review: <scope or full app> - <date/time>
```

Use this issue body:

```md
# Automated Review — <date/time>

Branch: <branch>
Scope: <how you interpreted the scope argument, or "full app">

## Coverage

- Pages/views visited: <count and list>
- Auth: <reached / not reached, and why>
- Budget: <hit the ~20-page cap / crawl frontier exhausted naturally>

## Goal

Address all action items below. Each item is self-contained: route, file paths, fix direction, and acceptance criteria are specified. Work through them in severity order. After each fix, verify against its acceptance criteria. Run typecheck, lint, and tests before considering an item done. Do not weaken tests to pass. Commit each item separately once done and verified — one commit per action item, not one commit at the end.

## Summary

<1–2 sentence overview + counts by type/severity>

## Action Items

### Blockers

- [ ] **<short title>**
  - **What:** <concrete description>
  - **Where:** `<route>` -> `<file path>` (`<component/function>`)
  - **Type:** bug | UX | accessibility | console-error | network-error | copy | nice-to-have
  - **Fix direction:** <what to change and roughly how>
  - **Acceptance:** <observable expected behaviour>

### Major

- [ ] ...

### Minor

- [ ] ...

### Nice-to-have / Ideas

- [ ] ...
```

Order items by severity within each section. Before creating the issue,
self-check: would a fresh Claude session with only this GitHub issue be able
to find and fix every item without asking a question? If not, go back and fill
the gap (read the file, pin the acceptance criterion) rather than leaving it
vague.

Infer exactly one issue label:

- `bug` if any blocker or major action item is broken behavior, a console
  error, a network error, or an accessibility failure that blocks the flow.
- `enhancement` otherwise.

Ensure the chosen label exists using the shared Appelent issue convention:
`gh label list --repo <target repo> --search <label>`; only if absent, create
it with `gh label create <label> --repo <target repo> --color <color>
--description "<description>"` where `bug` uses `d73a4a` / "Something isn't
working" and `enhancement` uses `a2eeef` / "New feature or request".

Create the issue:

```bash
gh issue create --repo <target repo> --title "<title>" --body "<issue body>" --label <label>
```

## 9. Wrap up

Give the GitHub issue URL and a one-line counts recap, then ask:
**"Want me to fix this issue now?"**

- If no: stop here. The issue stays open for later.
- If yes: use the created issue as the execution source. Work through the
  action items in severity order; after each fix, verify against that item's
  acceptance criteria and run typecheck, lint, and tests before considering it
  done. Do not weaken tests to pass. Commit each item separately once done and
  verified — one commit per action item, not one commit at the end. Offer to
  close the issue only after all items are fixed and verified.

## Self-improvement

Once the review issue exists and step 9 is settled, follow the reflection in
`../workflow/references/self-improvement.md` — notice what was unclear
or underspecified about *this skill's own instructions* and offer to file it
back to the workflow plugin.

**These are two different issues in two different repos — do not merge them.**
Step 8's issue is the review's findings and goes to the **app's** repo. This
one is about the review procedure itself — an ambiguous step, a browser tool
that didn't behave as documented, a judgment call the skill left open — and
goes to the **toolbox** repo (`AppElent/agent-plugins`), because that's
where this skill lives. Never put skill friction in the app's review issue, and
never put app findings in the workflow plugin.

Nothing noteworthy is the normal outcome — say nothing then. A review that went
smoothly should end at step 9.
