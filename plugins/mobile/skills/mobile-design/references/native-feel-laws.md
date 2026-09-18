# Native feel

The rules that separate an app that *is* iOS from an app that merely runs on
it. Motion has its own file (`motion.md`); this covers surfaces, navigation
semantics, and the discipline that keeps a generated screen from looking
generated.

## Native fidelity

**Use the platform's controls.** Switch, slider, segmented control, context
menu, date picker, share sheet, photo picker, in-app browser: use the real
control or a faithful native wrapper. A rebuilt toggle that animates 50ms
differently than the system's reads as fake instantly, and users can't say why.

If you do rebuild one, **match the OS's numbers rather than your instincts** —
the iOS switch thumb travels ~22pt in ~0.2s with a slight squish and a haptic
on toggle; a selection cell fades and scales its checkmark in while the row
flashes the selection color for ~150ms. And emit the haptic the real control
would.

**Semantic color tokens, three appearance contexts, day one.** Use the
platform's semantic tokens rather than hardcoded hex (see
`platform-differences.md` for the mechanism). Apple's iOS foreground set is
`label` / `secondaryLabel` / `tertiaryLabel` / `quaternaryLabel`,
`placeholderText`, `separator`, `link`; backgrounds come in two families —
**system** and **grouped** — each with primary, secondary and tertiary variants,
meaning the overall view, groups within it, and groups nested inside those.

Three rules Apple states directly:

- **Never hardcode the published RGB values.** They are documentation, and Apple
  says they may fluctuate between releases. Go through the color APIs.
- **Never repurpose a semantic color** — the separator color is not a text
  color, `secondaryLabel` is not a background.
- **Light, dark, and Increased Contrast** must all work. A custom color needs a
  light variant, a dark variant, *and* an increased-contrast option for each.

A screen without a dark-mode pass is not done — not "done, dark mode later".

One implementation trap: **never pass a semantic color object into an animated
style** — resolve it to a plain string first.

**One icon family.** The system set (SF Symbols on iOS) inherits weight, optical
size and Dynamic Type for free. Three icon families on one screen is a tell.

**Continuous corners on every rounded rectangle.** Squircles are the cheapest
"feels iOS" win available.

**One elevation system.** Shadows encode elevation logic, not decoration.

**One spacing rhythm.** Pick a base unit (4 or 8) and never leave it. Prefer
`gap` over stacked margins. Scroll padding belongs on the content container,
never the scroller.

**Safe areas are part of the design.** Verify content scrolling *under* the
Dynamic Island — does the blur or fade treatment hold? — the bottom CTA
clearing the home indicator, and landscape if you support it. Never hardcode
notch numbers; never read a static screen dimension; read live dimensions.

**Titles belong to the navigator.** Use the stack's native title and its native
large-title collapse (~0→52pt of scroll on iOS) rather than a hand-rolled
header.

**Content under translucent chrome gets a fade or blur mask**, never a hard clip
or a 1px divider. Nav bars, toolbars and sheets are translucent layers with
content moving underneath, not opaque strips. **Never stack a light translucent
surface on another** — legibility collapses. Bigger surfaces read as thicker:
stronger blur, deeper shadow.

**Liquid Glass is the current system (iOS 26), and it is layered.** Apple models
two layers: a **functional layer** — tab bars, sidebars, toolbars — rendered in
Liquid Glass and floating above a **content layer**.

- **Do not use Liquid Glass in the content layer.** The only exceptions are
  transient interactive elements such as sliders and toggles, and even on custom
  controls it should be sparing. Glass on every card is the single most common
  misreading of this design language — and it is also on the anti-slop ban list
  below, which is not a coincidence.
- Two variants: **Regular** (the default; for text-heavy components like alerts,
  sidebars and popovers — it adapts luminosity to keep text legible) and
  **Clear** (only over photo or video, highly translucent). When using Clear
  over a bright background, Apple suggests a **35% dark dimming layer**
  underneath.
- **Standard materials stay in the content layer**, chosen by semantic meaning
  rather than apparent color: `ultraThin`, `thin`, `regular`, `thick`. Thicker
  material gives better contrast for fine text; thinner gives more context.
- Vibrancy has levels too — **avoid the quaternary label level on `ultraThin` or
  `thin`**.
- The iOS 26 tab bar floats and **minimizes on scroll**, and corner radii are
  **concentric** with the enclosing shape rather than uniform.

Note that Apple's Navigation Bars page no longer exists — it merged into
Toolbars in mid-2025. If you're working from an older mental model of that page,
it's stale.

**Dim to focus, separate to keep flow.** A blocking modal task pairs its surface
with a dimming scrim and pushes the background back. A parallel, non-blocking
panel uses translucency and offset *without* a scrim. Stacked sheets
progressively dim and push back each parent layer.

**Vibrancy over flat grey text** on translucent surfaces: higher contrast,
slightly heavier weight, a small letter-spacing bump. Put color on a solid
layer, never on the translucent foreground.

**Tap targets: build to 44×44pt.** Apple's Accessibility page names 44×44pt as
the default and 28×28pt as the absolute floor — the floor is not a target, and
the Buttons page states a flat 44pt minimum hit region regardless. Android wants
**48dp**, so size any shared component to 48: it satisfies both, and a 44pt
target ported straight across is 4dp short. If the visual is smaller than the
target, extend the hit area — never grow the visual. Allow ~10px of press
retention: a finger drifting a few pixels must not cancel a press the user
meant.

Apple also specifies the space *around* controls: roughly **12pt of padding for
bezeled elements, 24pt around the visible edges of unbezeled ones**.

**Contrast, as Apple states it** (these are the WCAG AA numbers):

| Text | Minimum ratio |
|---|---|
| Up to 17pt, any weight | **4.5:1** |
| 18pt, any weight | **3:1** |
| Any size at bold weight | **3:1** |

And **support at least 200% text enlargement**. Never convey information by
color alone — pair it with a label or a glyph shape.

One thing not to cite: **the HIG publishes no numeric iOS content margin.** The
16pt/20pt gutters everyone quotes are UIKit layout-margin behavior, not a stated
Apple number. Use the system margins; don't attribute a figure to the HIG.

**Ergonomics.** Put controls in the middle and bottom of the display where they
are reachable. Support the swipe-from-edge back gesture. Support swipe actions
on list rows. Avoid full-bleed edge-to-edge buttons — inset them from the screen
edges.

**Format numbers like a product, not a database.** 1.4M, 38k, $4.99, trailing
zeros trimmed, dates localized. Tabular figures for anything that counts, times,
or prices. Text is selectable wherever a user would plausibly want to copy it.

**Buttons.** Four roles: normal, **primary** (the default or most likely
choice), **cancel**, **destructive** (system red). Keep prominent buttons to
**1–2 per view**, and distinguish the preferred option by *style*, never by
size. **Never give a destructive action the primary role.** Any action that
doesn't complete instantly shows an activity indicator, and may swap its label
while running ("Checkout" → "Checking out…"). Labels **start with a verb** —
"Add to Cart", not "Cart".

**Forms.** Labels above fields, never placeholder-as-label. Correct keyboard
type, autocomplete and content type on every input (OTP fields declared as
such). Return-key chaining, with the final field submitting. **Validate on blur
or submit, never on keystroke.** Errors sit beneath the field in the platform's
error color and stay until fixed.

**Bottom sheets.** Detents are content-derived or the platform set (medium /
large) — arbitrary 37%/63% detents feel arbitrary. The backdrop fades in with
sheet position, dims to roughly 40%, and taps to dismiss. The sheet's drag must
hand off to inner scrolling correctly. **Test every sheet with the keyboard up**
— half the bottom-sheet bugs in the wild are keyboard interactions.

**Tab bars.** 3–5 items, filled icon variant for the active tab, labels always
on. Icon-only tab bars fail recognition tests.

**The iOS swipe-back must always work.** Never block the interactive pop
gesture.

## Typography and color

**Use the platform type ramp** — Large Title, Title, Headline, Body, Footnote.
One display size per screen.

**Tracking is size-specific.** Large display text wants *negative* tracking
(~-0.02em); small text wants slightly positive. A single fixed letter-spacing
value is wrong somewhere by definition.

**Leading tracks size inversely** — tight on large headings, looser on body.

**Build hierarchy from weight + size + leading as a set**, not size alone.
Weight adds presence without taking more space.

**Respect the user's text-size setting and scale layout with it** — relative
spacing, not fixed pixels. Verify at Dynamic Type XL; never animate to a
hardcoded height, because any height measured at default type size is wrong at
200%.

**Default to the system font** before any custom face. It already ships optical
sizing, tracking tables and legibility tuning. Override only with a reason.

## Navigation semantics

The sharpest and most durable material here, and the part a screenshot can't
show. Users feel it in ten seconds.

**Every transition answers three questions:** what is the destination *to* this
screen, must the user be able to come back, and what does back do afterwards —
chevron, iOS edge swipe, and Android system back.

### Push vs replace

**Push goes deeper. Replace moves on.** Push when the user will want to return.
Replace when coming back would land them in a state the world has moved past.
For "finish this flow and land on X", dismiss to a destination rather than
stacking.

> **Back undoes *navigation*, never *events*.** Back must never un-purchase,
> un-submit, or un-send.

### Presentation is meaning

| The thing | The presentation |
|---|---|
| Self-contained task with steps | **Modal** with its own stack and its own Cancel/Done |
| Short interruption — picker, filters, item options | **Sheet with detents**, drag to dismiss |
| Immersive content | **Full-screen modal** with an explicit Close |
| Something floating over a still-visible screen — confirm card, lightbox, coach mark | **Transparent overlay** |
| Destructive confirmation | **Action sheet** |
| Item actions — rename, share, delete | **Native context menu**, anchored to the element, destructive item flagged and followed by a confirm. Never a bare tap-to-delete |
| Share, web, photo picking | **The system controller.** Never a rebuilt route |

Two tests that settle most arguments:

- **"A sheet that grows a second step was a modal all along."**
- **"If a link could open it, it's a route, not a `useState` sheet."**

Don't put a back-navigable flow more than two steps deep inside a modal — give
the modal its own stack with its own header instead.

**Apple's own justification test**, which the table above operationalizes:
modality is warranted only to deliver critical information needing action, to
confirm or modify the most recent action, to run a **distinct, narrowly scoped**
task without losing context, or to create focus. Present modally only when
there's a clear benefit.

Their warning sign is the sharpest line on the subject: **"avoid creating a
modal experience that feels like an app within your app."** If the modal grows
its own navigation hierarchy, it should have been a push.

Sheet mechanics Apple specifies:

- **Detents**: `large` is the full expanded height and is supported
  automatically; `medium` is roughly half and is optional. Use medium for
  progressive disclosure (a share sheet); skip it when the content is more
  useful at full height (a compose screen).
- **Show the grabber on resizable sheets** — it signals draggability, cycles
  detents on tap, and works with VoiceOver.
- **One sheet at a time.** If a sheet must present another, dismiss the first,
  present the second, and optionally restore the first afterwards.
- **Always give an obvious dismissal** following platform convention: on iOS a
  button in the top toolbar *plus* swipe-down. Confirm before closing when data
  would be lost.

On "when back must not exist": Apple states no such rule explicitly. What it
does state is that modals are *dismissed*, not popped, and that the back button
retraces a *hierarchy*. The inference — which is what the one-way-door section
below acts on — is that a task which must not be backed out of mid-way (auth,
checkout, capture, a multi-step edit) belongs in a modal rather than on the
navigation stack.

### One-way doors

**Some doors close behind you.** Sign-in on a wall app, completed onboarding
(including Skip), a purchase, a finished session: guard the route and land with
a replace, so back can never re-enter the old state. Android back from home
exits the app; it never shows Login again. A paid paywall never reopens.

**But keep the user's place.** This is the counter-rule that makes the above
usable, and the one most often missed:

- Sign-in demanded by a specific action (save, follow, buy) is a **modal over
  the screen**, and it completes that action right where it was tapped.
- A paywall opened from a feature dismisses **back onto that feature, now
  unlocked** — never by replacing the stack with the app root.

**Back is blocked in exactly two cases:** an irreversible request in flight
(seconds only, with visible progress), and unsaved work in a modal (ask first).
Both belong on the modal's root screen. **Anything else that traps back is a
defect** — a funnel, a rating prompt. The edge swipe works everywhere else and
users know it.

**Transient in-screen state consumes exactly one back press, then back leaves.**
Selection mode, an expanded search field, an open in-screen sheet.

### Tabs, deep links, cold start

**Tabs are peers.** No sliding between them. Each keeps its own stack.
Re-tapping the active tab pops to its root. Full-attention screens — composer,
player, checkout — live in the root stack *above* the tabs, not inside one.

**Deep links land with a real stack underneath.** A deep-linked detail screen
needs a plausible parent to go back to.

**Cold start lands by state**, with the splash held until session state
resolves. Never a Login flash before Home.

**Rapid double-taps must not double-navigate or double-submit.**

### Spatial consistency

**Things leave the way they came in.** A panel that slides in from the right
dismisses to the right. In from the right, out the bottom feels disconnected.
Content slides one way going forward and the opposite going back, so navigation
has a direction.

**Anchor interactions to their source.** A menu, popover or sheet originates
from the element that triggered it — the transform origin is the trigger, not
the element's own center. Centered modals are the one exemption: they anchor
nowhere, so they stay centered.

### Wayfinding

Every screen answers four questions: **Where am I? Where can I go? What's there?
How do I get out?** Never trap the user.

**Direct, specific labels beat safe generic ones.** Name a nav item for its
contents — "Progress", "Library" — not "Home". Specificity creates
predictability.

**Grouping and mapping**: proximity implies relationship; put a control near
what it affects; arrange controls to mirror what they change. If you need a
label to explain a control, the mapping is weak.

**Feedback comes in four kinds** — status, completion, warning, error. Confirm
meaningful actions, expose ongoing status, warn before problems, validate
inline.

**Confirmation dialogs only for genuinely destructive, irreversible actions.**
Overusing them trains people to click through. Prefer easy undo for slips.

**Consistency is a hard constraint**: things that look the same must behave the
same and live in the same place. Break a familiar pattern only if you can prove
it's better — then test it, don't assume.

## Anti-slop

Each of these is a **default ban with an explicit override**: permitted only
when the product genuinely asks for the thing *and* you can articulate why it
fits.

**No AI-default styling.** Banned by name: purple/indigo gradient CTAs with a
glow, glassmorphism on every card, mesh-gradient heroes, confetti for minor
events, sparkles in headings. That's a model's house style, not design.

**Palette, materials and layout come from the references you studied**, never
from the priors you'd reach for unprompted.

**One accent, locked.** One accent color across every screen — no blue CTA on
one screen and teal on the next, no new hue appearing in screen seven. Neutrals
carry the app; the accent is spent where the money is: primary action, active
state, progress.

**One grey family.** Warm or cool — never both in one app.

**Shape lock.** One corner-radius scale, stated as an explicit rule ("actions
are pills, cards 16, inputs 8") and never violated. Mixed radii without a stated
rule read as assembled from parts.

**No emoji as iconography.** Emoji appear only when the product's voice is
genuinely chat-native or playful — sparingly, in content, **never in chrome**.

**One label per intent.** "Get started", "Start now" and "Begin" are the same
intent. Pick one.

**Emphasis stays in the typeface family.** Weight or italic of the same face.
Dropping a serif word into a sans headline is amateur.

**Ship full state cycles, not the happy path.** Static-successful-state-only is
the default failure mode. Skeletons match the final layout's shape; empty states
are composed and say how to fill them; errors are inline and specific.

### The pre-flight count

Before a flow goes for review, **count** — this is mechanical, not a judgement
call:

| Check | Must be |
|---|---|
| Distinct accent hues | **1** |
| Corner radii | all from the stated scale |
| Emoji in UI chrome | **0** |
| Gradients without a brand reason | **0** |
| Duplicate labels for one intent | **0** |

**A failed count is a fix, not a discussion.**

### Generated assets

One visual language per app: one style family, one palette, one lighting
description, **written down before generating anything**. A mixed-style asset
set reads as template slop.

Reject any asset that drifts in style, shows a halo or fringe at 400% zoom, has
baked-in text or watermark artifacts, fights the layout, or looks like
default-model clip-art with no art direction. Generate at ≥2× the largest
rendered size and never upscale; export @1x/@2x/@3x; verify in both themes. App
icon at 1024×1024, no transparency, no pre-rounded corners, checked at 60px.

## Study before you draw

**Never design a screen from imagination when you can study how good apps
solved the same screen.** Look at 10+ real reference screens for the screen type
before writing UI code.

**Extract the pattern, not the pixels**: the layout skeleton, the information
hierarchy, the control choices, the spacing rhythm, where the primary CTA sits,
what gets an illustration versus plain text, how progress is communicated. Note
what each step *is* — push, modal, sheet — and copy that consistency. Then
design *your* screen with the same proven skeleton and your product's voice.

Copying a competitor's screen 1:1 is lazy and legally risky. Shipping a screen
that ignores every convention users already know is worse.

## Simplicity, delight, and care

**Simplicity is not minimalism.** Burying everything in one place looks minimal
but isn't simple. Show the common path first, advanced options one level
deeper. Sometimes *adding* context simplifies — a scrubber showing time
remaining.

**Delight is what's left when everything else is right**, not confetti tacked
on top. Decide the emotion you want — calm, confident, excited — and reinforce
it in every decision.

**Nothing is random.** Every spacing, timing and alignment value is a choice you
can defend. Jittery scroll, misaligned icons and layouts that break on rotation
read as carelessness, because they are.

## Perceived performance

Perceived performance *is* performance, psychologically. A 180ms dropdown feels
more responsive than a 400ms one; ease-out at 200ms feels faster than ease-in at
the same duration, because movement is visible immediately.

- **Optimistic by default.** Taps reflect instantly, reconcile in the
  background, roll back loudly on failure.
- **Skeletons only when you know the shape**; otherwise progressive reveal.
  Never a full-screen spinner for a partial update. Skeletons match the final
  layout.
- **Preload the next screen's data on press-in**, not on navigation-complete.
- **Server state in a caching query layer**, never effect-plus-fetch. Client
  state in a small store; broad app-wide contexts cause the re-render cascades
  that make a UI feel heavy. Ephemeral UI state (open/closed, focus, scroll)
  stays local to the component.
- **Uncontrolled text inputs for high-frequency typing surfaces** — controlled
  inputs are a leading cause of typing jank. Commit on submit or debounce.
- **Every list that can grow is virtualized**, with stable keys. This single
  change fixes more jank than everything else combined.
- **Defer everything not needed for first paint** — heavy SDK init, analytics,
  below-the-fold data. Barrel imports are the classic silent bloat.
- **Never allocate inside an animation worklet's hot path.**
- **Heavy screens committed during a transition stall the main thread** and
  hitch even off-main-thread animation. Defer the destination's expensive work
  until the transition finishes.
- **Growing memory while navigating back and forth is a JS leak** — retained
  listeners, intervals, un-cleaned subscriptions. Hunt that before blaming
  native.

**Measure, optimize, re-measure. Never optimize on vibes.** No memoization
without profiler evidence of wasted renders; no risk flagged without a repro.
No number, no claim.

Budgets worth holding to: 60fps with no dropped frames in the hero flow;
cold-start to interactive under 2s on a mid-tier device; keystroke to echo under
50ms; no blank cells at fling speed; investigate any 10% jump in bundle size.

**Judge feel on a release build on the slowest device you support.** Dev builds
and Expo Go hide exactly the jank you're hunting.
