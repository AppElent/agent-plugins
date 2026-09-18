---
name: model-selector
description: Advise which provider, model and reasoning effort to use for a coding task across the Codex and Claude subscriptions. Use when the user asks which model to use, which agent should handle a task, whether to switch providers, what effort level to run at, or says "/model-selector", "which model for this", "should I use Codex or Claude" — and when another skill such as handoff-session needs a provider/model/effort answer.
---

# Model Selector

Answers one question: **given this task, which `(provider, model, effort)` should
I launch?**

It advises. It does not launch anything, and it cannot change the model of the
session it is running in — `/model` and `/effort` are user-driven. The output is
a tuple, a one-line reason, and a paste-ready command.

## What this skill does not own

- **Launching the thing.** `handoff-session` starts the session and owns the
  argv; `the-orca-way` decides where it runs. This skill exists to *answer* the
  "provider + model + effort" question they ask. It never spawns.
- **API model choice for code you are writing.** The `claude-api` skill owns
  Anthropic model ids, pricing and migration for application code. This skill is
  about which *agent session* to run under a subscription, not about per-token
  API spend. If the user is choosing a model for an app to call, route there.
- **Current model facts.** The roster is read live (below). Strengths and effort
  baselines live in `references/model-notes.md` as a dated snapshot.

## The roster is read live, never remembered

Model lineups move faster than this file can. **Always** read the roster before
advising:

    node -e "const m=JSON.parse(require('fs').readFileSync(process.env.USERPROFILE+'/.codex/models_cache.json','utf8')); console.log('fetched',m.fetched_at,'client',m.client_version); for(const x of m.models) if(x.visibility!=='hide') console.log(x.slug,'| default',x.default_reasoning_level,'|',x.supported_reasoning_levels.map(r=>r.effort).join(','),'|',x.description)"

For Claude there is no equivalent file. Read `claude --help` for the current
`--model` aliases and the `--effort` levels, and the session environment for what
exists.

**Authority rule.** The live roster wins on *what exists* and *what efforts a
model accepts*. `references/model-notes.md` is advisory only, on *what a model is
good at* and *what effort it wants*. When they disagree, follow the live roster
and say out loud that the note is stale. A slug in the roster with no note is not
an error — advise from the vendor's own blurb and its tier position, and say the
note is missing.

### Check the CLI can actually run it

The cache carries a `client_version`. If the installed CLI is older, the roster
will list models that fail with *"requires a newer version of Codex."* This is
not hypothetical — it happened on 2026-09-08 with `gpt-6-astra` against CLI
0.146.1 while the cache reported 0.153.0.

Compare `codex --version` against the cache's `client_version`. If the installed
CLI is behind, say so and recommend the best model that will actually run, rather
than the best model on paper.

### The cache is not complete, and not always current

It lists models that no longer work and omits models that do. As of 2026-09-08:
`gpt-5.4-mini` retired from ChatGPT-sign-in Codex on 2026-08-31 yet is still in
the cache — never advise it, OpenAI directs those users to Luna — and
`gpt-5.3-codex-spark` is absent from the cache but present in OpenAI's
recommended roster.

So the roster is authoritative on *what the CLI will accept*, not on *what is
current*. `references/model-notes.md` carries the known exceptions; check it
before advising any slug.

## Tiers

Categories are tiers of **model**, not kinds of situation. Each tier has both a
Codex and a Claude member — that is what makes cross-provider advice possible.
Membership is resolved against the live roster; the tier names are the stable
part.

| Tier | For | Codex | Claude |
|---|---|---|---|
| `frontier` | Ambiguous, high-stakes, long-horizon or genuinely hard work | `gpt-6-astra`, `gpt-5.6-sol` | `opus`, escalating to `fable` |
| `general-purpose` | Everyday coding with a clear goal | `gpt-5.6-terra` | `sonnet` |
| `fast-cheap` | Narrow, mechanical, high-volume work with explicit checks | `gpt-5.6-luna` | `haiku` |

Previous-generation models (`gpt-5.5` and older) belong to no tier. They are a
footnote in the notes file, not something to advise into.

Two tier placements are not obvious and are argued in the notes: `gpt-5.6-sol` is
`frontier` rather than `general-purpose` because OpenAI routes complex coding,
architecture and long-horizon agents to it; and within Claude's `frontier`,
`opus` is the default with `fable` reserved for when Opus at higher effort falls
short — Anthropic's own guidance, reinforced by Fable's quota cost.

Ties **within** a tier break on the per-model strengths in
`references/model-notes.md`. That is what the notes are for.

## Mapping a task onto a tier

Free-text asks resolve through this table. It is the opinionated half of the
skill; when a recommendation is wrong, this is usually the row to edit.

| Work shape | Tier |
|---|---|
| Ambiguous requirements, or the goal itself is unclear | `frontier` |
| Architecture, system design, a plan that is expensive to get wrong | `frontier` |
| A bug that has already survived two or more attempts | `frontier` |
| Long-horizon autonomous work across many files | `frontier` |
| Implementing a specified feature with a known shape | `general-purpose` |
| Reviewing a PR or a diff | `general-purpose` |
| Ordinary debugging with a reproduction in hand | `general-purpose` |
| Writing docs or prose against an outline | `general-purpose` |
| Mechanical rename, codemod, or format across many files | `fast-cheap` |
| Repetitive per-item work with an explicit acceptance check | `fast-cheap` |
| Summarising, extracting or classifying against a fixed schema | `fast-cheap` |

**No row matches?** Say so rather than guessing, name the closest two rows, and
advise `general-purpose` as the default. Then offer to add the row.

## Effort

Effort is a **property of the model**, not of the tier. Baselines differ — Codex
models start as low as `low`, every effort-capable Claude model starts at `high`,
and `haiku` has no effort dial at all. Each model's baseline lives in
`references/model-notes.md`.

Effort is a behavioural signal, not a competence floor. No first-party source
claims any current model is incoherent below a given level, and Fable 5.1's own
system card records a coding benchmark *peaking at `medium`* because higher
effort produced more out-of-scope edits. Both vendors give the same rule: start
at the baseline, lower it when quality holds, raise it only when evaluation shows
a gain.

**Start from the model's baseline.** A tier may override it, but the override
must carry a stated reason in the notes file. An override with no reason is a
bug — grep for them during `refresh`.

The one override that is a tier-level decision rather than a model-level one is
Codex's `ultra` ("maximum reasoning with automatic task delegation"). Reach for
it only on genuinely long-horizon `frontier` work, whichever model is chosen.

Never silently substitute a model or effort the user named. If they asked for
something you would not have picked, advise, then honour their choice.

## Quota

Default is quota-blind: recommend the best fit for the work.

Neither CLI writes readable quota state to disk — both expose the remaining
window only interactively (`/usage` in Claude Code, `/status` in Codex). So the
skill cannot measure quota and must never claim to.

When the user *volunteers* pressure ("Claude's nearly out", "keep it cheap",
`--cheap`), re-route in this order:

1. Same tier, the other provider. This is what holding both subscriptions buys.
2. Same model, one effort rung down, if the baseline allows it.
3. One tier down, stating plainly what is being given up.

**`fable` is the exception to quota-blindness.** It is not included in Claude
Pro's limits at all — it burns pay-as-you-go credits from the first token — and
on Max it is capped at 50% of the shared weekly limit. Advising it is a spending
decision, so say what it costs even when no pressure was volunteered.

Never quote a message count. Neither vendor publishes fixed counts, only relative
capacity and rolling-window mechanics.

## Output

Give exactly this, and nothing more:

- **The tuple** — provider, model, effort.
- **One line of why** — the tier it landed in and the row that put it there.
- **The command**, paste-ready:
  - `codex --model <slug> -c model_reasoning_effort="<effort>"`
  - `claude --model <alias> --effort <effort>`
- **Any caveat that changes the answer** — a stale note, a missing note, or a
  model the installed CLI cannot run.

Do not compare against the current session's model. Do not offer to launch it.

Never state a numeric cost, speed or benchmark comparison that is not sourced in
`references/model-notes.md`. An unsourced number is worse than no number.

## Subcommands

### list

Print the three tiers with their current members and effort baselines, resolved
against the live roster. Advise nothing.

### refresh

Re-run the desk research behind `references/model-notes.md`.

1. Read the `Last verified` date at the top of the notes.
2. Run the research as a **background agent on Codex**, not on Claude — desk
   research should never eat the window you code with. An Anthropic session limit
   has already killed one run of this.
3. It must produce: the roster, each model's positioning quoted from the vendor,
   first-party benchmark numbers with source URLs and dates, subscription window
   mechanics per plan, and a **recommended default effort per model with its
   evidence** — writing "no evidence" where there is none.
4. Update `Last verified`. Check every tier override still carries a reason.

### Staleness gate

On every invocation, check the `Last verified` date. **Past 30 days**, say so
before advising — advice is still given, just flagged. Thirty, not ninety: the
roster moved twice in the months before 2026-09, and a ninety-day window would
have routed to retired models.

## Adding a provider

`provider` is a column, not a hardcoded pair. A third provider is new rows in the
tier table and the notes file, plus its own launch command. Nothing else changes.

## Notes

- Structure, and two norms worth keeping — never silently substitute a user's
  chosen model, and omit capability comparisons that are not officially sourced —
  are derived from [`claudex-route`](https://github.com/chaseai-yt/claudex-loop)
  (MIT).
- The divergence is deliberate: `claudex-route` maps *situations* to *actions*
  and executes handoffs. This skill maps *tasks* to *model tiers* and only
  advises.

## Self-improvement

At the end of a run, reflect on this skill and offer to file what was unclear
back to this repo — see
[`../workflow/references/self-improvement.md`](../workflow/references/self-improvement.md).
