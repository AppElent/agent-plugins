---
name: mobile-rules
description: React Native / Expo audit checklist — 36 correctness, performance, and structure rules for reviewing mobile code. Use when reviewing or auditing React Native or Expo code, when a list scrolls badly, when an animation stutters or drops frames, when the app feels slow or janky on device, before shipping a build, or when the user asks what's wrong with a screen or component. This is a review checklist, never a build guide — when a rule names a library and an `expo-*` skill names another, the Expo skill wins.
---

# mobile-rules

A checklist for **reading code you already have**. Run it when something is
slow, before a release, or when asked to review a screen.

## Why this is an audit checklist and not a build guide

Every rule below is a static claim about React Native written at a point in
time. The *reasons* age well — a bridge round-trip per frame is still a bridge
round-trip per frame. The *library picks* age badly, and several already
disagree with what the official `expo-*` skills say to use today.

In a review that's harmless: a stale library suggestion is a suggestion you
reject. In a build guide it's broken code. So:

> **Precedence.** When a rule here names a library and `expo-ui`,
> `expo-native-ui`, `expo-router`, `expo-animation`, or `expo-data-fetching`
> names a different one, **Expo wins** — those skills are version-aware and
> this file is not. Apply the rule's *reason*, take Expo's *component*. Rules
> tagged `[expo-first]` are the known collisions.

Other tags:

- `[expo-first]` — the reason holds, the library pick is contested. Check the
  relevant Expo skill (usually `expo-ui`) before acting.
- `[ios-only]` — the API is iOS-only. The source states it as universal; it
  isn't. Relevant to any Android parity note.
- `[compiler]` — only applies when React Compiler is enabled
  (`babel-plugin-react-compiler` in the Babel config). Check before applying;
  with the compiler on, several manual-memoization rules below become no-ops.

## How to run an audit

1. **Scope it.** A screen, a component tree, a diff — not the whole app.
2. **Check the gates first**: is React Compiler on? Is this a monorepo? Which
   Expo SDK? These change which rules apply.
3. **Grep for the high-signal rules** (see Detection below) before reading
   anything, so the obvious hits are already in hand.
4. **Read the code for the judgement rules** — the ones grep can't see.
5. **Report by impact, not by rule order.** A crash beats a re-render beats a
   style nit. Cite the rule id so the reasoning is checkable.
6. **Don't fix while auditing** unless asked. A review that silently rewrites
   things stops being reviewable.

## Crashes and correctness

| Rule | Do this | Because |
|---|---|---|
| `rendering-text-in-text-component` | Wrap every string in `<Text>`; never a bare string inside `<View>` | bare string child of a View is a runtime crash |
| `rendering-no-falsy-and` | Never `{value && <X/>}` when value can be `0` or `""` — use a ternary, `!!`, or an early return | `0` and `""` are falsy but renderable; hard crash in production |
| `monorepo-native-deps-in-app` | List every native dependency in the native app's own `package.json`, not only in a shared package | autolinking only scans the app's `node_modules` |
| `react-state-dispatcher` | Use `setState(prev => …)` whenever the next value depends on the current one | reading state inside a callback captures a stale closure |

## List performance

The single largest source of jank. Lists mount and recycle many components, so
every inefficiency multiplies.

| Rule | Do this | Because |
|---|---|---|
| `list-performance-virtualize` `[expo-first]` | Virtualize any list — never `ScrollView` + `.map()`, even for short lists | ScrollView mounts every child upfront; a virtualizer mounts ~10–15 |
| `list-performance-function-references` | Don't `.map()`/`.filter()` data on the way into the list; transform inside the item | a new array of new objects re-renders every visible row |
| `list-performance-inline-objects` | Never build objects or style literals inside `renderItem` | inline objects are a new reference each render, defeating `memo()` |
| `list-performance-item-memo` `[compiler]` | Pass only primitives as props to item components | shallow `memo()` comparison only works on primitives |
| `list-performance-callbacks` `[compiler]` | Create one callback at the list root; items call it with their own id | a closure per item is a new reference per item |
| `list-performance-item-expensive` | Keep item components hook-free — no `useQuery`, minimal Context; hoist fetching to the parent | per-item hooks fire on every recycle, janking the scroll |
| `list-performance-item-types` | Give heterogeneous items a `type` and pass `getItemType` | separate recycling pools stop a header recycling into an image cell |
| `list-performance-images` | Request thumbnail-sized images (≈2× display size) via CDN resize params | full-resolution decode blows memory and stalls scroll |

The upstream rule prescribes LegendList or FlashList; `expo-first` applies —
confirm what the project's SDK and the Expo skills support before switching a
list library. FlashList v2 dropped `estimatedItemSize`, so copied snippets rot.

## Animation and scroll

| Rule | Do this | Because |
|---|---|---|
| `animation-gpu-properties` | Animate only `transform` and `opacity` — never `width`/`height`/`top`/`left`/`margin`/`padding` | layout properties force a layout pass every frame |
| `scroll-position-no-state` | Never store scroll offset in `useState` — use a shared value or a ref | scroll fires per frame; `setState` thrashes the render loop |
| `state-ground-truth` | Store semantic state (`pressed`, `isOpen`, `progress`) and derive visuals with `interpolate` | storing `scale` directly blocks reuse and makes it undebuggable |
| `animation-derived-value` | Use `useDerivedValue` to derive; reserve `useAnimatedReaction` for side effects | derived values track dependencies and return a value |
| `animation-gesture-detector-press` `[expo-first]` | Drive press animations from a gesture worklet, not `onPressIn`/`onPressOut` | gesture callbacks run on the UI thread — no JS round-trip |

Note the source contradicts itself here: `animation-gesture-detector-press`
says wrap presses in a `GestureDetector`, while `ui-pressable` says use
`Pressable`. Resolve it as: `@expo/ui` or `Pressable` for ordinary taps,
gesture worklets only when the press *drives an animation*.

The UI-thread claims assume Reanimated 3 worklets on the New Architecture. On
the old architecture the bridge is still in the path and the benefit shrinks.

## Navigation and UI

| Rule | Do this | Because |
|---|---|---|
| `navigation-native-navigators` | Use native stack and native tabs, never the JS `@react-navigation/stack` or `bottom-tabs` | native navigators run transitions and gestures on the UI thread |
| `ui-expo-image` | Replace React Native's `Image` with `expo-image` everywhere | memory-efficient caching, blurhash, progressive loading |
| `ui-pressable` `[expo-first]` | Never `TouchableOpacity`/`TouchableHighlight`/`TouchableWithoutFeedback` | legacy API; `Pressable` (or a native button) supersedes it |
| `ui-menus` `[expo-first]` | Use a native dropdown/context menu, not an absolutely-positioned JS menu | native menus get platform accessibility and behavior free |
| `ui-native-modals` `[expo-first]` | Use a native sheet/modal presentation, not a hand-rolled JS bottom sheet | swipe-dismiss, keyboard avoidance and a11y come free |
| `ui-image-gallery` `[expo-first]` | Use a real lightbox (shared-element transition, pinch-zoom, pan-to-close), not a `Modal` + `Image` | hand-rolled galleries miss every gesture users expect |
| `ui-styling` `[expo-first]` | Prefer modern style props: `borderCurve:'continuous'`, `gap` over sibling margins, CSS `boxShadow`; vary weight and color rather than font size | avoids legacy shadow/gradient shims and margin-collapse bugs |
| `ui-measure-views` | Measure with `onLayout`, never `measure()`; compare in a functional `setState` before storing | `onLayout` without a comparison re-renders on unchanged dimensions |
| `ui-safe-area-scroll` `[ios-only]` | Let the root ScrollView handle insets via `contentInsetAdjustmentBehavior="automatic"` | native inset handling survives keyboard and toolbar changes without layout shift |
| `ui-scrollview-content-inset` `[ios-only]` | Use `contentInset`/`scrollIndicatorInsets` for spacing that changes, not `contentContainerStyle` padding | changing an inset skips relayout of the content |

`ui-styling` is the rule to treat most carefully: its own upstream summary line
misdescribes it, `experimental_backgroundImage` is named experimental, and
`borderCurve` is iOS-only. The durable half is "stop hand-rolling shadows and
gradients, use `gap`, build hierarchy with weight and color."

## React and state

| Rule | Do this | Because |
|---|---|---|
| `react-state-minimize` | Derive during render instead of storing state and syncing it in a `useEffect` | redundant state re-renders and drifts out of sync |
| `react-state-fallback` | Initialize to `undefined` and fall back with `??` to a prop or server value | `undefined` means "not chosen yet", so the fallback stays reactive |
| `js-hoist-intl` | Hoist `Intl.DateTimeFormat`/`NumberFormat` to module scope (or `useMemo` for dynamic locales) | each construction parses locale data and rebuilds tables |
| `react-compiler-destructure-functions` `[compiler]` | Destructure functions out of hooks at the top of render; don't call them as `obj.fn()` | property access makes a new reference, defeating memoization |
| `react-compiler-reanimated-shared-values` `[compiler]` | Use `sharedValue.get()`/`.set()` rather than `.value` | the compiler can't track property access on shared values |

## Structure

| Rule | Do this | Because |
|---|---|---|
| `imports-design-system-folder` | Re-export third-party UI from a design-system folder; app code imports only from there | one indirection point makes a global swap possible |
| `design-system-compound-components` `[expo-first]` | Don't let a non-text component take a string child — ship `Button`/`ButtonText`/`ButtonIcon` | string children force runtime type checks and ambiguous APIs |
| `monorepo-single-dependency-versions` `[expo-first]` | Keep one version per dependency across packages | duplicate versions duplicate the bundle and conflict at runtime |
| `fonts-config-plugin` | Embed fonts via the `expo-font` config plugin rather than loading them at runtime | embedded fonts are ready at launch, with no async gate or flash |

Two caveats: exact pinning fights `npx expo install`, which wants SDK-compatible
ranges — prefer "one version, chosen by `expo install`" over hard pins. And the
font config plugin requires `npx expo prebuild`, which takes the project out of
Expo Go; on an Expo Go project, runtime font loading is the correct answer.

## Detection

High-signal greps to run first. These are strong enough to act on; the rest of
the list needs reading.

| Check | Pattern |
|---|---|
| Legacy touchables | `TouchableOpacity\|TouchableHighlight\|TouchableWithoutFeedback` |
| JS navigators | `@react-navigation/stack\|@react-navigation/bottom-tabs` |
| Core `Image` | `import\s*\{[^}]*\bImage\b[^}]*\}\s*from\s*['"]react-native['"]` |
| Falsy-`&&` render | `\{\s*\w+(\.\w+)*\s*&&\s*<` and `\.length\s*&&\s*<` |
| Unvirtualized list | `<ScrollView[\s\S]{0,400}\.map\(` |
| Data transformed inline | `data=\{[^}]*\.(map\|filter\|sort)\(` |
| Inline styles in items | `renderItem[\s\S]{0,300}style=\{\{` |
| Layout property animated | `withTiming\(\|withSpring\(` near `(height\|width\|top\|left\|margin\|padding)\s*:` |
| Scroll offset in state | `e\.nativeEvent\.contentOffset` near `set[A-Z]` |
| Legacy shadows | `shadowColor\|shadowOffset\|elevation:` |
| `Intl` in a render body | indented `new Intl\.` |
| Compiler gate | `babel-plugin-react-compiler` in the Babel config |

Judgement-only, not greppable: `list-performance-callbacks`,
`list-performance-item-expensive`, `state-ground-truth`, `ui-measure-views`,
`design-system-compound-components`.

## Android parity

Three rules here are iOS-only and the source doesn't say so:
`ui-safe-area-scroll` and `ui-scrollview-content-inset` (`contentInset*` is an
iOS API), and `borderCurve` within `ui-styling`. On Android these silently do
nothing — which is fine under the iOS-first policy, but it belongs in the
Android parity note rather than being discovered later. See `../mobile/SKILL.md`
for the policy and `../mobile-design/references/platform-differences.md` for
what the Android equivalents are.

## Sources

Distilled from **`vercel-labs/agent-skills` → `react-native-skills`**, MIT,
© Vercel — read at the rule-file level (all 36 rules) rather than from its
summary, which misdescribes at least one rule. Rules were re-grouped, the
upstream severity taxonomy was replaced (it is internally inconsistent across
`_sections.md`, `SKILL.md` and the per-rule frontmatter), library prescriptions
were made deferential to the official Expo skills, and iOS-only and React
Compiler dependencies were tagged where the source stated them as universal.

Upstream, with full code examples for each rule:
<https://github.com/vercel-labs/agent-skills/tree/main/skills/react-native-skills>.
If it is installed locally (`npx skills add vercel-labs/agent-skills`), open
`rules/<rule-id>.md` for the before/after examples — several rules
(`list-performance-inline-objects`, `list-performance-item-types`,
`state-ground-truth`, `react-state-dispatcher`, `ui-styling`) carry
multi-variant examples that do not survive compression to one line.

## Self-improvement

Once the audit is reported, follow the reflection in
`../mobile/references/self-improvement.md` — notice what was unclear or wrong
about *this checklist*: a rule that didn't apply, a library pick that has since
been superseded by an Expo first-party component, a false positive from a
detection pattern. Not about the code you reviewed. Nothing noteworthy is the
normal outcome — say nothing then.
