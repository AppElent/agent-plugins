# Model-centric tiers with a task mapper on top

`model-selector` groups models into three capability tiers — `frontier`,
`general-purpose`, `fast-cheap` — and puts a separate, smaller table on top that
maps work shapes onto those tiers. The tiers are the source of truth about
models; the mapper is what makes a free-text ask answerable.

## Considered Options

The obvious alternative, and the one comparable skills take, is to make the
primary table *situation-centric* — mapping "a plan is ready for review" or
"attempts have failed" straight to an action, with no model categories at all.
The MIT-licensed `claudex-route` skill is built this way.

It was rejected because the model tiers are the thing that accumulates knowledge:
strengths, effort baselines, and provider parity all attach to models, and a
situation table has nowhere to put them. Splitting the two lets each rot at its
own rate — the tier table changes when the roster does, the mapper changes when a
recommendation turns out wrong.

Doing without the mapper entirely was also rejected. With model-centric tiers
alone, the user has to classify their own task before the skill can help, which
is the hard half of the problem.

## Consequences

Two tables to keep coherent. The mapper is the opinionated one and is expected to
be edited often; a bad recommendation should usually be fixable by changing one
row. When no row matches, the skill says so and defaults to `general-purpose`
rather than inventing a mapping silently.
