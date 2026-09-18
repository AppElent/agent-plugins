# Handoff briefs are untracked, under docs/, and passed by absolute path

A handoff brief goes to `docs/handoffs/<slug>.md`, and `handoff-session` ensures
`docs/handoffs/` is in `.gitignore` before writing one.

`docs/` rather than `.claude/` because the successor may be Codex, or a third
agent later; the directory is not one agent's to own. Untracked rather than
committed because a brief is session ephemera — it records that a thread ran out
of room, which is not something the repo's history should carry — and because a
mid-task handoff usually happens on a tree the user does not want to commit.

The ignore line is scoped to `docs/handoffs/`, never to `docs/` or `.claude/`;
projects commit both.

## Consequences

- **The spawn prompt always carries an absolute path.** An untracked file does
  not exist in any other checkout, worktree, or machine. This is the one place
  the skill diverges from [0006](./0006-one-line-prompts-briefs-on-disk.md),
  whose briefs are committed so a child worktree can read them relatively.
- **A handoff into a new worktree still works**, because the absolute path
  resolves back to the parent checkout on the same machine. It does not survive
  the machine boundary — a handoff to a cloud or remote session needs the brief
  committed, and that is a deliberate manual step, not a default.
- **Nothing prunes the directory.** Stale briefs accumulate and are invisible to
  git. A skill that deletes files the user did not name is a worse surprise than
  a directory that grows.
- **The user's global rule about never committing secrets still binds the
  file's contents.** Untracked is not unencrypted-safe: the brief becomes another
  agent's prompt, so redaction is required regardless of tracking.
