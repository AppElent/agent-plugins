---
name: mobile
description: "Front door and router for mobile app work — React Native + Expo, iOS-first with Android divergences flagged. Use when the user asks to build, design, review, or ship a mobile / iOS / Android app or app screen, mentions React Native, Expo, Expo Go, EAS, a dev client, or works in a repo with an `expo` dependency. Routes each phase to exactly one owner — design judgment to `mobile-design`, Expo mechanics to the official `expo-overview` router, code audit to `mobile-rules`, release to `eas-*` — and owns the house rules that sit above all of them: iOS-first policy, the device verification loop, and stack defaults."
---

# mobile

The spine for mobile work. It decides **which skill owns the current phase**,
then gets out of the way.

It owns almost no content of its own. That is deliberate: everything about how
Expo, EAS and React Native actually work is versioned software that changes
every few weeks, and a second copy of it here would quietly start lying. What
this skill owns is the part that doesn't move — sequencing, precedence, and
three house rules.

## Read this first: what this skill is not

- **Not an Expo reference.** The official `expo-overview` skill routes 24
  maintained `expo-*` / `eas-*` leaves. Never answer an Expo mechanics question
  from memory or from this file — load `expo-overview` and follow it.
- **Not a replacement for the leaves.** Once you have routed, trust the leaf.
  Don't second-guess it with general React knowledge.
- **Not a code-installer.** This skill leaves nothing behind in the app. If a
  step would install a package or stamp a file, that's catalog territory —
  see `/web:feature`.

## The four phases

Work out which phase the request is in, route to that phase's **one** owner,
and do not load two phase owners at once.

| Phase | The question being answered | Owner |
|---|---|---|
| **1. Decide** | What screen is this, what's on it, how does the flow work, how should it feel? | `mobile-design` |
| **2. Build** | How do I actually implement it in Expo? | `expo-overview` → its leaf |
| **3. Audit** | Is this code going to be slow, janky, or wrong on device? | `mobile-rules` |
| | Where does this whole existing app stand? | `mobile-audit` |
| **4. Ship** | What must be true before Apple will accept this? | `mobile-release` |
| | How does it actually get built, submitted, and versioned? | `expo-overview` → `eas-*` |

### Routing the request

- "Build me a screen / an onboarding / a paywall / a settings page" → **phase
  1 first**, then phase 2. Skipping straight to code is how you get a
  React-shaped app that no iOS user recognizes.
- "Add a tab bar / navigation / fetch this data / upgrade the SDK / add a
  native module" → **phase 2 directly**. Pure mechanics, no design decision
  pending.
- "This list is janky / the app feels slow / review my components" → **phase
  3**, `mobile-rules`.
- "Audit my app / is this native enough / what's our design debt / we inherited
  this codebase" → **`mobile-audit`**, which runs the whole set as a checklist
  and files one triaged issue. It measures drift from the app's own conventions
  before conformance, and never proposes a restructure.
- "Get this on my phone / TestFlight / the App Store" → **phase 4**:
  `mobile-release` for what must already be true, then `eas-*` for the commands.
- "Apple rejected my app" / "what does Apple require" → **`mobile-release`**
  directly.
- **Building auth, a paywall, subscriptions, or a permission prompt** → load
  `mobile-release` *during phase 1*, not at phase 4. Account deletion,
  login-optional design, Sign in with Apple equivalence and in-app purchase are
  architectural obligations, and finding them at submission means shipping a
  feature under deadline.
- "Make it look native / make it feel better / polish this" → **phase 1**, then
  phase 2 for the mechanics. This phrasing almost always hides a design
  decision, not a coding one.
- Ambiguous → say which phase you think it is in one line and continue. Only
  ask when two phases would produce materially different work.

## Precedence — when skills disagree

These conflicts are predictable. Resolve them this way every time, without
relitigating:

1. **The repo beats every skill.** If the codebase already has a pattern, an
   established library, or a house convention, follow it and note the
   divergence once. Skills describe good defaults, not a mandate to refactor.
2. **`expo-*` beats `mobile-rules` on *which library*.** `mobile-rules` is a
   static checklist; the Expo leaves are version-aware and know what shipped in
   the project's SDK. When a rule says "use library X" and `expo-ui` or
   `expo-native-ui` says otherwise, Expo wins. The *reason* behind the rule
   usually still holds — apply the reason, take Expo's component.

   The same split applies at release: **`eas-app-stores` owns every command**
   (build, submit, credentials, TestFlight, versions, metadata push);
   `mobile-release` owns only what must be true before those commands are worth
   running. Never restate an EAS command from our side.
3. **`mobile-design` beats `expo-*` on *what to build*.** Expo's leaves know
   how to render a sheet; they don't know whether this flow should be a sheet
   at all, or whether back must not exist here.
4. **Apple HIG beats taste.** Where `mobile-design` cites a specific HIG rule
   (tap target sizes, semantic colors, modality), that is not a preference to
   weigh against convenience.
5. **Never route to a skill you haven't loaded.** Don't paraphrase what you
   assume `mobile-design` or an Expo leaf says. Load it.

## House rule 1 — iOS first, Android acknowledged

The standing policy for every project under this skill:

- **Design for iOS.** Visual and interaction decisions follow Apple's Human
  Interface Guidelines. When iOS and Android conventions conflict, iOS wins.
- **Build portable anyway.** Default to cross-platform Expo / React Native
  primitives. Reach for `Platform.select`, `.ios.tsx` / `.android.tsx` files,
  or `PlatformColor` only where behavior genuinely differs — not pre-emptively.
- **Never verify on Android.** It is out of scope. Don't spend time on an
  Android emulator, and don't claim Android was tested.
- **Always flag the drift.** Any decision that would look or behave wrong on
  Android gets called out explicitly in your output, in an **Android parity**
  note: what will differ, and what the fix would be when Android becomes real
  work. One short note per divergence, not a disclaimer paragraph.

The parity notes are the whole point of "acknowledged" — they are the record
that turns an Android port from an archaeology project into a checklist. See
`mobile-design/references/platform-differences.md` for what actually differs.

## House rule 2 — the verification loop

**There is no local iOS simulator here.** The primary machine is Windows: no
Xcode, no `expo run:ios`, no local `.ipa`. Plan around it instead of
discovering it mid-task.

- **Quick look** → **Expo Go** on a physical iPhone. Fine for layout,
  navigation, styling, anything using only SDK-included modules.
- **Anything with a custom native module or a config plugin** → a **dev
  client** built by **EAS Build** (`eas build --profile development --platform
  ios`), installed on that same physical iPhone. There is no local compile
  path.
- **Definition of done for anything visual is the physical iPhone.** Not a web
  preview, not a screenshot of a component in isolation, not "it compiles".
  Gestures, haptics, scroll physics, safe areas, and blur all lie everywhere
  except a real device.
- **You cannot see the device.** So when a change needs visual confirmation,
  say precisely what to look at — the screen, the interaction, and the specific
  thing that should be true — rather than asking "does it look right?".
- Web output (`expo start --web`) is for logic and data-layer checks only.
  Never accept it as evidence that something looks or feels correct.

A cloud simulator is available via the `eas-simulator` skill (paid EAS service)
if agent-driven screenshots are ever worth the cost. It is not the default and
does not replace the device gate.

## House rule 3 — stack defaults

Appelent defaults for a new mobile app. **If the repo already does something
else, follow the repo** — this section is a starting point, never a reason to
migrate working code.

| Concern | Default | Notes |
|---|---|---|
| Framework | Expo (managed), Expo Router | `npx create-expo-app@latest`; layout per `expo-project-structure` |
| Auth | Clerk | the installed `clerk` plugin has Expo-specific patterns — route there |
| Data / backend | Convex | matches the web apps; React Query only when talking to a REST API instead |
| Package manager | pnpm | but install Expo packages with `npx expo install`, never `pnpm add`, so SDK-compatible versions are picked |
| Lint / format | Biome | |
| Builds & release | EAS Build / EAS Submit | via `eas-app-stores` |
| Styling | decide in phase 1 | NativeWind and StyleSheet are both fine; `expo-tailwind-setup` covers the former |

Outside this table, stay generic. This skill should still be useful on a
project that shares none of these choices.

## Reporting

When the work is done, structure the report as:

1. What changed, in one or two lines.
2. **Android parity** — the divergence notes from house rule 1, if any.
3. **Verify on device** — exactly what to open and what should be true.

Skip any section that is genuinely empty. Don't pad it.

## Sources

The judgment in `mobile-design` and the checklist in `mobile-rules` are
distilled from public work — see the `## Sources` section in each of those
files for attribution. Expo mechanics are never restated here; they come from
the official `expo-*` / `eas-*` skills at whatever version is installed.

## Self-improvement

Once the work is reported, follow the reflection in
`../mobile/references/self-improvement.md` — notice what was unclear or
underspecified about *this skill's own routing*, not about the app you built or
the leaf skill you followed. Routing failures are the ones worth catching here:
a phase that didn't fit, a precedence conflict this file doesn't resolve, a
request whose phase was genuinely ambiguous. Nothing noteworthy is the normal
outcome — say nothing then.
