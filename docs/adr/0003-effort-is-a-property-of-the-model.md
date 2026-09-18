# Effort is a property of the model, not of the tier

Reasoning effort in `model-selector` is a baseline attached to each model and
refined by periodic desk research, rather than a value pinned per tier or asked
of the user each time. Baselines genuinely differ by model:
`~/.codex/models_cache.json` ships a `default_reasoning_level` that varies
between models in the same tier, Anthropic documents `high` as the default for
every effort-capable Claude model, and Haiku 4.5 has no effort dial at all.

A tier may override a model's baseline, but the override must carry a stated
reason in `references/model-notes.md`. An override without a reason is a defect,
and `refresh` greps for them.

## Considered Options

Pinning one effort per tier was rejected: it hides the dial that most affects
subscription burn. Making effort a second user-supplied input was rejected as
well — it turns every lookup into an interrogation and fights the goal of "just
tell me what to run".

Making the baseline a hard floor that tiers could only raise was close, but could
not express Codex's `ultra` ("maximum reasoning with automatic task delegation"),
which is a decision about the *task shape* — long-horizon, many files — and
applies whichever model is chosen. That is the motivating override.

## Consequences

The decision was originally argued on the premise that some models are
"incoherent below `high`". Desk research on 2026-09-08 found **no first-party
source supporting that for any current model** — effort is a behavioural signal,
not a competence floor, and Fable 5.1's own system card records a coding
benchmark peaking at `medium` because higher effort caused more out-of-scope
edits. The decision stands on the weaker but verified claim that baselines
differ; the skill must not repeat the stronger one.
