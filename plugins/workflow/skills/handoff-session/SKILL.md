---
name: handoff-session
description: Compact this conversation into a handoff brief on disk and start a fresh session that picks the work up immediately. Use when the context window is filling up mid-task, when the user says "hand off", "/handoff-session", "start a new session on this", "continue this in a fresh session", or when the remaining work wants a different model than the one this thread is running. Covers what the brief must contain, asking model-selector for the argv, spawning a detached agent (or an Orca terminal when composed with the-orca-way), and stopping.
---

# handoff-session

One job: **move ownership of this work to a session that isn't out of room.**

Write the brief, start the successor, confirm it took the prompt, stop. You do
not stay to supervise — the whole reason you are running this is that this
context is spent.

## The three steps

1. **Write** `docs/handoffs/<slug>.md` — see [The brief](#the-brief).
2. **Spawn** a session pointed at that file — see [Starting the session](#starting-the-session).
3. **Confirm once, then stop** — see [Hand over and stop](#hand-over-and-stop).

If the user passed arguments, treat them as a description of what the next
session will focus on, and tailor the brief to that. `/handoff-session fix the
failing e2e tests` is a narrower handoff than `/handoff-session`.

## The brief

A summary of this conversation written so a fresh agent can continue the work.
Prose, not a template — say what is true, at the length it takes.

Three rules, and they are the whole contract:

- **Do not duplicate content that already exists as an artifact.** Specs, plans,
  ADRs, issues, commits, diffs — reference them by absolute path or URL. A
  paraphrase drifts from the thing it paraphrases; a path does not.
- **Include a `## Suggested skills` section** naming the skills the successor
  should invoke, with their exact invocation (`/mobile:skill-rules`,
  `/mattpocock-skills:tdd`). A cold session does not know which of your hundred
  skills this task wanted.
- **Redact secrets.** API keys, tokens, passwords, personal data. This file
  becomes another agent's prompt and sits on disk unencrypted.

What the conversation knows and the repo does not is the part worth writing:
which approaches were tried and rejected and *why*, what is verified versus
merely assumed, which files are dirty, what is running on which port. The rest
is recoverable by reading the code — that, the successor can do itself.

### Where it goes, and why it is untracked

`docs/handoffs/<slug>.md`, where `<slug>` is kebab-case and describes the work,
not the date.

Before writing, make sure `docs/handoffs/` is ignored — append the line to
`.gitignore` if `git check-ignore -q docs/handoffs/` fails. Handoff notes are
session ephemera; they are not repo history, and a mid-task handoff usually
happens on a tree you do not want to commit.

`docs/` rather than `.claude/` because the successor may be Codex, or a third
agent later. The path is not Claude's to own.

**Because the file is untracked, always pass it as an absolute path.** No other
checkout, worktree, or machine can reach it by a relative one.

## Choosing the argv

Ask [`model-selector`](../model-selector/SKILL.md) for the
`(provider, model, effort)` tuple, describing **the work that remains** — not the
work already done. A thread that has finished the exploration and left the hard
implementation is a different task than the one it started as, and often wants a
different model.

Take its paste-ready command. Do not carry a model table here; that skill reads a
live roster and this file would go stale against it.

An explicit user argument wins: `/handoff-session codex` means Codex, and
model-selector then only picks the model and effort.

## Starting the session

**Default — a detached CLI process** in the current working directory:

```bash
claude --bg -n "<descriptive name>" "Read <absolute path to brief> and do what it says."
```

Always pass `-n`/`--name`: it sets the display name in the job list, session
picker, and terminal title, and the user manages the result with `claude
agents`. Use the Codex equivalent when model-selector named Codex.

Send the **path**, never the prose. The brief already says everything; pasting it
into an argv only risks a shell mangling it, and a file survives a session that
dies.

**When composed with `/the-orca-way`** — `/handoff-session /the-orca-way` — that
skill owns the spawn instead: `orca terminal create` / `wait` / `send` / `read`,
with its own rules about one-line prompts and the confirm read. See
[`../the-orca-way/SKILL.md`](../the-orca-way/SKILL.md). Do not run the Orca
sequence from memory, and do not reach for Orca unless the user asked for it.

Never spawn with the in-process `Agent` tool. It dies with your context, which is
precisely the thing you are handing off *away* from.

### Same checkout by default

The successor continues in **this** working directory. A handoff usually happens
mid-task with a dirty tree, and a fresh worktree cannot see uncommitted work.

Cut a new worktree only if the user asks. If they do and `git status
--porcelain` is non-empty, say what would be stranded and offer to commit first
before creating it.

## Hand over and stop

Read back **once** to confirm the session actually started — the agent id from
`claude --bg`, or `orca terminal read` under the Orca way. A prompt that never
submitted looks exactly like a session working quietly.

Then print how to attach to it, and stop. Do not poll, do not relay its output,
do not merge its work. Ownership has moved; if you keep watching, nothing was
handed off and you burn the context you were trying to save.

## Self-improvement

At the end of a run, reflect on this skill and offer to file what was unclear
back to this repo — see
[`../workflow/references/self-improvement.md`](../workflow/references/self-improvement.md).
