# Cloudflare

**This file decides whether a cost is worth paying. It does not say how to
configure anything.** Cache rules, bindings, wrangler syntax, Workers idioms —
take those from the installed `cloudflare`, `workers-best-practices` and
`wrangler` skills. Apply the reasoning here, take the mechanism from them.

Quota numbers: `quotas.md`.

## Start by finding the surface

Read `wrangler.jsonc` / `wrangler.toml` before reading any application code:

| Look for | Means |
|---|---|
| `kv_namespaces`, `r2_buckets`, `d1_databases`, `durable_objects`, `queues`, `ai`, `vectorize` | that meter is live — audit it |
| `triggers.crons` | constant background requests |
| `limits` | someone already thought about CPU |
| `observability` | whether you can measure anything at all |
| `env.*` blocks | how many Workers actually exist |

**An app with one Worker and no bindings has one meter: requests and CPU.** Say
so in a sentence and spend the audit on the database instead. Do not walk the
rest of this file looking for findings that cannot exist.

## Workers — requests and CPU

The two meters, and what multiplies them:

- **Requests** — every SSR navigation, every API route call, every asset request
  not answered by cache, every cron firing, every preview deployment being
  poked. On the free plan this is a **daily** ceiling that resets at 00:00 UTC,
  so a burst matters more than a monthly average.
- **CPU time per invocation** — wall-clock waiting on a backend does *not*
  count; rendering does. This is why the free plan's 10 ms ceiling bites
  server-rendered apps and barely touches proxy-shaped ones.

| Pattern | What it costs | Fix | Cost of the fix |
|---|---|---|---|
| Router preload on hover with a zero stale time | a mouse sweep across a nav bar issues a load per link | give preloads a stale window so a repeat hover is free | a preloaded route can be marginally stale |
| SSR for a page with no per-request content | a Worker invocation per view of a static page | prerender it, or cache the response | rebuild needed for content changes |
| Uncached immutable assets | a request per asset per visitor | cache headers on hashed filenames | none — no-regret |
| Per-request work that is the same for everyone | CPU per request | compute once, cache the result | staleness |
| Cron on a short interval | constant requests, no user | lengthen the interval to what the feature needs | slower propagation |

## Deployment sprawl

Every environment is its own Worker, and Workers are a counted resource.

- Production, `-dev`, and one per open pull request is normal; nobody counts
  them, and the free plan caps the total.
- Check teardown symmetry: a preview workflow that deletes the Worker on close
  but leaves a backend deployment behind is a leak with a delay on it.
- Check for concurrency cancellation on the preview workflow. Without it, three
  quick pushes to a PR build three times.

## KV

Read-optimized, and the write allowance is the constraint — a fraction of the
read allowance on the free plan, plus a hard one-write-per-second per key.

| Pattern | What it costs | Fix |
|---|---|---|
| Writing per request (counters, session touches, rate limiting) | exhausts the daily write allowance long before reads | Durable Object for counters, or batch and write periodically |
| Hot-key writes | throttled at 1/s per key, silently | shard the key |
| `list()` in a request path | listing is an operation and it grows with the namespace | keep an index key, or use a different store |

KV is also eventually consistent — a cost audit that moves writes into KV must
say so, because it changes behaviour.

## R2

Egress is free. **Operations are the meter**, and the two classes differ by an
order of magnitude in allowance.

- **Class A is the scarce one** and includes `ListObjects` and every flavour of
  upload and multipart call. A directory listing per page view is billed like a
  write.
- **Class B** is reads: `GetObject`, `HeadObject`.
- Deletes are free.

| Pattern | What it costs | Fix |
|---|---|---|
| `ListObjects` per page view | Class A per view | keep the listing in a database and read it from there |
| `HeadObject` before every `GetObject` | doubles Class B | just get it and handle the miss |
| Multipart for small files | several Class A ops per upload | single `PutObject` under the threshold |
| Serving originals to thumbnails | Class B x every view, at full size | store a derivative once |

## D1

**Rows read counts rows scanned, not rows returned.** A full scan of a
5,000-row table is 5,000 rows read even when one row comes back, and row size is
irrelevant. That makes a missing index a direct, linear, daily cost — and makes
index findings unambiguously no-regret.

| Pattern | What it costs | Fix |
|---|---|---|
| Query without a supporting index | rows read = table size, per query | add the index |
| `SELECT *` for a list view | not billed by width, but pairs with scans | narrow the query anyway; it usually reveals the missing index |
| N+1 in a request handler | rows read x N | one join, or one `IN` |
| Write per event | rows written is the tighter of the two daily meters | batch, or aggregate before writing |

## Durable Objects

Two meters that move independently: **requests** and **duration**.

Duration is wall-clock while the object is alive. An object kept awake by an
open WebSocket bills continuously whether or not messages flow — so the
multiplier for a chat-shaped feature is *connected client-minutes*, not
messages. Hibernation is the lever; the `durable-objects` skill owns how.

On the free plan the SQLite backend adds rows-read and rows-written meters with
the same scanned-not-returned rule as D1.

Exceeding any single daily limit makes further operations **of that type** fail
with an error. There is no graceful degradation to design around — treat a
projection that approaches a limit as a scaling finding, not a Noted one.

## Queues

Operations are the meter, and a message costs operations at both ends plus
retries. A dead-letter loop is an unbounded multiplier: check that retry limits
and a DLQ exist before anything else.

## Workers AI, Vectorize, Images

Not verified in `quotas.md`. If an app uses one, read the current pricing page,
add a dated section to `quotas.md`, and then audit it. Until then, report the
usage and say the limit was not verified.

## Adjacent cost that is not Cloudflare's

LLM and third-party API calls issued from a Worker are billed by that vendor.
They frequently dominate everything on this page and belong in their own section
of the report, with their own meter — usually tokens — so the totals are not
misleading. See `other-providers.md`.
