# iOS vs Android

Under the iOS-first policy you design for iOS and never verify on Android — but
every divergence gets a parity note. This file is what those notes are made of:
what actually differs, and which lever handles it.

**Scope warning.** The *differences* are durable; the *API names* below drift
with every SDK. Treat the API column as a pointer, and let the `expo-*` skills
settle the current call signature. Where they disagree with this file, they win.

## Pick the lever in this order

1. **A component that already handles it.** React Navigation's native stack,
   safe-area-context, a keyboard controller, the Expo haptics/action-sheet
   modules. Most differences below are already solved by one of these — reaching
   for a manual branch first is the common mistake.
2. **`PlatformColor` / `DynamicColorIOS`** for anything color or theme related.
   Resolves a *native semantic token*, so light/dark, high-contrast and
   accessibility settings track the OS for free. Always wrap in a
   `Platform.select` with a literal fallback — an unresolvable name throws at
   runtime and it doesn't exist on web.
3. **`Platform.select`** for a single value or a few style props.
4. **`Foo.ios.tsx` / `Foo.android.tsx`** once the divergence is *structural* —
   different component tree, different imports, a different native module. Metro
   resolves it, so no runtime branch survives into the bundle.
5. A bare `Platform.OS === 'ios'` ternary only when nothing above fits.

Two traps in the `Platform` module itself: `Platform.Version` is an **integer
API level on Android** but a **string on iOS** (`"17.4"`), so iOS checks need
`parseInt`. And `Platform.select` can return lazily-required *components*, not
just values.

## Touch targets — the most common porting bug

iOS builds to **44×44pt**. Material requires **48×48dp** and says so explicitly
in reference to Apple's number. **A 44pt target ported straight across is 4dp
short on Android.**

Size any shared component to **48** — it satisfies both platforms and costs
nothing on iOS. Material also wants **≥8dp between targets**, and allows a 24dp
icon inside the 48dp target, the padding making up the difference.

## Navigation and back

| | iOS | Android |
|---|---|---|
| Going back | Left-edge swipe, plus chevron + previous screen's **title** | System back — gesture from either edge, or a button. Global, always present, exits the app from the root |
| Header back | Shows the previous title | Icon only, no label |
| Interruptibility | The swipe drags the previous screen in | Predictive back (Android 13+, opt-in; system animations automatic from 15) |

**The rule that matters:** never build a screen whose only exit is a header
button. On Android the user *will* press system back, and it must do something
sane. Cross-platform interception belongs in the navigation library's
`beforeRemove`/prevent-remove hook — it catches the iOS swipe too, which a raw
Android back-handler never will.

**Predictive back is the deepest structural delta**, and the one most likely to
break an iOS-first flow. iOS's back affordance is a visible button plus an
interactive edge swipe *on the navigation stack*. Android's is a **system
gesture present on every screen whether your design wants it or not**, and since
Android 13 it previews the destination behind the swipe — so the user can drag
partway and cancel, and your screen must handle that progressively.

The consequence for design: any iOS-first flow that assumes "there is no way
back from this screen" — an onboarding step, checkout, a modal with only a Done
button — **has no equivalent guarantee on Android**. It needs an explicit back
handler with a confirmation, not silence.

Predictive back is opt-in per app via a manifest flag, and the migration it
forces is real: intercepting the back key event or overriding the activity's
back handler is no longer supported. That's platform plumbing rather than design
work, but it's why "we'll do Android later" is more expensive here than
elsewhere.

`headerBackTitle`, `headerBackButtonDisplayMode`, `gestureEnabled` and
`fullScreenGestureEnabled` are **iOS-only** and silently ignored on Android.
Large titles have **no Android equivalent** — don't fake one.

**Parity note template:** *"Back from this screen: iOS uses the edge swipe;
Android's system back needs X. Root-screen back exits the app on Android."*

## Typography

| | iOS | Android |
|---|---|---|
| System face | SF Pro (variable optical size) | Roboto / Roboto Flex |
| Scaling | pt + Dynamic Type styles, user-scalable well past 100% | sp for text, dp for everything else |
| Weights | `fontWeight` works on the system font | **`fontWeight` on a custom family is unreliable** |
| Default body | 17pt | **16sp** |
| Tracking | not directly settable | explicit non-zero tracking per role |
| Roles | Large Title → Caption 2 | Display / Headline / Title / Body / Label, each in three sizes |

Material's scale is systematically smaller than Apple's and splits **brand**
(Display, Headline) from **plain** (Body, Label) typefaces — a distinction iOS
has no equivalent for.

**The i18n trap nobody covers:** Material scales line height by *script*, in
four categories — Latin and Cyrillic at the base, most scripts (Arabic, CJK,
Indic, Thai, Vietnamese) around +7%, Burmese and Telugu around +30%, Nastaliq
around +100%. **Fixed-height components are built for the smallest category and
overlap text in the others.** iOS does not have this failure mode in the same
form, so an iOS-first design with fixed-height rows will break on Android in
exactly the languages nobody tests.

The custom-font trap is the expensive one: on Android each weight must be
registered as **its own family** (`Inter-SemiBold`), selected by family name,
not by `fontWeight`. Load them that way from the start or the Android port is a
rewrite of every text style.

`allowFontScaling` **defaults to true** on both platforms — your layout is
already exposed to user font scaling. Don't disable it globally; cap it with
`maxFontSizeMultiplier` only where the text genuinely cannot reflow, and design
containers that grow. `includeFontPadding: false` is an Android-only prop that
removes extra ascender/descender padding, and is usually what you want when
matching an iOS design.

## Elevation and shadows

| | iOS | Android |
|---|---|---|
| Model | Artistic shadow — color, offset, opacity, radius, all yours | **Material elevation**: levels in dp; the tokens carry *no* shadow and *no* color, and the platform decides what to render |
| Depth is communicated by | The shadow | **Tonal surface color** first; shadow only when genuinely needed |
| Consequence | Purely visual | Changes stacking; a view with no background casts no shadow |

**This is the biggest visual-model gap between the platforms.** M3 explicitly
moved away from shadows-by-default: use a shadow only to protect against a
background or to encourage interaction. Components raise by exactly one level on
interaction, and you should avoid changing a component's default elevation.

**Porting rule: an iOS card with a soft shadow usually becomes a tonal
surface-container fill on Android, not a shadow.** Putting `elevation` on every
card is an iOS habit that reads as dated Material.

Three failures worth pre-empting: an Android shadow needs a **non-transparent
background** on the same view; `overflow: 'hidden'` on a shadowed view **kills
the iOS shadow** (shadow on an outer wrapper, clipping on an inner one); and
colored shadows are approximate on Android (honored only from API 28+). Modern
RN's cross-platform `boxShadow` is the cleanest path for new code.

The tinted-shadow advice in `product-flows.md` is an iOS technique. On Android,
step the tonal background instead — that's what Material 3 does anyway.

## Safe areas and system chrome

| | iOS | Android |
|---|---|---|
| Insets | Notch / Dynamic Island, home indicator, landscape side insets | Status bar (varies by OEM), nav bar (~48dp buttons *or* a slim gesture pill), punch-hole cutouts |
| Edge-to-edge | Long-standing safe-area concept | **Enforced** targeting SDK 35; the opt-out is gone targeting Android 16 |

Core `SafeAreaView` is deprecated and was iOS-only regardless — use
safe-area-context's insets hook and apply values selectively (bottom padding on
a scroll view's *content container*, not the outer container). Navigation
headers and tab bars already apply insets; **don't double-apply** around a
navigator.

Under enforced edge-to-edge, setting a status-bar or nav-bar **background color
is ineffective on Android**. If you need a colored bar area, draw your own view
of inset height behind the content.

**iOS safe-area insets and Android window insets are not the same concept.**
Android distinguishes three inset families — **system bars** (tappable views
must clear these), **display cutout** (notches, punch-holes), and **system
gestures**, which take priority over your app and have **no iOS analogue at
all**. A single hardcoded bottom padding cannot be correct on both.

Test on both a 3-button-nav and a gesture-nav Android device — the bottom insets
differ substantially on the same device. (Under the iOS-first policy this is a
parity note, not work you do now.)

## Scroll physics

| | iOS | Android |
|---|---|---|
| Past the end | Rubber-band bounce, content follows the finger | Stretch overscroll (Android 12+) |
| Tuning props | `bounces`, `decelerationRate`, `contentInset`, `scrollIndicatorInsets`, `contentInsetAdjustmentBehavior` — **all iOS-only** | `overScrollMode`, `nestedScrollEnabled`, `fadingEdgeLength` — **all Android-only** |

Each set is a **silent no-op on the other platform**. To suppress overscroll
everywhere you must set both.

Don't normalize the physics — users expect their own platform's feel, and
emulating iOS bounce on Android is a classic uncanny-valley mistake. Do
normalize the *visual consequence*: a colored header revealed by an iOS bounce
needs a backdrop that Android's stretch never exposes.

## Keyboard

| | iOS | Android |
|---|---|---|
| Events | `keyboardWillShow` fires **before** the animation, with duration and curve | Only `keyboardDidShow` — no advance notice |
| Window | Doesn't resize; the keyboard overlays | `windowSoftInputMode` decides: resize or pan |

This asymmetry is why hand-rolled keyboard avoidance always looks worse on one
platform. A keyboard-controller library that synthesizes iOS-style progress
values on Android is the right answer rather than branching `behavior` by hand.
If you do use the core avoiding view, its `keyboardVerticalOffset` must equal
the header height — omitting that is the single most common bug in the area.
Set `keyboardShouldPersistTaps="handled"` on scroll views or Android eats the
first tap.

## Modals, sheets, alerts

| | iOS | Android |
|---|---|---|
| Sheets | Rich vocabulary: page sheet, form sheet, full-screen, transparent; detents, grabber, expand-on-scroll | Material bottom sheet with a drag handle; full-screen dialogs for complex tasks |
| Dismissal | Swipe down | **System back always dismisses** |
| Alerts | Centered; `cancel` / `destructive` button styles; destructive renders red | Material dialog; **button order is reversed**; tapping outside dismisses by default |
| Action sheet | A real system component | No equivalent — the idiom is a bottom sheet list |
| Transient | Nothing system-level; you build a toast | `ToastAndroid` is a system primitive |

**Never hand-order alert buttons.** Declare `cancel`/`destructive` by style and
let each platform place them. When a choice is mandatory, pass
`{ cancelable: false }` — otherwise Android lets the user escape by tapping
outside.

**Every modal must be dismissable by Android system back.** Swipe-down as the
only exit is an iOS-only assumption.

## Press feedback

iOS dips opacity or highlights. Android uses a **state layer** — a
semi-transparent overlay in the content's "on" color, rippling from the touch
point, at fixed opacities: **hover 8%, focus 10%, pressed 10%, dragged 16%,
disabled 38%**. One state layer at a time; the layer is 40dp inside a 48dp
target.

**Shipping the same `activeOpacity` on both platforms is the tell of an
un-ported iOS app.**

`android_ripple` is ignored on iOS, so it needs no branch — but the opacity
change *does*, or Android gets both effects at once and looks wrong. Feed the
ripple a `PlatformColor` and it tracks light/dark automatically. Use
`foreground: true` when the child has its own background, `borderless: true` for
icon buttons.

Pair this with the press-feedback split in `motion.md`: scale on buttons and
cards, background highlight on list rows, opacity on bar buttons — the row rule
and Android's ripple agree, which is not a coincidence.

## Haptics

iOS has the Taptic Engine — rich, precise, and silenced by Low Power Mode, the
system haptics setting, and during camera or dictation use. Android motor
quality varies enormously by device, and some OEMs effectively no-op.

**Every haptic is best-effort and never load-bearing.** Bias toward *fewer* on
Android, where a coarse motor makes repeated buzzes read as malfunction rather
than polish.

## Pickers, sharing, permissions

**Date/time pickers** are the sharpest structural split: iOS is a **component
you render and control**; Android is a **system dialog you open imperatively**.
Two genuinely different shapes — this is the textbook case for `.ios.tsx` /
`.android.tsx` rather than a `Platform.select`. iOS also offers a combined
datetime mode where Android needs date-then-time chained.

**Share sheet:** the Android result **always** reports "shared" — you cannot
tell whether the user actually shared or cancelled, so never branch logic on it.
`url` is first-class on iOS and effectively appended to the message on Android.
On iPad, always supply the anchor or the sheet mispositions or crashes.

**Permissions** differ in the way that most affects design, not code: **iOS
gives you exactly one prompt ever.** Once denied, only Settings can undo it.
Android can re-prompt until the system decides otherwise. So: always show your
own priming screen explaining the value *before* triggering the system dialog,
and only trigger it at the moment of genuine need. Branch on the permission
object's `canAskAgain` to choose between prompting and deep-linking to settings.

iOS requires usage-description strings in `Info.plist` — a missing one is both a
runtime crash and an App Store rejection.

## Smaller divergences worth knowing

- **Text input**: `textContentType` (iOS) and `autoComplete` (Android) are
  separate props and **both** are needed for password managers and OTP autofill.
- **SF Symbols are iOS-only** and licensed for Apple platforms. Use the symbols
  module on iOS with a vector-icon fallback on Android — never ship SF Symbols
  as images.
- **`overflow: 'visible'` is unreliable on Android** — children get clipped to
  parent bounds. Any design where a badge or shadow escapes its container needs
  a different structure.
- **`elevation` can override `zIndex`** on Android. Sibling order plus elevation
  beats `zIndex` alone.
- **Backing out of the root screen exits the app** on Android. Decide
  deliberately whether to intercept ("press back again to exit") or allow it.
  No iOS analogue.
- **Android destroys and restores activities** far more aggressively than iOS
  suspends. Anything held only in memory can vanish.
- **Deep links**: Universal Links need an `apple-app-site-association` file and
  the associated-domains entitlement; App Links need `assetlinks.json` and
  verified intent filters. Per-platform infrastructure either way.
- **Header treatment**: iOS uses a hairline plus blur, Android uses elevation or
  a tonal surface. Blur effects and large titles are iOS-only options.

## Tab bar vs navigation bar

Both are bottom-anchored, and on both, re-tapping the active tab pops to root.
Beyond that they diverge more than they look:

| | iOS | Android |
|---|---|---|
| Count | 2–5, with an automatic "More" overflow | **Hard 3–5.** Under 3 → use tabs instead. Over 5 → not a nav bar at all. **No "More" equivalent — the overflow is your design decision** |
| Labels | may ship icon-only | **Mandatory.** "Don't remove the labels" |
| Active state | filled icon variant | **Active indicator pill** plus filled icon; only one at a time; ≥3:1 icon contrast |
| Shape | iOS 26: floating, inset, glass, minimizes on scroll | **Full-width, flush to the bottom.** Porting the iOS floating pill to Android is off-spec |
| Wide screens | same tab bar on iPad | **Must become a navigation rail at ≥840dp** |
| Back | — | system back returns to the start destination |

A native tab implementation gives you real platform chrome — blur and
minimize-on-scroll on iOS, the M3 indicator on Android — instead of a JS
re-creation of both. Prefer it.

## Motion values

Both platforms have moved to springs, but they are **not the same springs**.
Material's transitions run noticeably longer and with more overshoot than
iOS's, and its spatial curves carry deliberate overshoot (y-values above 1).
Material publishes spring→cubic-bezier conversions specifically for non-Android
platforms, with spatial durations of 350/500/650–750ms against effects
durations of 150/200/300ms.

The practical consequence for an iOS-first app: **the motion vocabulary in
`motion.md` is Apple-flavoured** — sub-300ms, Apple's damping/response pairs.
That is correct for iOS and slightly brisk for Material. It's a parity note,
not something to split the difference on; splitting the difference gets you
motion that is native to neither.

Material's older easing-and-duration token system still exists but is
explicitly no longer maintained, so don't build a new Android theme on it.
