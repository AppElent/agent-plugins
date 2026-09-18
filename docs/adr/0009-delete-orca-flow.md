# Delete orca-flow

`orca-flow` ran a feature through plan, design, prototype and build as four
sessions in one Orca worktree, each stage handed to the next by a committed
brief. It is removed, along with `commands/orca-flow.md` and its five
`references/` files.

It only ever worked under Orca. Every stage boundary was an `orca terminal
create` / `wait` / `send`, so outside the Orca app the skill had nothing to do —
and the part that was genuinely valuable, *a stage boundary is a document*, does
not need Orca at all.

`handoff-session` keeps that part and drops the rest: it writes a brief and
starts one successor session, on whatever substrate is asked for. It does not
inherit the four-stage sequence, the `docs/flows/<slug>/NN-*.md` numbering, or
the stage vocabulary — see
[0007](./0007-handoff-session-spawns-by-default-orca-by-composition.md).

## Consequences

- **The staged plan→design→prototype→build sequence is gone**, not relocated.
  Nothing in the toolbox now asks whether a UI decision is undecided or insists
  a prototype run behind Labs on fixtures before promotion. That was real
  judgment; it is recorded here so its absence is a choice rather than an
  oversight, and so a future skill can pick it up deliberately.
- **Existing `docs/flows/` directories are orphaned.** They stay readable as
  plain markdown; no skill routes on them any more, and a path to one is now
  just a document to read.
- **Earlier ADRs are left as written.** [0004](./0004-model-selector-advises-only.md)
  and [0006](./0006-one-line-prompts-briefs-on-disk.md) name `orca-flow` as the
  executor and as a brief-location convention. They were accurate when decided
  and are not rewritten; this ADR supersedes those references. The live prose in
  `model-selector` and `the-orca-way` was updated to point at `handoff-session`
  instead, because that text routes behaviour rather than recording history.
