# Motion

Animation is the part of an app a screenshot cannot show and a user feels in
ten seconds. It is also where most effort is wasted: the majority of animations
in a typical app should not exist.

Work through this in order. Stopping at step 0 with zero lines of code is a
success, not a failure.

## Step 0 — Should this animate at all?

The frequency gate. How often does a user trigger this in a day?

| Frequency | Examples | Verdict |
|---|---|---|
| **100+ / day** | tab switches, keyboard open/close, scrolling, back navigation, list row taps | **The platform default and nothing else.** Never add motion here, never override what the OS already does. |
| **Tens / day** | press feedback, row selection, small state toggles | Near-imperceptible or nothing. Under 150ms if it exists at all. |
| **Occasional** | modals, sheets, drawers, toasts, settings, onboarding steps | Standard motion. This is where the work belongs. |
| **Rare / first-time** | onboarding, first success, empty states, celebration | The entire delight budget lives here. |

On iOS the top tier matters more than it looks: the system already *has* a
transition for most of these. "Platform default" means keep the system's, which
is not the same as removing motion.

When unsure whether an animation is right, **delete it** and look again.

## Step 1 — Name the purpose in one word

Feedback · continuity · state indication · preventing a jarring change ·
explanation · delight (rare tier only).

Can't name it in one word? Don't build it. "Looks cool" disqualifies anything
above the rare tier.

## Step 2 — Does it help or hinder?

Data the user is reading or acting on **never moves for style**. Decoration on
information-dense UI actively hinders — for a table of numbers or a balance
graph, no animation performs better than any animation.

## Step 3 — Pick the property

**`transform` and `opacity` only.** They skip layout and paint; layout
properties (`width`, `height`, `top`, `left`, margins, padding) re-run layout
for the node and its siblings every single frame.

One exception: an absolutely positioned element with no children — a tab pill,
a progress fill. It's out of flow, and animating its width preserves a corner
radius that a scale transform would smear.

Never animate a header's height; translate inside a fixed clip instead.

## Step 4 — Spring or timing?

> **If a finger was involved, it's a spring. Everything else is timing.**

Springs carry velocity through an interruption; timing curves restart from
zero. Any gesture-driven motion must be a spring for that reason alone.

## Step 5 — Values

### Springs

Reason in Apple's two designer parameters — **damping ratio** and **response**
— not mass/stiffness/damping.

| Interaction | Damping ratio | Response | Status |
|---|---|---|---|
| Move / reposition | 1.0 | 0.4s | Apple's shipped values |
| Rotation | 0.8 | 0.4s | Apple's shipped values |
| Drawer / sheet | 0.8 | 0.3s | Apple's shipped values |
| Default UI settle | 1.0 | 0.3–0.4s | house default |
| Momentum / flick | ~0.8 | 0.3–0.4s | house default |

Define exactly two named springs for the whole app and import them everywhere:

- **SNAP** — `{ duration: 400, dampingRatio: 1 }`. The default. No overshoot.
- **POP** — `{ duration: 400, dampingRatio: 0.8 }`. Overshoot. Reserved for
  momentum, celebration, and gesture release.

Clamp overshoot when the value must not pass a hard edge.

### Easing

Three curves. That is the whole vocabulary:

```
strong ease-out    cubic-bezier(0.23, 1, 0.32, 1)     ← the default
strong ease-in-out cubic-bezier(0.77, 0, 0.175, 1)    ← moving on screen
iOS sheet curve    cubic-bezier(0.32, 0.72, 0, 1)     ← sheets and drawers
```

Entering or exiting → ease-out. Moving or morphing on screen → ease-in-out.
Constant motion (marquee, indeterminate progress) → linear. Default →
ease-out.

**Never `ease-in` on UI.** It starts slow, delaying the exact moment the user
is watching — a 300ms ease-in dropdown feels slower than an ease-out one of
identical duration.

Built-in platform curves are too weak. Use the constants above.

### Durations

**Hard ceiling: UI motion stays under 300ms.**

| Element | Duration |
|---|---|
| Press feedback | 120–150ms |
| Toggle, chip, small state change | 150–200ms |
| Tab / segmented indicator | 250ms, ease-in-out |
| List entrance | 250ms, stagger 30–80ms, cap ~8 items |
| Toast | ≤300ms in, exit ~20% faster |
| Modal / sheet / drawer | spring, ~300ms perceived |
| Screen transition | the platform's. Never override. (iOS push ≈350ms) |

**Exits are faster than entrances** — roughly 0.7×. The user has already
decided; don't make them wait for the confirmation.

**Timing is asymmetric where the roles differ.** Slow where the user is
deciding, fast where the system responds: a hold-to-delete fills over 2s
linear, then snaps back in 200ms ease-out on release. Symmetric timing on a
press-and-hold is a bug, not a style.

### Other fixed numbers

- **Press scale 0.97** (range 0.95–0.98). But see the surface split below.
- **Entrance from `scale(0.95)` + `opacity: 0`. Never `scale(0)`** — nothing in
  the real world appears from nothing.
- **Stagger 30–80ms** between items, capped at ~8; beyond that, enter as a
  block. Stagger is decorative and must never delay interaction.
- **Dismissal threshold**: past ~30–40% of the sheet's height **or** velocity
  above ~800 — whichever comes first.
- **Rubber-band resistance**: `(overshoot × dimension × 0.55) / (dimension +
  0.55 × |overshoot|)`. The 0.55 is iOS's constant.
- **Momentum projection**: `projected = current + (v / 1000) × d / (1 − d)`,
  with `d ≈ 0.998` for normal scroll feel, `0.99` for snappier. This is Apple's
  shipped function — the physics-textbook `v²/(2·decel)` is *not* what iOS
  uses.
- **Gesture hysteresis**: ~10px of movement before committing to a direction.
- **ProMotion**: the frame budget is **8ms**, not 16ms, once the 60fps cap is
  lifted.

### Press feedback by surface

The one place a single rule gets it wrong. Differentiate:

| Surface | Feedback |
|---|---|
| Buttons, cards | scale 0.97 |
| List rows | **background highlight, never scale** |
| Bar buttons (nav, toolbar) | opacity |

Scaling a list row is the tell that a screen was built by someone who doesn't
use iOS.

**Feedback fires on press-in; the action commits on press-out.** Waiting for
the tap to complete before showing anything feels dead — press-in latency is
the latency users actually perceive.

## Step 6 — Gestures and interruptibility

Interruptibility is the single most important principle in the whole document:
the thought and the gesture happen in parallel. **Never lock out input during a
transition.** A closing sheet the user grabs again follows the finger — it does
not finish closing and then reopen.

The full handoff sequence:

1. **On grab, capture the live presentation value**, never the logical target.
   Starting from the target causes a visible jump.
2. **Track 1:1, preserving the grab offset.** Snapping the element's center to
   the finger breaks the illusion instantly.
3. **Hold pointer capture** so tracking survives the finger leaving the
   element's bounds, and **ignore additional touch points** once a drag has
   begun.
4. **Rubber-band past boundaries** with rising resistance. A hard stop reads as
   frozen; continuous resistance reads as "responsive, but there's nothing
   more here."
5. **On release, project the resting point from velocity** and snap to the
   target nearest the *projection*, not the release point.
6. **Hand the release velocity into the spring**, so the animation continues at
   the finger's exact speed. This is the detail that most separates "fluid"
   from "fine."
7. **Commit on distance OR velocity, never distance alone.** A fast flick from
   10px away must dismiss.
8. **Stay grabbable mid-flight**, and on a reversal **blend velocity** rather
   than hard-cutting it — a velocity discontinuity reads as a brick wall.
9. **Split 2D motion into independent per-axis springs.** One spring over a 2D
   distance desyncs when X and Y carry different velocities.
10. **Detect plausible gestures in parallel from the first move**, then cancel
    the losers once intent is clear. Recognizers that only report a final state
    throw away the continuous tracking you need for feedback.
11. **Hint in the direction of the gesture** — intermediate frames should
    telegraph the outcome, not blindly interpolate toward it.
12. **Bounce only when the gesture carried momentum.** Overshoot on a menu that
    just faded in feels wrong; overshoot on a card you flicked feels right.

Interruptible mechanisms only: springs and transitions retarget from the
current state; keyframes restart from zero. Keyframes are acceptable **only**
for motion nothing can interrupt — a loop, an indeterminate progress
indicator, a mount-time animation with no state behind it.

## Step 7 — Reduced motion, shipped with the animation

Not a follow-up task. Reduced motion means **fewer and gentler, not zero**.
Apple's own instruction is specific: cut automatic and repetitive animation,
**tighten springs**, avoid z-axis depth changes, and **replace x/y/z-axis
transitions with fades**.

- Spatial motion (translate, scale, parallax, overshoot) → collapses to a
  cross-fade.
- Opacity and color changes that *explain* a state change → keep them.
- Native screen transitions → stay the system's; the OS already honors the
  setting.

Two adjacent accessibility settings deserve the same treatment: **reduced
transparency** (raise background opacity, drop the blur) and **increased
contrast** (near-solid backgrounds with a defined contrasting border).

Avoid full-viewport moving backgrounds, slow looping oscillations near 0.2 Hz
(one cycle per five seconds — a vestibular trigger), and abrupt brightness
jumps; ease dark↔light transitions.

## Haptics

Apple's vocabulary, with its documented meanings — **don't repurpose these**:

| Family | Values | Means |
|---|---|---|
| Notification | success, warning, error | the outcome of a task |
| Impact | light, medium, heavy, rigid, soft | a physical metaphor — objects colliding, hard vs flexible |
| Selection | — | a control's value is changing |

Haptics are punctuation. Three absolute rules:

1. **Same frame as the visual.** A lagging haptic reads as a glitch, not as
   feedback.
2. **One per user action.** Never on scroll, never per frame, never in a loop,
   never on an entrance the user didn't cause.
3. **Never the only feedback.** Haptics are switched off system-wide by many
   users and are silent on most Android hardware. The visual must stand alone.

When rebuilding a native control, emit the haptic the real control would.

Two more from Apple: align haptic intensity with the accompanying animation and
sound, and note that **haptic vibration can disrupt the camera, gyroscope and
microphone** — don't fire them during capture.

## One vocabulary per app

Define SNAP, POP and the three curves once, as shared tokens, and import them.
Five hand-typed cubic-béziers that almost match is a defect, not a style.

Motion should match the product's personality — a playful app can be bouncier,
a professional tool stays crisp and fast — but the *vocabulary* stays one set.

## Reviewing motion

You cannot review animation from code, and screenshots prove nothing about it.

1. **Screen-record the whole flow** and exercise all of it: every transition,
   every back path, every present-drag-dismiss including cancel mid-drag, the
   keyboard in both directions, press states, interrupted gestures, rapid taps,
   scroll flings at both extremes.
2. **Watch it twice** — once at full speed for feel, once scrubbing frame by
   frame. Hunt for: dropped frames, one-frame flashes (unstyled first paint,
   wrong-theme frames mid-transition), layout jumps, double-render pops,
   springs clipping into content, elements that reflow after appearing.
3. **Slow-motion pass**: bump durations 2–5× and check four things — do colors
   crossfade cleanly or do two states overlap visibly; does the easing stop
   abruptly; is the transform origin right; are coordinated properties in sync.
4. **One glitchy frame means the flow is not done.**
5. **Judge on a release build on the slowest device you support.** Dev builds
   and Expo Go hide exactly the jank you're hunting.
6. **Review again the next day.** Fresh eyes find what fatigue hid.
7. **Never batch more than a few fixes between looks** — regressions hide in
   batches.

## Proposing animation work

When asked what to animate in an existing app: **5–7 suggestions maximum for a
whole app**, fewer for a single screen, ordered by leverage. Always include a
section naming 2–5 candidates you deliberately **rejected**, each with the gate
question that killed it. A list of everything that *could* animate is not a
recommendation.
