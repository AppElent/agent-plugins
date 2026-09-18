# Model notes

**Last verified: 2026-09-08** — desk research against first-party vendor sources.
Full report with a URL per claim: [`notes/model-landscape-2026-09.md`](../../../notes/model-landscape-2026-09.md).

Advisory only. The live roster wins on what exists and what efforts a model
accepts — see the authority rule in `../SKILL.md`. This file claims only *what a
model is good at* and *what effort it wants*.

Staleness gate: 30 days.

## Read this before trusting the local cache

The Codex `models_cache.json` is neither complete nor current:

- **`gpt-5.4-mini` retired from ChatGPT-sign-in Codex on 2026-08-31** and OpenAI
  directs those users to Luna — but it is still listed in the local cache. Never
  advise it. (API-key Codex is unaffected.)
- **`gpt-5.3-codex-spark` is missing from the cache** yet is in OpenAI's current
  recommended roster. It is ChatGPT-Pro-only, ultra-fast (>1,000 output tok/s),
  has its own separate rate limit that does not count against standard limits,
  and is for real-time interactive editing rather than cheap throughput.
- **`gpt-6-astra` requires a recent CLI.** On 2026-09-08 it returned HTTP 400
  *"requires a newer version of Codex"* on CLI 0.146.1 while the cache reported
  `client_version` 0.153.0.

## Effort baselines

`Baseline` is the effort to start from. `Source` is `vendor` (published guidance),
`machine` (the local cache's `default_reasoning_level`), or `none`.

Both vendors give the same operating rule: **start at the baseline, measure on
representative tasks, lower it when quality holds, raise it only when evaluation
shows a gain.**

### Codex

| Model | Tier | Efforts | Baseline | Source |
|---|---|---|---|---|
| `gpt-6-astra` | `frontier` | low…ultra | `low` | machine (no public default; migration guidance says start at `low`) |
| `gpt-5.6-sol` | `frontier` (see below) | low…ultra | `low` | machine — **conflicts with vendor**, which shows `medium` |
| `gpt-5.6-terra` | `general-purpose` | low…ultra | `medium` | vendor + machine agree |
| `gpt-5.6-luna` | `fast-cheap` | low…max | `medium` | vendor + machine agree |
| `gpt-5.3-codex-spark` | `fast-cheap` (Pro only) | not published | — | none — no named default exists |
| `gpt-5.5` | legacy | low…xhigh | `medium` | vendor + machine agree |
| `gpt-5.4-mini` | **retired** | — | — | do not advise |

### Claude

`claude --effort low|medium|high|xhigh|max`. Fable 5.1, Opus 5 and Sonnet 5
support all five. **Haiku 4.5 does not support effort at all** — Anthropic's
model page says so, and no official source documents what the CLI does if you
pass the flag anyway. Do not pass it with `haiku`.

| Model | Alias | Tier | Baseline | Source |
|---|---|---|---|---|
| `claude-fable-5-1` | `fable` | `frontier` (escalation) | `high` | vendor |
| `claude-opus-5` | `opus` | `frontier` (default) | `high` | vendor |
| `claude-sonnet-5` | `sonnet` | `general-purpose` | `high` | vendor |
| `claude-haiku-4-5-20251001` | `haiku` | `fast-cheap` | n/a | vendor — no effort support |

`high` is documented as equivalent to omitting the parameter, and is the default
for all three effort-capable Claude models. `max` places no constraint on token
spending and reaches subscription limits fastest.

## Tier overrides

Every row must carry a reason. A row with an empty reason is a bug; `refresh`
greps for them.

| Tier | Model | Effort | Reason |
|---|---|---|---|
| `frontier` | any Codex | `ultra` | Long-horizon decomposable work. `ultra` is orchestration — maximum reasoning plus automatic task delegation, launched with four parallel agents — so it is a property of the *task shape*, not the model, and cannot live in a baseline. Not an API effort value. |
| `frontier` | any Claude | `xhigh` | Anthropic documents `xhigh` specifically for agentic coding runs over 30 minutes with million-token budgets. Same task-shape argument as `ultra`. |

Claude Code's `ultracode` is not a sixth effort level — Anthropic defines it as an
`xhigh` request plus workflow orchestration. Treat it as the Claude analogue of
Codex `ultra`.

## What each model is good at

Benchmark numbers are first-party and **not cross-vendor comparable** — the two
vendors use different harnesses, task releases, token budgets and scoring
variants, and both publish caveats saying so. Use them as evidence for a vendor's
own positioning, never as a league table.

### Codex

- **`gpt-6-astra`** — "our most capable model, built for the hardest end-to-end
  work": complex reasoning, coding, computer use, research, document creation.
  Also officially positioned for **visual judgment and frontend QA**.
  Terminal-Bench 4.0 57.9%; GPQA Diamond 96.0%; ARC-AGI-2 95.0%; MRCR v2 8-needle
  96.3% at 512K–1M. No SWE-bench Verified published.
- **`gpt-5.6-sol`** — most capable GPT-5.6: complex coding, computer use,
  cybersecurity, **ambiguous work**, high-stakes decisions. SWE-Bench Pro 64.6%;
  Terminal-Bench 2.1 88.8% (91.9% at Ultra). Note: stricter cyber safeguards can
  block benign work, with an offer to retry on a lower model.
- **`gpt-5.6-terra`** — the "pragmatic all-rounder" for everyday production work
  and the natural home for anything previously given to GPT-5.5. SWE-Bench Pro
  63.4%; Terminal-Bench 2.1 87.4%.
- **`gpt-5.6-luna`** — clear, repeatable, cost-sensitive high-volume work:
  extraction, classification, transformation, structured summaries. SWE-Bench Pro
  62.7%. **Weak long-context**: MRCR v2 8-needle 41.3%, roughly half of Sol's.
  Do not hand it large-context work.
- **`gpt-5.3-codex-spark`** — near-instant interactive editing; makes minimal
  edits and does not run tests unless asked. Pro only.
- **`gpt-5.5`** — legacy. Still officially positioned for debugging and
  validation, but advise into it only if a current model cannot run.

Hidden slugs (`visibility: hide`) — `gpt-reserve`, `codex-auto-review` — are
internal. Never advise them.

### Claude

- **`fable`** (Fable 5.1) — demanding reasoning and **long-horizon agentic work**;
  tasks larger than one sitting, root-cause investigations, whole-codebase work,
  architecture decisions, and finished documents/sheets/slides. SWE-Bench Pro
  81.2%; Terminal-Bench 4.0 55.8% at `max`; ARC-AGI-2 90.0%.
- **`opus`** (Opus 5) — complex agentic coding, deep reasoning, long-horizon
  tasks; launch emphasises **frontend/UI implementation**. SWE-bench Verified
  96.0% at `max`; Terminal-Bench 4.0 52.3%. `opus[1m]` selects 1M context —
  included on Max, but Pro needs usage credits.
- **`sonnet`** (Sonnet 5) — "the best combination of speed and intelligence", the
  daily-coding alias. SWE-bench Verified 85.2%; Terminal-Bench 2.1 80.4%.
- **`haiku`** (Haiku 4.5) — fastest; simple tasks, low-latency/high-volume work,
  subagents. SWE-bench Verified 73.3% with a 128K thinking budget. 200K context.

**Within `frontier`, prefer `opus` and escalate to `fable` only when Opus at
higher effort falls short.** That is Anthropic's own guidance, and the quota
mechanics below reinforce it.

Claude Code also ships `opusplan` — Opus while planning, Sonnet while executing.
Worth naming when the task is plan-then-build.

## Subscription windows

Both vendors publish **relative capacity and window mechanics, never fixed
message counts**, because consumption varies with model, context, tools, retrieval
and caching. Do not quote a message count.

- **Claude** — Pro $20, Max 5× $100, Max 20× $200; the multipliers describe usage
  per rolling five-hour session, with weekly limits layered on top. Usage is
  shared across web, desktop, mobile, Cowork and Claude Code. Max defaults to
  Opus 5, Pro to Sonnet 5.
- **Fable is the expensive one.** It is **not included in Pro's ordinary limits
  at all** — it consumes pay-as-you-go credits from the first token. On Max it is
  included but capped at **50% of the shared weekly limit**. This is the single
  most important quota fact in this file: routing to `fable` casually is how a
  weekly window disappears.
- **Codex** — shares its allowance with ChatGPT Work. Published figures are
  *estimates of local messages per rolling five-hour period*, not caps; local and
  cloud work share the allowance and weekly limits may apply.
- `gpt-5.3-codex-spark` has a separate preview rate limit that **does not** count
  against standard limits.
- Higher effort means more output and thinking tokens, and therefore reaches the
  limit faster. Neither vendor publishes a conversion from effort to quota.

One measured data point, recorded because it shaped this skill's design: on
2026-09-08 a single background research agent on `claude-opus-5` exhausted an
Anthropic session limit mid-task and produced nothing. Desk research runs on
Codex.

## Corrections to intuitions this skill was built on

- **"Some models are incoherent below `high`" is not supported by any first-party
  source.** Anthropic recommends `high` as a starting point and documents lower
  effort as valid after evaluation; OpenAI recommends the lowest effort that
  works. Effort is a behavioural signal, not a competence floor.
- **Higher effort is not uniformly better.** Fable 5.1's own system card records
  FrontierCode 1.1 peaking at `medium` (63.6% Extended, 50.9% Main) because higher
  effort more often produced out-of-scope changes.
- **`gpt-5.6-sol` sits closer to `frontier` than to `general-purpose`.** OpenAI
  routes complex coding, architecture and long-horizon agents to Sol, with Terra
  as the everyday model. The tier table reflects this.

## Remaining gaps

- No official OpenAI page publishes the full per-model effort matrix; the local
  cache's defaults are machine/account observations, not vendor policy. Sol's
  `low` directly conflicts with the public `medium`.
- No plan-by-plan guarantee that Astra entitlement includes Astra `ultra`.
- No documentation of what Claude Code does if `--effort` is passed with `haiku`.
- No named effort default, max-output figure, or numeric benchmarks for
  `gpt-5.3-codex-spark`.
- Claude Code aliases are not portable across Bedrock/Vertex/Foundry — pin full
  IDs when reproducibility matters.
- No published retirement dates for Astra, GPT-5.6, or GPT-5.5.
