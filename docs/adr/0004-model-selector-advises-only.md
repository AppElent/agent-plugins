# model-selector advises, orca-flow executes

`model-selector` outputs a `(provider, model, effort)` tuple and a paste-ready
command. It never spawns a session, and it does not compare its answer against
the session it is running in.

Spawning already has an owner: `orca-flow` asks for provider, model and effort
per stage and turns the answer into terminal argv. If `model-selector` also
launched things, two skills would race to spawn terminals under different
conventions — the divergence this repo exists to prevent. The clean seam is that
`model-selector` answers the question `orca-flow` asks.

## Consequences

Two boundaries follow, and both are deliberate no-s worth recording:

- **Not API model choice.** The `claude-api` skill owns Anthropic model ids,
  pricing and migration for application code. `model-selector` is about which
  agent *session* to launch under a subscription — a different optimisation
  problem, since the binding constraint is a usage window rather than per-token
  cost. Requests about a model for an app to call route to `claude-api`.
- **No session comparison.** The skill could read the running model from settings
  and say "you are already on it", but judging whether a switch is worth its
  overhead is `orca-flow`'s territory, and the extra branch buys little for a
  skill whose entire contract is "name a tuple".

Quota is handled the same way. Neither CLI writes readable quota state to disk —
both expose the remaining window only interactively — so the skill never claims
to measure it, and re-routes only on pressure the user volunteers.
