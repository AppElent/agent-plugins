# One-line prompts, long briefs on disk

Anything sent to a spawned Orca terminal with `terminal send --text` is a single
line. A newline **submits** in a TUI, so an embedded newline delivers a truncated
prompt and strands the remainder as a second message. If the brief runs longer
than a sentence or two, it is written to a file and the terminal receives the
path.

Two skills in this repo had contradicted each other on this. `the-orca-way`
required the whole brief inline as one long line; `orca-flow` refused inline
prose entirely, sending only `docs/flows/<slug>/NN-*.md` on the grounds that a
long `--text` payload through a TUI is fragile and a brief on disk survives a
session that dies. Both were right about their own case and neither stated the
rule underneath.

The rule underneath is the length rule, and both existing behaviours are
instances of it: `orca-flow`'s briefs are always long, so they are always files;
an ad-hoc "go fix the flaky test in X" is short, so it goes inline.

## Consequences

- **Where the file goes** defers to whatever is being composed with. `orca-flow`
  keeps `docs/flows/<slug>/`. Only when there is no convention does
  `the-orca-way` supply one: `docs/briefs/<slug>.md`.
- **A brief must be committed to the base branch before `worktree create`.** A
  child worktree is a checkout of a branch, so an uncommitted file in the parent
  is not visible there at a relative path. The alternative — sending an absolute
  path — works on one machine and is the fallback, not the default.
- **Briefs are reviewable artifacts**, which means secrets must be redacted. Every
  brief becomes another agent's prompt.
- A related read-back rule follows from the same fragility: after `send`, read the
  terminal **once** to confirm the prompt was submitted rather than left in the
  input buffer, then stop. A stranded prompt is indistinguishable from a working
  session, and the in-process `Agent` tool has no equivalent failure. Looping is
  forbidden; whether to wait for the *result* belongs to the composing skill, and
  `orca-flow`'s stricter "never read back after a handoff" wins when it is the
  caller.
