---
name: mobile-design
description: Design judgment for native mobile apps — what to build, how it should feel, and what "done" means, iOS-first. Use when designing or implementing any mobile screen or flow (onboarding, paywall, settings, tab bar, sheet, empty state), when asked to make an app look or feel native, when polishing UI, motion, navigation semantics or dark mode, when deciding push vs replace or modal vs sheet, or before writing the first line of UI code for a screen. Covers product flow decisions, Apple HIG fidelity, navigation semantics, anti-slop discipline, motion, and iOS-vs-Android divergences. For the Expo APIs that implement any of it, use `expo-overview`.
---

# mobile-design

Judgment, not mechanics. This skill decides **what the screen is and how it
should feel**; the `expo-*` skills decide how to build it. Load both — this
one first.

## App-local guidelines

Before implementing or reviewing an app, read docs/guidelines/shared/README.md when present, load the relevant sets, then read docs/guidelines/app.md for app decisions and documented exceptions. These are the app's pinned rules. Report missing guideline setup when relevant; do not install or update it as a side effect of a UI review.

## Use this before the code, not after

The most expensive mistake in mobile work is implementing a screen before
deciding what it is. A screen is a node in a flow, and its exits — push or
replace, modal or sheet, whether back may return here — are design decisions
that are cheap now and structural later.

If you're about to write a component for a screen whose neighbours you can't
name, stop and do step 1.

**Working on an app that already exists?** This skill is written for the screen
in front of you. To point the whole set at an existing codebase — and get drift
measured before conformance, so the result is a work list rather than a rewrite
proposal — use `../mobile-audit/SKILL.md` instead.

## The order

**1. Decide what the screen is** → `references/product-flows.md`

The vertical, the user stage, the one primary action, what precedes and follows,
the MVP element set. Then the visual system: type ramp, 60/30/10 color, spacing
rhythm. Then the emotional shape: which moment is the peak, what the ending is.

**2. Study before you draw** → `references/native-feel-laws.md`

Look at 10+ real reference screens for this screen type. Extract the *pattern* —
layout skeleton, hierarchy, control choices, where the CTA sits, what each step
*is* (push / modal / sheet) — not the pixels. Then design your screen on that
skeleton in your product's voice.

**3. Settle the navigation semantics** → `references/native-feel-laws.md`

Before any styling: what is this screen *to* the previous one, must back return
here, and what does back do on both platforms. Back undoes navigation, never
events. One-way doors leave the stack — but keep the user's place.

**4. Apply native fidelity** → `references/native-feel-laws.md`

Platform controls over rebuilt ones. Semantic colors, both themes, day one. One
icon family, one accent, one radius scale, one spacing unit. Safe areas as part
of the design. Then run the anti-slop pre-flight count.

**5. Decide the motion** → `references/motion.md`

Start at the frequency gate — most animations should not exist. If it survives:
name the purpose in one word, pick transform/opacity, spring if a finger was
involved, keep it under 300ms, and ship reduced motion with it.

**6. Note the Android divergences** → `references/platform-differences.md`

You designed for iOS and you won't verify on Android. Every choice that would
look or behave wrong there gets one parity note in your output.

**7. Check it's actually done** → the definition below.

## Load only what you need

| If the question is | Read |
|---|---|
| What goes on this screen / what's the flow / which vertical language | `product-flows.md` |
| Does this feel native / push or replace / modal or sheet / is this slop | `native-feel-laws.md` |
| Should this animate / what spring / how do gestures hand off / haptics | `motion.md` |
| What breaks on Android / which lever handles it | `platform-differences.md` |

Don't load all four for a small change. A press-feedback question is
`motion.md` alone.

## Definition of done, per screen

A screen is not done because the code compiles. It's done when:

- [ ] You studied 10+ reference screens for this screen type and **can name the
      pattern you adopted**.
- [ ] Navigation is answered: what this screen *is* (push / modal / sheet /
      overlay / replace), what back does from it on both platforms, and — behind
      a one-way door — that back cannot re-enter the old state.
- [ ] Light **and** dark verified on a real device.
- [ ] Safe areas, Dynamic Island and home indicator verified.
- [ ] Long-content, empty, loading and error states **designed, not defaulted**.
- [ ] Motion: the whole flow screen-recorded and scrubbed — entrances, presses,
      transitions, modals, keyboard. Native feel, no glitch or wrong-color
      frames. Reduce Motion respected. 60fps on a release build.
- [ ] Dynamic Type XL doesn't break the layout; text is selectable where useful.
- [ ] All tap targets ≥ 44pt (48dp if the component is shared with Android);
      contrast passes in both themes — 4.5:1 up to 17pt, 3:1 at 18pt or bold.
- [ ] Assets: one style family, crisp at @3x, no compositing halos.
- [ ] Lists virtualized; no controlled-input jank; no re-render storms —
      **profiled, not guessed** (`../mobile-rules/SKILL.md`).
- [ ] Android parity notes written for every divergence.

Two rules that make the checklist real:

> **A screen does not exist until you have seen it running.** Don't stop at
> "looks fine" — stop at "cannot find a flaw at 100% zoom".

> **One glitchy frame means the flow is not done.**

Screenshots prove layout and prove nothing about motion. On Windows there is no
local iOS simulator — the gate is a physical iPhone (see `../mobile/SKILL.md`).

## What this skill will not do

- **Pick your Expo APIs.** Every reference here names concepts, not call
  signatures. `expo-overview` routes to the leaf that owns the current API.
- **Audit code.** `../mobile-rules/SKILL.md` is the review checklist.
- **Tell you what Apple requires.** `../mobile-release/SKILL.md` owns that —
  and it belongs in *this* phase, not at submission, whenever you're designing
  sign-in, a paywall, or a permission prompt.
- **Design for Android.** Divergences get noted, not solved, unless the user
  asks for Android work explicitly.

## Sources

Distilled — not copied — from public work, with the mechanics stripped out and
the conflicts resolved rather than reproduced:

- **`emilkowalski/skills`** (MIT, © 2026 Emil Kowalski) — `apple-design`,
  `animate-expo`, `animation-vocabulary`, `improve-animations`,
  `review-animations`, `find-animation-opportunities`, `emil-design-eng`. The
  motion decision order, the easing constants, the gesture handoff sequence, and
  the Apple-sourced spring parameters.
- **`Appllama/appllama-skills`** → `appllama-app-design-skill` (MIT, © 2026
  Antmind Ventures Private Limited) — navigation semantics, the anti-slop laws
  and pre-flight count, the definition of done and the recorded-flow review.
  Its Appllama-MCP and Higgsfield-MCP dependencies are removed; the underlying
  rules stand without them. Its sibling `appllama-usage` skill is not used — it
  requires a paid MCP.
- **`ceorkm/mobile-app-ui-design`** — the five-step process, per-vertical visual
  languages, and the UX-psychology material. **No license file**, so nothing is
  reproduced: the claims are restated in our own words, and the psychology is
  annotated with what actually replicates and what is folk.
- **Apple Human Interface Guidelines**, **Material Design 3**, **React
  Native**, **React Navigation**, **Expo** and **Android developer**
  documentation — every hard number here (contrast ratios, target sizes, sheet
  detents, state-layer opacities, type scales, inset families) comes from these
  primary sources rather than from someone's summary of them, and the
  Liquid-Glass material rules are current as of the 2025–26 HIG revisions.

One deliberate non-source: a survey of 17 other public React Native / Expo
skill repos found **nothing on design, HIG or Material worth adopting** — the
substantial ones are engineering-only, four are unattributed repackages of each
other, and the one repo that does cover HIG and Material is shallow and
unlicensed. The iOS↔Android porting delta is genuinely unclaimed ground, which
is why `platform-differences.md` is the longest file here.

Where the sources conflicted, this skill picks one and says so: a hard 300ms
ceiling for timing-driven motion; press feedback split by surface (scale on
buttons and cards, background highlight on rows, opacity on bar buttons);
entrance from `scale(0.95)`; `dampingRatio` as the spring vocabulary; and "the
platform default" rather than "no animation ever" for the highest-frequency
tier, since on iOS the system already has a transition there.

## Self-improvement

Once the design work is reported, follow the reflection in
`../mobile/references/self-improvement.md` — notice what was unclear or
underspecified about *this skill*: a decision the references don't resolve, a
screen type the flow doesn't fit, a conflict between two references. Not about
the app you designed. Nothing noteworthy is the normal outcome — say nothing
then.
