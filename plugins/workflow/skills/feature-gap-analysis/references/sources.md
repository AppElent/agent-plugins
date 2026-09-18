# Where competitor facts come from

Companion to `feature-gap-analysis`. Every claim in the grid traces back to one
of these, with a date.

## The ranking

Higher beats lower. When two sources disagree, the higher one wins and the
disagreement itself goes in the report — a marketing page contradicting a
changelog usually means the feature is thinner than advertised.

| Rank | Source | Good for | Lies about |
|---|---|---|---|
| 1 | **Changelog / release notes** | What actually shipped, and when | Nothing — but it omits quiet features |
| 2 | **Product docs / API reference** | Depth, limits, edge cases, real shape | Rarely — but docs lag reality both ways |
| 3 | **Pricing page + feature matrix** | Which tier unlocks what; what they consider premium | Names things aspirationally |
| 4 | **The user's own account / screenshots** | Ground truth on the current UI | Only shows their plan and their region |
| 5 | **App-store listing + "What's New"** | Release cadence, platform support, recent focus | Screenshots are of the best case |
| 6 | **App-store reviews, 1★ and 3★** | What is missing or broken — the best gap signal there is | Volume ≠ importance; ignore 5★ and 1★ rants |
| 7 | **Marketing homepage** | Their positioning and vocabulary | Feature depth, always. Treat bullets as `unverified` |
| 8 | **G2 / Capterra / Product Hunt** | Vocabulary, common complaints, the comparison set itself | Incentivized reviews, stale feature lists |
| 9 | **Blog posts, press, conference talks** | Direction and intent | Timing — announced is not shipped |

**Never rank on training-data recall.** If you did not open a source in this
session or the user did not supply it, the claim is `unverified`, no matter how
confident it feels. Competitors ship weekly and your knowledge has a cutoff.

## Recipes by product type

**SaaS web app** — changelog first (`/changelog`, `/whats-new`, `/releases`),
then docs, then the pricing matrix, then their own `/compare/<rival>` pages.
Their comparison pages are gold twice over: they name the competitor set for
you, and the features they choose to compare on are the ones they think win.

**Mobile app** — App Store and Play listings, "What's New" going back a year for
cadence, then 3★ reviews for gaps. Check whether the two platforms are at
parity; a big iOS/Android divergence is a real finding.

**Dev tool / library** — GitHub releases, the docs site, the issue tracker's
most-upvoted open issues (their known gaps, publicly ranked), the roadmap or
project board if public, and the migration guides (what they abandoned).

**API / platform** — API reference diff between versions, rate limits and
quotas, the integration/webhook catalog, SDK language coverage, and status-page
history for reliability claims.

## Query patterns that work

```text
site:<competitor>.com changelog
site:<competitor>.com/docs <feature>
<competitor> release notes 2026
<competitor> vs <other competitor>
<competitor> "not supported" OR "workaround" <feature>
<competitor> pricing plans compare
```

The `"not supported"` / `"workaround"` pattern surfaces their community forum
and support threads, which is where features are honestly described.

## Reading reviews for gaps

1★ reviews are mostly billing complaints and outages. **3★ reviews are the
signal** — someone who likes the product enough to keep using it and still names
what it can't do. Pull the recurring nouns, not the sentiment.

Ignore anything about price, support responsiveness, or a single user's bug.
Those are not feature gaps.

## Recording

Every claim, one line:

```text
<feature> — <source URL> — <date the source shows> — confirmed | likely | unverified
```

The date is the date **on the source**, not the date you read it. A pricing page
with no date visible is `likely` at best.
