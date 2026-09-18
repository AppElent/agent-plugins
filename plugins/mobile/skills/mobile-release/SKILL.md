---
name: mobile-release
description: What must be true before an iOS app can be submitted — the App Review obligations that change what you build (account deletion, login-optional, Sign in with Apple, in-app purchase, purpose strings, privacy labels) and the account preconditions that block a first submission. Use when planning or building auth, paywalls, subscriptions, permissions or analytics; when preparing a first App Store submission or TestFlight build; when an app has been rejected and you need to know why; or when asked what Apple requires. For the commands that build, submit and manage versions, use `eas-app-stores`.
---

# mobile-release

App Review rejects apps for things that were decided months earlier. This skill
is about **what must already be true** by the time you submit — not how to
submit, which `eas-app-stores` owns and does well.

Two kinds of obligation, and the first kind is the expensive one:

1. **Build-time obligations** — features Apple requires your app to *have*.
   Discovering these at submission means shipping a feature under deadline.
2. **Account preconditions** — state across Apple's systems that must agree
   before any submit command works at all.

## Read this before you build auth, payments, or permissions

Not before you submit. These three decisions are the ones that get rebuilt:

- **Does the app require an account?**
- **Does anything cost money?**
- **Does the app ask for a permission or collect any data?**

Any "yes" pulls in obligations below that are architectural.

## Build-time obligations

### Accounts and login — 5.1.1(v), 4.8

| If | Then |
|---|---|
| The app supports account creation | **It must offer account deletion from inside the app.** Not a support email, not a web form. This is the single most commonly missed build-time requirement. |
| The app has no significant account-based features | **Let people use it without logging in.** A login wall in front of an app that doesn't need one is a rejection. |
| The app uses a third-party or social login (Google, Facebook, X, LinkedIn, Amazon, WeChat) to set up the user's primary account | **You must also offer an equivalent privacy-preserving option** — one that limits collection to name and email, lets the user keep their email private, and doesn't collect in-app interactions for advertising without consent. Sign in with Apple is the usual answer. |
| The app uses only your own account system | The 4.8 equivalence requirement does **not** apply. |

Apple also states you may not require personal information to function unless
it's directly relevant to core functionality or required by law.

**Design consequence:** account deletion is a real screen with a real
confirmation and a real backend path, and "delete my account" must not silently
mean "deactivate". Plan it with the auth work, not after.

### Money — 3.1.1

Unlocking features, content, subscriptions, or a full version **must use in-app
purchase**. You may not use your own mechanism — license keys, QR codes, crypto
wallets, or an external checkout — to unlock functionality in the app.

Two adjacent rules worth knowing: purchased credits and in-app currency **may
not expire**, and randomized-item purchases must disclose odds before purchase.

### Permissions and data — 5.1.1(i), 5.1.1(ii), 5.1.2, 2.5.14

- **Purpose strings must completely describe the use.** A vague string is a
  rejection, and it's also bad product design — see the priming-screen rule in
  `../mobile-design/references/platform-differences.md`, since iOS gives you
  exactly one prompt ever.
- **Paid functionality must not depend on the user granting data access.**
- **A privacy policy link is required in two places** — the App Store Connect
  metadata field *and* somewhere easily accessible inside the app. It must state
  what's collected and how, confirm equivalent protection by any third party you
  share with, and explain retention, deletion, and how consent is revoked.
- **Recording anything — camera, microphone, screen, user activity — needs
  explicit consent plus a clear visual or audible indicator while it happens.**
- **Data collected for one purpose may not be repurposed** without further
  consent.
- Sensitive-API data (HealthKit, HomeKit, ARKit/camera depth and face mapping,
  ClassKit) **may not be used for marketing, advertising, or data mining** — by
  you or a third party.

### Privacy labels — declared, and accurate

Before submission you declare, per data type: what is collected, the purpose,
whether it's **linked to the user's identity**, and whether it's used for
**tracking**.

Two traps:

- **You are responsible for data your third-party SDKs collect**, including when
  the SDK tracks and you don't. An analytics, ads, or social-login SDK you
  dropped in without reading is your declaration to make.
- **"Collect" means transmitted off device** and retained beyond servicing the
  request. On-device-only processing is not collection — which is worth knowing
  before over-declaring.

The declaration must match what the app actually does. Reviewers check this
against behavior, and it can be updated without resubmitting the binary.

### Being an actual app — 4.2

The guideline that catches quickly-built apps: it must include features,
content and UI that **elevate it beyond a repackaged website**. Not primarily
marketing material, a web clipping, a content aggregator, or a collection of
links. It must work **without requiring another app** to be installed, and if it
downloads resources on first launch it must disclose the size and prompt first.

If the honest answer to "what does this do that a bookmark doesn't" is thin,
that's a product problem to solve before submission, not a metadata problem.

### Over-the-air updates — 2.5.2

Apps may not download or execute code that **introduces or changes features or
functionality**. The practical line for an Expo app shipping OTA updates: an
update may fix and refine what the reviewed binary already is; it may not turn
the app into something the reviewer never saw. A change of primary purpose needs
a new binary through review.

## Account preconditions

**Three systems must agree before any submit command works**, and they are
genuinely separate:

1. The **bundle identifier registered** in the Apple Developer portal.
2. The **app record** in App Store Connect — it must exist *before* you submit,
   not as part of submitting.
3. The **bundle identifier in the app config**, matching both of the above.

A mismatch surfaces as a submission failure whose message points at
provisioning rather than at the actual cause. Verify all three up front; it
costs a minute and saves a build cycle.

### The credential-ownership conflict

The trap that costs the most time on a first submission, and the one no other
skill covers:

**Xcode's "automatically manage signing" and EAS-managed credentials are two
separate systems that both believe they own your signing identity.** Follow an
Xcode tutorial first, then move to EAS, and they fight — and the resulting error
talks about provisioning profile mismatches, which tells you nothing about the
real cause.

**Resolve credential ownership before the first build, not after a failure.**
Run the EAS credentials flow up front so EAS holds a clean, self-owned set, and
stop managing signing in Xcode for that app. Pick one owner and let it own.

(An App Store Connect API key is the better auth path for anything automated —
it avoids interactive 2FA. `eas-app-stores` has the setup.)

## Pre-submission checks

Run these before triggering a submission. Each one is a rejection or a failed
upload if it's wrong:

- [ ] **Demo account** provided if anything is behind a login — with working
      credentials, kept current.
- [ ] **Backend is live** and will stay live through review. A staging URL that
      sleeps is a rejection.
- [ ] **Tested on a physical device**, not just a simulator — the same gate as
      `../mobile/SKILL.md`.
- [ ] **Privacy policy URL loads directly** — a URL that 404s or bounces through
      a redirect chain is a cheap, avoidable failure. Check it returns content
      at the exact URL you entered.
- [ ] **Notes for Review describe every new feature specifically.** Apple states
      that generic descriptions will be rejected, and that hidden, dormant or
      undocumented features are not permitted. If a feature needs explaining,
      explain it here.
- [ ] **Age rating answered honestly** — it drives parental controls.
- [ ] **Pricing and availability set.**
- [ ] **Screenshots for every required device size**, showing the real app.
- [ ] **In-app purchases disclosed** in the description and screenshots if
      featured content requires them.
- [ ] **No placeholder content anywhere** — lorem ipsum, test data, empty URLs.
- [ ] **Metadata written deliberately**, not as a placeholder to fix later.
      Title, subtitle and keyword field have hard character limits and feed
      search from day one. (`eas-app-stores` → `app-store-metadata.md` owns the
      limits and the ASO mechanics.)

## What this skill does not own

- **Commands.** Building, submitting, versioning, credentials setup, TestFlight
  distribution, metadata push — all `eas-app-stores`, which is version-aware
  and maintained by Expo. Never restate its commands from here.
- **TestFlight strategy.** Already covered there: internal testers get builds
  with no review, external testers need one Beta App Review first.
- **Play Store.** Google has its own data-safety declaration and review path.
  Under the iOS-first policy that's a parity note, not work — see
  `../mobile/SKILL.md`.

## Sources

Obligations and guideline numbers are taken from **Apple's App Review
Guidelines** and **App Store Connect's app-privacy requirements** directly,
rather than from any summary of them. Guideline numbers are cited so a claim can
be checked — Apple revises the text, and a numbered rule is the durable handle.

The credential-ownership conflict, the three-systems precondition, and the
privacy-policy-URL check come from a practitioner's first-submission write-up
(r/vibecoding, "My first app store submission got approved first try"). That
account also recommended a specific third-party CLI and skill stack, which is
deliberately not encoded here — the traps are durable, the toolchain is not, and
`eas-app-stores` already owns that ground. Its TestFlight and metadata advice is
omitted for the same reason: the official skill covers both in more detail.

Treat single-report claims accordingly: a first-try approval is weak evidence
that any particular checklist caused it, but the failure modes it names are real
and cheap to guard against.

## Self-improvement

Once the release work is reported, follow the reflection in
`../mobile/references/self-improvement.md` — notice what was unclear or wrong
about *this skill*: an obligation that has since changed, a guideline number
that no longer matches, a rejection this file didn't predict. A real rejection
that this checklist would not have caught is the highest-value thing to file.
Nothing noteworthy is the normal outcome — say nothing then.
