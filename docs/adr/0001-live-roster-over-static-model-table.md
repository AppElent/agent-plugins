# Live roster over a static model table

A model-selection skill needs to know which models exist, and a table written
into `SKILL.md` goes wrong within weeks — the whole GPT-5.6 line and
`gpt-6-astra` appeared within months of each other, and both were newer than the
locally installed Codex CLI. So `model-selector` reads the roster live from
`~/.codex/models_cache.json` and `claude --help` on every invocation, and keeps
only the slow-rotting judgment — what a model is good at, what effort it wants —
in a dated `references/model-notes.md`.

## Considered Options

A static table in `SKILL.md` was rejected: it fails silently and confidently,
recommending retired models with no signal that anything is wrong. A pure
live-read with no notes was rejected too — the roster's one-line vendor blurbs
cannot answer "which of these two is better at debugging", which is the question
the skill exists for.

## Consequences

The two sources can disagree. The authority rule resolves it: the roster wins on
*what exists and what efforts it accepts*, the notes win on *what it is good at*,
and a slug with no note is advised from its vendor blurb and tier position rather
than being treated as an error. This mirrors the dated-snapshot-plus-staleness
pattern `usage-audit` already uses for provider quotas.

The threshold is 30 days, not the 90 that `usage-audit` uses. Quota tiers change
a couple of times a year; the model roster moves far faster.
