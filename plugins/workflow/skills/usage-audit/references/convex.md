# Convex

Every API name in this file is a pointer, not a quotation. **Confirm the current
signature against docs.convex.dev before writing code** — there is no Convex
skill installed anywhere, so nothing here is authoritative about the API. The
durable part is the *reasoning*: which meter an operation lands on, and what
multiplies it.

Quota numbers: `quotas.md`.

## The meters

| Meter | Billed on | Multiplied by |
|---|---|---|
| **Function calls** | every query, mutation and action invocation | mounts, writes to a subscribed table, subscribers, scheduled runs |
| **Database I/O** | bytes a function scans and writes | table size when unindexed, document width, result count |
| **Database storage** | documents at rest | rows created, never deleted |
| **File storage** | bytes in `ctx.storage` | uploads without a deletion path |
| **Data egress** | bytes pushed to clients | subscribers x payload size x push frequency |
| **Action compute** | wall time x memory of actions | actions per item, slow third-party calls |

The one people miss: **a live query re-runs and re-bills on every write that
touches its result set, for every subscriber.** Function calls are not a count
of the queries you wrote.

## Detection — reads

| Pattern | Grep | What it costs | Fix | Cost of the fix |
|---|---|---|---|---|
| Per-mount resubscribe | `useQuery(` in a route component | one call + full payload on every navigation to the route | give the query a cache with a lifetime that survives unmount (the TanStack Query integration), or lift it to a provider above the route | staleness window you choose |
| Unbounded read | `.collect()` in `convex/` | I/O proportional to table size, forever | `.take(n)` for a capped list, `.paginate()` + `usePaginatedQuery` for a real one | pagination UI |
| Unindexed filter | `.filter(` or `.collect()` with no `.withIndex(` nearby | scans the table, bills the scan, returns one row | add an index in `schema.ts`, query `.withIndex(...)` | none — no-regret |
| Over-wide documents | a list view mapping over full docs | egress proportional to fields x rows | return a projection shaped for the view | a second query for the detail view |
| Ungated authed query | `useQuery(` in a component without a `useConvexAuth()` gate | fires unauthenticated, throws, re-fires — two calls per render | `const { isAuthenticated } = useConvexAuth()` then pass the `"skip"` sentinel as args until true | none — no-regret |
| Bundle fan-out | one query returning several collections | any write to any part re-pushes all of it to every subscriber | split the hot collection out of the bundle | more subscriptions, more code |
| Duplicate subscriptions | the same `useQuery` in sibling components | N identical subscriptions | hoist to a common parent or a shared cache | prop drilling or context |

### Subscription lifetime — the finding that pays

Convex's React client reference-counts subscriptions. When the last component
using a query unmounts, the subscription drops; navigating back re-opens it and
re-bills the initial read. On a page the user visits repeatedly — a list they
tab in and out of — this is a per-mount multiplier on both function calls and
egress.

Three levers, cheapest first:

1. **Connect a query cache.** Convex ships a TanStack Query integration
   (`@convex-dev/react-query`): a `ConvexQueryClient` connected to the app's
   `QueryClient`, with reads issued through the integration's query options
   rather than raw `useQuery`. The cache holds the entry past unmount for its
   garbage-collection window, so a return visit is served from cache and the
   subscription is reused rather than re-established. **Check the current API
   before wiring it** — this integration has changed shape between versions.
2. **Lift the subscription.** If a query is needed by several routes, mounting
   it once in a layout above them turns N subscriptions into one.
3. **Decide it does not need to be live.** A one-shot read is a valid answer for
   data that changes rarely. This is a trade-off, not a no-regret: say what
   goes stale.

**A dependency on the integration is not evidence it is in use.** Check that the
client is actually connected to the query client and that reads go through it.
An instantiated `ConvexQueryClient` used only to obtain `.convexClient` is
scaffolding — the cache is not in the path, and every read is still a raw
per-mount subscription. That is a no-regret finding: the dependency is already
paid for.

### Pagination

`usePaginatedQuery` on the client with `.paginate(paginationOpts)` on the
server. Its absence in an app with any list that grows is a scaling finding by
definition — the multiplier is the row count and nothing bounds it.

`.take(n)` is the cheap intermediate: it caps I/O without a pagination UI, and
is the right fix for "the ten most recent" lists that are currently collecting
everything.

## Detection — writes

Apply the liveness test from the SKILL before proposing any of these:

> Is another client watching this right now, and does it need to see it before
> the user is done?

| Pattern | Grep | What it costs | Fix | Cost of the fix |
|---|---|---|---|---|
| Write per keystroke | `useMutation` used inside `onChange` / `onValueChange` | one function call + write per character | local `useState` buffer, one mutation on blur, submit, or a debounce | draft is lost on a hard refresh unless persisted locally |
| Write per toggle | mutation in a checkbox/filter/sort handler | one call per interaction | keep UI preference local, persist on leave or not at all | preference not synced across devices |
| Effect-driven write | `useMutation` called from a `useEffect` with a changing dep | fires on every render that changes the dep | move to the event that actually means "commit" | none — usually a bug |
| Write amplification | mutation followed by an explicit refetch | doubles the call | the subscription already pushes the new value | none — no-regret |
| Per-item action loop | `ctx.scheduler.runAfter` or an action inside a `for` | action compute x item count | batch into one action that handles the list | longer single run, harder retries |
| Unbounded growth | inserts with no delete path — events, logs, history | storage that only rises | retention policy, or aggregate and drop detail | history is gone |

**Autosave is not automatically wrong.** It is wrong when it is
per-keystroke and the document has one editor. Autosave on a debounce, or on
blur, keeps the UX and removes the multiplier. Say which one you are proposing.

## Actions, scheduling, storage

- **`"use node"` actions** bill action compute, a separate meter from queries.
  Wall time counts, so an action that waits on a slow third-party API is
  expensive even when it does nothing.
- **`ctx.scheduler`** turns one user action into N future function calls. Fine;
  just make sure the fan-out is in the multiplier table.
- **`crons.ts`** is constant burn. Constant is cheap to reason about and easy to
  forget — list it, then usually leave it in the Noted tier unless it scans a
  growing table, in which case it is per-item.
- **`ctx.storage`** bills storage and file bandwidth. Look for uploads with no
  corresponding delete, and for originals served where a derivative would do.

## Deployments — the meter nobody counts

Convex bills per deployment, and previews are deployments.

A per-PR preview workflow (`convex deploy --preview-create`) provisions a fresh
backend per pull request, **redeploys on every push to that PR**, and re-runs
any `--preview-run` seed each time. Teardown is often asymmetric: the Worker is
deleted when the PR closes, the Convex preview deployment is left to idle-expire
on its own timer.

Findings worth raising:

- Seeds that write a lot, running on every commit rather than on create.
- No concurrency cancellation on the preview workflow, so pushes queue up
  redundant deploys.
- Long-lived draft PRs holding preview backends open.

None of these show up in the app's own code, which is why they get missed.

## Positive patterns — do not "fix" these

- **A deliberate bundle query** that returns several related collections to
  power one screen atomically is a real trade: fewer subscriptions and a
  consistent snapshot, at the cost of re-pushing everything on any write. It is
  a finding only if one member of the bundle is written far more often than the
  rest.
- **A service worker that precaches the app shell and never intercepts Convex
  traffic.** That is correct — caching the sync transport would break it.
- **Optimistic updates** cost nothing extra by themselves. Only flag them when
  paired with a redundant refetch.
