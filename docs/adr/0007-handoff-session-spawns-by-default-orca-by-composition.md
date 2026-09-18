# handoff-session spawns a detached CLI session by default, Orca only by composition

`handoff-session` is Matt Pocock's `handoff` skill with the missing half added:
his writes a document to the OS temp directory and stops, and a human then
carries it somewhere. Ours starts the successor.

The substrate for that spawn is a **detached CLI process** (`claude --bg -n`, or
the Codex equivalent), not an Orca terminal and not the in-process `Agent` tool.
Orca is reachable by composing `/the-orca-way` into the invocation, which is what
that skill already advertises itself as: a policy you opt into, not one that
detects itself.

The alternative considered was auto-detection — run `orca agent-context --json`,
and use an Orca terminal whenever the current session is Orca-managed. It was
rejected because a plain background subagent is wanted *inside* Orca too, and a
skill that silently picks its own substrate gives no way to say so.

The in-process `Agent` tool was never a candidate. It dies with the context that
spawned it, which is exactly the thing being handed away from.

## Consequences

- **No model table here.** The `(provider, model, effort)` tuple comes from
  `model-selector`, asked about *the work that remains* rather than the work
  already done — see [0004](./0004-model-selector-advises-only.md). A handoff is
  a natural point to change model, and often to change provider.
- **The Orca mechanics are not restated.** `/handoff-session /the-orca-way`
  delegates the whole create/wait/send/read sequence, per
  [0005](./0005-the-orca-way-is-a-substrate-policy.md). Two copies of that
  sequence would disagree within a release.
- **The successor runs in the current checkout by default.** A handoff is
  mid-task work with a dirty tree; a fresh worktree cannot see uncommitted
  changes. A new worktree is opt-in and warns about what would be stranded.
- **It hands over and stops** — one confirm read, then nothing. Staying to
  supervise would spend the context the handoff exists to conserve, and would
  mean ownership never actually moved.
- **The brief's shape is Matt's, deliberately.** Free-form prose, a suggested-
  skills section, no duplication of what other artifacts already say, secrets
  redacted. A fixed section template was drafted and dropped: the upstream skill
  is well-worn and divergence here buys nothing.
- **`orca-flow` was deleted in the same commit** — it only ever worked under
  Orca. See [0009](./0009-delete-orca-flow.md). This skill is not its
  replacement and inherits none of its stage vocabulary.
