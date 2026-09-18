# Product and flow decisions

What goes on the screen, in what order, and why — decided **before** any
styling. Structure first, visuals second, emotion third. The ordering is the
argument: a beautiful screen in the wrong place in the wrong flow is wasted
work.

## Three questions before any pixels

1. What is the user actually trying to get done here?
2. How should this screen make them feel?
3. What is the single element they should see first?

If you can't answer all three, you're not ready to design the screen — you're
ready to ask about it.

## Step 1 — Context

Decide, explicitly:

- **The vertical.** Fitness, finance, social, productivity, health, crypto,
  education, commerce. This is load-bearing — it selects the visual language
  (below).
- **The user stage you're designing for.** New, returning, or power. Not an
  afterthought: it changes what belongs on the screen.
- **The one primary action** of this screen.
- **Which platform conventions apply** — see `platform-differences.md`.

## Step 2 — Structure (the UX lens)

Design the *flow*, not the screen:

- **What precedes and what follows.** A screen is a node in a graph, never a
  standalone artifact. If you don't know its neighbours, you can't design its
  exits — and exits are where navigation semantics live (`native-feel-laws.md`).
- **Strip to the MVP element set.** Only what this screen genuinely needs.
- **Put the primary action in the thumb zone** — the bottom third. This is
  well-grounded in one-handed-use research and is why both platforms anchor
  navigation at the bottom.
- **Interaction cost is real but it's a trade-off, not a rule.** Exposing
  content directly beats hiding it behind a tap *when the content is common*.
  For rare or advanced content, progressive disclosure wins — the cognitive-load
  argument is just as well-supported. Decide per case; don't apply "never hide
  anything" mechanically.
- **Empty states are a design surface**, not a failure case. Guidance,
  something to look at, and a call to action.
- **Choose the input method deliberately.** Sliders and wheels are for one-time
  setup where approximate is fine. Text fields are for repeated or precise
  entry. A slider for frequent precise input is a genuine anti-pattern.

## Step 3 — Visual design (the UI lens)

In this order:

**Typography.** One family (two at most, with a clear division of labour). At
most **4 sizes and 2 weights**. Monospace or tabular figures for large numerals
— prices, stats, metrics. Build hierarchy from size + weight + *opacity*, not
by bolding everything. These are craft constraints rather than empirical
findings, and that's exactly why they work: nobody has shown 4 sizes beats 5,
but a screen with 9 sizes is always worse than one with 4.

**Color, via 60/30/10.** 60% neutral ground, 30% complementary (usually the
dark text and elements), 10% accent reserved for CTAs and key indicators. Text
hierarchy comes from opacity steps of the neutral — roughly 100% headings, 80%
body, 60–70% secondary. The accent at very low opacity does duty for secondary
buttons and subtle card fills. Strong colors, red especially, are rationed for
moments that mean something; spending them everywhere destroys hierarchy.

On native, prefer the platform's semantic tokens over hand-picked hex wherever
one exists — see `platform-differences.md`. The 60/30/10 split is about
*proportion*, and it survives a semantic palette fine.

**Spacing, on a base unit.** Every value on the 4/8 grid: 8, 12, 16, 24, 32,
48, 64. Spacing is **relationship-based** — related things closer, unrelated
things further. The multiplier: if items inside a group sit 16 apart, the gap
to the next group is roughly double. Card interior padding 24–32. Bigger type
demands bigger spacing.

**Shadows.** Always soft, never hard-edged, and tinted toward the background
hue rather than pure grey or black. (iOS technique — Android approximates it;
see `platform-differences.md`.)

**Imagery.** For representing people, the preference order is real avatar >
initials > generic icon. One consistent visual style app-wide — mixed stock
imagery is the fastest way to look assembled from parts.

## Step 4 — Emotion

Decide **which single moment is the peak** and **what the ending is**.

The peak-end rule — that an experience is remembered as its most intense moment
plus its final moment, with duration barely registering — is real and
replicated for short, contained episodes. Generalizing it to a multi-session
product journey is an extrapolation, not a finding. Treat it as a good
allocation heuristic rather than a law: it tells you where to spend a limited
polish budget, and that advice holds regardless.

- **Peak candidates**: completing the core task, hitting a milestone, finally
  finding the thing.
- **Peak treatments**: a considered micro-animation, meaningful feedback, a
  personalized artifact that assembles in front of the user. Note the delight
  budget lives in the rare-frequency tier only (`motion.md`) — a celebration
  the user sees forty times a day is not a peak, it's an obstacle.
- **Endings get closure**: a summary, progress affirmation, a reason to come
  back.
- **Reduce the negative peaks**: audit waits, errors and long forms. Treat an
  unavoidable delay as content rather than dead air.

**Motion reads as trust in high-stakes verticals** (finance, crypto, health).
Polish is credibility there, not decoration — which is a different argument
from delight, and a stronger one.

## Step 5 — Polish

The last 5%: micro-animations on state change, **tap targets ≥ 44×44pt (48dp on
Android)**, contrast checked in both themes, and **all four non-happy states
designed** — error, empty, loading, success. Shipping only the successful,
populated state is the default failure mode.

## Industry visual languages

Each category has a language users already expect. Matching it buys
familiarity; breaking it buys distinctiveness. Choose deliberately — the
mistake is drifting into a language by accident.

| Vertical | What users expect |
|---|---|
| AI / tech | Soft gradients, depth and glow, motion that reads as "intelligence" |
| Crypto / Web3 | Dark grounds, neon, bold geometric type, high contrast |
| Finance / banking | Blue-dominant, generous whitespace, conservative type; must read as safe |
| Health / wellness | Bright, approachable, anxiety-lowering; friendly illustration; gentle onboarding |
| Sleep / meditation | Purple and deep blue, minimal UI, soft low-contrast surfaces |
| Education | Bright playful palettes, character-driven personality |
| Fitness | Energetic color, bold type, visible momentum and progress |
| Productivity | Clean and dense but organized; strong grid; quick actions |
| Commerce / food | Strong product photography, prominent CTAs, explicit trust signals |

The useful split isn't the individual palettes, it's this: the **high-stakes**
verticals (finance, crypto, health) all converge on polish-as-credibility, and
the **engagement** verticals (education, fitness, wellness) all converge on
personality and visible progress.

## Patterns worth reaching for

- **Personalize by user stage.** New: simple welcome, guided setup, few
  options. Returning: routine-oriented, progress visible. Power: dense
  information, advanced controls.
- **Never ship a blank search screen.** Seed it with recent searches, trending,
  and personalized suggestions.
- **Status and tracking**: lead with a confident status sentence, humanize with
  photos and names, use a visual timeline rather than a list of dates.
- **Selection over manual input** for common values, with an "Other" escape
  hatch to free text.

## Psychology: what holds up and what doesn't

Worth being honest about, because several of these circulate as settled fact:

**Well-supported.** Peak-end and duration neglect (for short episodes). The
goal-gradient effect — effort increases as a goal nears, which is why streaks
and progress bars work. Endowed progress. Recognition over recall, and the
expectation that your app works like the other apps someone already uses. The
self-referential effect: identity-relevant information is better encoded and
more likely to be shared, which is why "you're a night owl who works best after
9pm" outperforms "you completed 25 tasks". Thumb-zone placement.

**Directionally true, overstated.** Consistency as a competitive moat —
habit and switching costs are real, but design consistency alone is a weak moat
next to network effects or data lock-in. "Emotional feedback beats functional
feedback" holds in learning and habit apps and is repeatedly *irritating* in
high-frequency utility contexts like banking or dev tools; the Nth cheerful
animation is a cost.

**Folk.** The F-pattern as a layout target — it came from desktop eye-tracking
of text pages, its own researchers describe it as a symptom of badly formatted
content, and it transfers poorly to card-based mobile UI. Don't design toward
it. Popular statistics attributing specific growth numbers to specific design
choices are narratives, not measured effects; the design advice can be good
while the citation is worthless.

**The omission worth naming.** Streaks, celebration loops and engagement
mechanics are the same machinery as engagement dark patterns. The technique is
neutral; the intent isn't. If a pattern's value accrues mainly to retention
metrics rather than to the user, say so out loud rather than shipping it as
"delight".

## Anti-patterns

- Reaching for gradients and blur you can't actually execute well.
- More than 4 sizes or 3 weights.
- Spacing values off the grid.
- Key content hidden behind a banner or an extra tap.
- CTAs outside the thumb zone.
- A generic empty state offering no guidance.
- Sliders for frequent or precise entry.
- Uniform visual weight — no hierarchy at all.
- Emphasizing the label over the value (making "Sales" bigger than the number).
- Pure grey or black shadows on a colored ground.
- Designing a screen without knowing the screens on either side of it.
- Letting a flow end with no closure.
- Leaving error, empty, loading or success states undesigned.
