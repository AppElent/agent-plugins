# the-orca-way is a substrate policy, not a method

	he-orca-way` owns one question — *where does this run?* — and no others. If a
worktree is needed it is `orca worktree create`; if a subagent is needed it is
`orca terminal create`. It does not decide whether to cut a worktree, whether to
fan out, how many sessions to start, how to partition files between them, or how
to verify and merge the result.

The skill it was refactored from did decide all of that. It was written around
one shape of work — one ticket, one worktree, one terminal, a coordinator who
merges — and carried the vocabulary to match: ticket numbers, spec numbers,
sibling ownership, task graphs. That made it unusable for anything that was not
that shape, even though the part people actually wanted from it ("use Orca, not
raw git") applies to every shape.

Splitting *where* from *what and how* is what makes it composable. `/…implement
/the-orca-way` now means the implement skill governs the work and this one
governs the substrate, with no negotiation between them.

## Consequences

- **The model table is gone.** Choosing an agent and model is delegated to
  `model-selector`, which is kept current against a live roster. A second table
  here would go stale and then disagree, and see also
  [0004](./0004-model-selector-advises-only.md) — that skill advises, this one
  turns the tuple into `--command` argv.
- **Planning judgment was deliberately dropped**, not forgotten: clean-and-green
  base branches, knowing the task graph, partitioning ownership by files, shared
  physical resources (ports, emulators, databases), and the verify/merge/`worktree
  rm` lifecycle. All of it is good advice and none of it is this skill's. It is
  recorded here so it does not creep back in the next edit.
- **The in-process `Agent` tool is prohibited while the skill is active.** Without
  saying that outright the substitution is only advisory, and an agent will reach
  for the tool it already has.
- **The name survives the refactor** even though it breaks the repo's verb-first
  convention. It is an established invocation phrase, and a policy skill's job is
  to be named in passing as a modifier on another instruction.
