---
name: mobile-audit
description: Audit an existing React Native / Expo app against the mobile skill set and file one triaged GitHub issue. Use when pointing the mobile skills at a codebase that already exists — "audit my app", "is this app native enough", "review the design of this codebase", "we inherited this app", "what's our design debt", "is this ready to submit" — or before a first App Store submission. Measures drift from the app's own conventions first and conformance second, and never proposes a restructure. For designing a new screen use `mobile-design`; for code-level performance rules use `mobile-rules`.
---

# mobile-audit

The rest of the mobile set assumes you're about to build something. This one
assumes it already exists, possibly written by someone else, possibly a while
ago.

## App-local guidelines

Before implementing or reviewing an app, read docs/guidelines/shared/README.md when present, load the relevant sets, then read docs/guidelines/app.md for app decisions and documented exceptions. These are the app's pinned rules. Report missing guideline setup when relevant; do not install or update it as a side effect of a UI review.

## The reframe: measure drift, not conformance

An existing app measured against `mobile-design` produces a hundred findings and
implies a rewrite. That report gets read once and ignored.

The question that produces actionable work is **"where is this app inconsistent
with itself?"** — three accent colors, five corner radii, two spacing systems,
sheets that are sometimes routes and sometimes `useState`, four ways of pressing
a row. Drift is cheap to fix, compounds if ignored, and every fix makes the next
one cheaper. Conformance gaps are worth naming but rarely worth a sprint.

So: **drift findings lead the report. Conformance findings follow.**

## Three hard rules

1. **Never propose a restructure.** Not the folder layout, not the navigation
   architecture, not a styling-library migration — unless the user explicitly
   asks. Expo's own guidance says never restructure an existing app to match the
   ideal layout, and the same applies to everything here. An audit that ends in
   "rewrite it this way" has failed.
2. **Don't fix while auditing.** Findings first, in one report. A review that
   silently rewrites things stops being reviewable. Fixing comes after, and only
   if asked.
3. **Report by impact, not by rule order.** A rejection beats a crash beats a
   re-render beats a radius that's 14 instead of 16.

## What you can and cannot see

On Windows there is no local iOS simulator, so be honest about the split:

**Auditable from the code** — design tokens and their drift, navigation
semantics read from route config, presentation modes, state cycles (does an
empty state exist at all), platform-only APIs, release obligations, and every
rule in `mobile-rules`. This is most of the value and it needs no device.

**Needs the physical iPhone** — whether it *feels* native: motion quality,
gesture handoff, scroll physics, one-frame flashes, haptic timing, whether the
blur under the Dynamic Island holds.

State clearly in the report which findings are code-derived and which are
unverified-on-device. Never write a device-gated finding as if you observed it.

## 1. Inventory

Before judging anything, build the map. Collect:

- **Expo SDK version, and managed vs prebuild** (are `ios/`/`android/`
  committed?). Load `expo-overview` for anything version-specific from here on.
- **Routes and screens** — the router tree. Count them.
- **Navigators** — stacks, tabs, and every `presentation` used.
- **Design tokens** — is there a token file at all, or are values inline?
- **Component inventory** — the shared UI components, and whether app code
  imports them or reaches past them.
- **Dependencies** that matter to the rules: list library, image library,
  animation, styling, state, keyboard, safe-area.

If there is **no token file and no shared component layer**, that is itself the
top finding — every drift below is a symptom of it.

## 2. Pass A — drift (mechanical, app-wide)

This is the pass that pays. Count, don't judge. Every count with a result above
one is a finding, and the fix is "pick one".

| Count | Expected | How |
|---|---|---|
| Distinct accent/brand hues | **1** | grep hex literals and named colors; exclude neutrals |
| Distinct corner radii | one stated scale | grep `borderRadius` values, tally |
| Distinct font sizes | ≤4 | grep `fontSize` |
| Distinct font weights | ≤2–3 | grep `fontWeight` |
| Spacing values off the 4/8 grid | **0** | grep padding/margin/gap numerics |
| Shadow implementations | 1 | `shadowColor` / `elevation` / `boxShadow` mixed = drift |
| Grey families (warm vs cool) | 1 | inspect the neutrals |
| Emoji in UI chrome | **0** | grep for emoji outside content strings |
| Gradients without a brand reason | **0** | grep gradient usage |
| Duplicate labels for one intent | **0** | grep CTA strings — "Get started" vs "Start now" |
| Press-feedback mechanisms | 1 per surface type | `TouchableOpacity` vs `Pressable` vs gesture |
| Hardcoded colors vs semantic tokens | tokens | any raw hex in a themed app is drift |

Then the structural drift, which needs reading rather than counting:

- **Sheets and modals**: are they routes, or `useState` booleans? Mixed is
  drift. Anything a link could open should be a route.
- **Presentation consistency**: does the same *kind* of destination always get
  the same presentation?
- **State cycles**: how many screens have a designed empty / loading / error
  state, versus only the populated success case? Report as a ratio — it's the
  most quotable number in the whole audit.

Reference: `../mobile-design/references/native-feel-laws.md` (anti-slop and the
pre-flight count), `../mobile-design/references/product-flows.md` (the visual
system).

## 3. Pass B — native feel

Sample rather than sweep. Pick: the hero flow end to end, the 3–5
highest-traffic screens, and one screen of each presentation type. Say which you
picked and why.

Per sampled screen, against
`../mobile-design/references/native-feel-laws.md`:

- **Navigation semantics** — read from the route config, not from vibes: push vs
  replace, what back does, whether one-way doors actually leave the stack,
  whether a back-navigable flow is buried in a modal.
- **Platform controls vs rebuilt ones** — hand-rolled switches, pickers, action
  sheets, share sheets.
- **Chrome** — hand-rolled headers instead of the navigator's, missing large
  titles, hard dividers under translucent bars.
- **Dark mode** — does every screen actually have it, or does it exist in a
  theme file nobody uses?
- **Type and targets** — Dynamic Type honored, targets ≥44pt, contrast.
- **Forms** — labels above fields, keyboard types, validation timing.

Motion findings from code are limited to the obvious ones (layout properties
animated, scroll offset in state, tabs that slide). Everything else is
device-gated — list it as "to verify on device" rather than asserting it.

## 4. Pass C — platform parity

Against `../mobile-design/references/platform-differences.md`. Even under the
iOS-first policy this is worth a pass on an existing app, because it tells you
what an Android port would actually cost:

- iOS-only props used as if universal (`contentInset*`, `bounces`,
  `borderCurve`, `headerLargeTitle`, blur effects).
- Screens whose only exit is a header button — Android system back has nothing
  to do.
- Custom fonts registered by weight rather than by family.
- Fixed-height rows that will overlap text in non-Latin scripts.
- Shadow-only elevation, `overflow: 'visible'`, `zIndex` stacking.
- Alert button order hand-rolled instead of declared by style.
- Touch targets at 44 rather than 48 on shared components.

Output this as a single **"cost of an Android port"** section rather than as
scattered findings. That framing makes it a decision the user can take.

## 5. Pass D — release readiness

Run `../mobile-release/SKILL.md` as a checklist against the code. The
architectural ones are the point:

- Account creation without in-app account deletion. **Blocker.**
- A login wall on an app with no real account features. **Blocker.**
- Third-party/social login with no privacy-preserving equivalent. **Blocker.**
- Digital unlocks not going through in-app purchase. **Blocker.**
- Purpose strings that are empty, vague, or missing for a used permission.
- No in-app privacy policy link.
- Recording without a visible indicator.
- Third-party SDKs whose data collection isn't reflected in the privacy labels.

These outrank everything else in the report. A radius inconsistency costs
nothing; a missing account-deletion screen costs a rejection cycle.

## 6. Pass E — code rules

Delegate to `../mobile-rules/SKILL.md` and run its detection greps. Don't
restate its rules here; cite rule ids so the reasoning stays checkable.

Gate first: is React Compiler enabled? Is this a monorepo? Both change which
rules apply.

## 7. Tier and sequence

Every finding gets exactly one tier:

| Tier | Meaning |
|---|---|
| **Blocker** | Gets rejected, crashes, or is broken on device |
| **Drift** | The app contradicting itself — cheap, compounding, high leverage |
| **Polish** | Conformance gaps needing judgement or a device |

**The fix order is blockers → drift → polish, and the middle one is the
non-obvious part.** Fix drift before polish even though polish findings often
look more serious: once there is one accent token and one radius scale, every
later fix is a one-line change instead of a hunt. Polishing an app that still
has five spacing systems means doing the work twice.

Within drift, order by **number of files touched per fix** — the count is
already in hand from Pass A.

## 8. File one GitHub issue

One issue in the current app repo, never a markdown file in the app. Resolve the
target repo with:

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

If the repo cannot be resolved, `gh` is not authenticated, or issues are
disabled, stop and report the `gh` failure plainly. Never fall back to any other
repo.

Title:

```text
Mobile audit: <scope or full app> - <date>
```

Body:

1. **Scope and method** — what was audited, which screens were sampled and why,
   the SDK version, and the code-derived vs device-gated split.
2. **Counts table** from Pass A. Lead with it; it's the most persuasive part.
3. **Blockers**, each with the file, the obligation, and what "fixed" means.
4. **Drift**, ordered by files-touched, each with the "pick one" decision the
   user has to make — a drift finding without a proposed single value is not
   actionable.
5. **Cost of an Android port** — the Pass C section.
6. **Polish**, including everything to verify on device.
7. **Not done** — anything skipped, and why.

Label it `enhancement` unless blockers dominate, in which case `bug`. Ensure the
label exists first (`gh label list --repo <repo> --search <label>`; create with
`gh label create` only if absent — `bug` is `d73a4a` / "Something isn't
working", `enhancement` is `a2eeef` / "New feature or request").

```bash
gh issue create --repo <target repo> --title "<title>" --body "<issue body>" --label <label>
```

## 9. Wrap up

Give the issue URL and a one-line counts recap, then ask: **"Want me to fix any
of this now?"**

- If no: stop. The issue stays open.
- If yes: work in tier order, smallest-blast-radius first. Verify each fix, run
  the project's typecheck/lint/tests, and commit each item separately. Never
  weaken a test to pass. Anything device-gated stays unverified until the user
  checks it on the iPhone — say so rather than calling it done.

Do not batch a drift fix across the whole codebase in one commit unless it is
genuinely mechanical; a token consolidation that touches 40 files needs to be
reviewable.

## Self-improvement

Once the audit is filed, follow the reflection in
`../mobile/references/self-improvement.md` — notice what was unclear or
underspecified about *this skill*: a count that produced noise, a tier that
didn't fit, a finding class the passes missed entirely. Not about the app you
audited — that belongs in the issue you just filed. Nothing noteworthy is the
normal outcome — say nothing then.
