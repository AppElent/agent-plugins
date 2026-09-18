---
name: self-improve
description: "Extract durable lessons from the current session — or sweep the project's past sessions when asked — and route each one to the right knowledge layer (project CLAUDE.md, global CLAUDE.md, auto memory, an existing skill, or a new skill). Use when the user asks to \"self-improve\", \"distill this session\", \"distill past sessions\", \"sweep past sessions\", \"extract lessons\", \"save learnings\", \"update CLAUDE.md with what we learned\", \"capture session insights\", \"remember this for next time\", \"update skills from this session\", or \"what did we learn\"."
---

# Self-improve

Turn what happened in a session into knowledge that survives it. Every lesson lands in
**exactly one** place, chosen deliberately — knowledge scattered across three layers is
knowledge nobody trusts.

Work through the six steps in order. Do not skip Step 5: nothing is written before the
user approves the plan.

## Step 1 — Detect the knowledge layers

Find every destination that exists *before* deciding where anything goes. Read what you
find; a lesson already written down is not a lesson.

- **Project instructions** — `CLAUDE.md` / `AGENTS.md` at the repo root, plus any nested
  ones in subdirectories (`find . -name 'CLAUDE.md' -o -name 'AGENTS.md'`, excluding
  `node_modules`). Resolve symlinks — a `CLAUDE.md` pointing at `AGENTS.md` is one file,
  not two.
- **Global instructions** — `~/.claude/CLAUDE.md` (cross-project preferences and rules).
- **Auto memory** — `~/.claude/projects/<encoded-project-root>/memory/`. The encoded name
  replaces every path separator and punctuation character with `-`
  (`D:\Dev\gather` → `D--Dev-gather`). Don't compute it if you can avoid it: the path is
  usually stated in your context, otherwise `ls ~/.claude/projects/` and match. Read
  `MEMORY.md` — it is the index, one line per memory.
- **Skills** — list the directories, don't read them yet:
  - project: `.claude/skills/*/`
  - global: `~/.claude/skills/*/`
  - plugin-owned: anything under a plugin install directory, plus any project-local copy
    of a plugin skill. **Never edit files inside a plugin's own install directory.** A
    lesson about a plugin skill goes to the local copy, and the plan says the upstream
    source needs the same change.
- **Issue tracker / backlog** — does the project track work in GitHub Issues (`gh` works
  and a `docs/agents/issue-tracker.md` or similar exists), or in a checked-in backlog
  file? This is where *work to do* goes, as opposed to *knowledge*.

## Step 2 — Gather evidence, then scan

### Recover what was compacted away

Skip if the whole conversation is still visible. Otherwise the earliest part of the
session — usually where the corrections are — is gone from your context but still on
disk. Spawn a subagent and give it: the absolute project root, one distinctive phrase
from the part of the conversation you *can* see (so it can identify the right
transcript), and the instruction to read `references/transcript-miner.md` and follow it.

### Sweep past sessions

Only when the user asked for more than the current session. Then:

1. Find the newest modification time in the memory directory — that is roughly how far
   back the last distillation got to.
2. Use `AskUserQuestion` to confirm: sweep since that timestamp, or sweep the whole
   history.
3. Spawn a subagent with the absolute project root, the ISO-8601 cutoff (or `none`), and
   the instruction to read `references/transcript-miner.md` and follow its sweep process.

### Scan for lessons

In priority order — the top of this list is where the real signal is:

1. **Corrections** — where the user interrupted, said "no", "actually", "stop", "that's
   not what I meant", or reverted something you did.
2. **Repeated guidance** — anything the user had to say more than once.
3. **Skill-shaped knowledge** — domain expertise, tool or API integration details,
   decision frameworks, content templates, multi-step workflows.
4. **New workflows** — a novel procedure, coordination pattern, or automation that worked.
5. **Preferences** — formatting, naming, style, tool and library choices.
6. **Failure modes** — an approach that failed, *and* what worked instead. Both halves,
   or it isn't a lesson.
7. **Domain knowledge** — facts or conventions you needed and did not have.
8. **Improvement opportunities** — refactors, missing tests, performance problems,
   review findings that were deliberately skipped.
9. **Reviewer feedback** — from people whose judgement the project defers to.

**Now** read the `SKILL.md` of every skill you listed in Step 1. You need to know what
they already say before you can tell an addition from a duplicate.

## Step 3 — Filter

Keep a candidate only if it is all five:

- **Stable** — likely still true next month.
- **Non-obvious** — you would not have known it anyway.
- **Actionable** — expressible as a rule or an instruction, not an observation.
- **Not already documented** — absent from the instruction files, skills, and memory you
  read in Steps 1 and 2.
- **Still a concern** — not already resolved by a change made during this session.

Discard session-specific detail, speculation, and one-offs.

One exception to "still a concern": a workflow that *succeeded* stays a candidate. The
fact that it worked is the reason to write it down.

## Step 4 — Route each lesson to exactly one destination

**Skill-first rule (mandatory).** Before consulting the table, ask: does this lesson
correct, refine, or add a guardrail to an existing skill's behavior? If yes, it goes to
that skill. Stop there.

| Destination | What belongs there |
|---|---|
| **Existing skill** | Corrections to its instructions, a missing edge case, a sharper trigger condition, a supporting file it should carry. |
| **New skill** | A cohesive body of knowledge with a clear trigger — too large for a CLAUDE.md section, and needed only sometimes. |
| **Project `CLAUDE.md`** | Intentional project decisions: conventions, architecture, stack choices, build and deploy setup, module boundaries, rules a contributor must follow. |
| **Global `~/.claude/CLAUDE.md`** | A preference or rule that is about *the user*, not this repo, and holds across projects. |
| **Auto memory** | Discovered knowledge with no skill home: API quirks, debugging workarounds, compiler and tooling gotchas, environment pitfalls, user preferences. One fact per file, following the memory file conventions (frontmatter, `type`, `MEMORY.md` pointer line). |
| **Issue tracker / backlog** | *Work to do*, not knowledge: the refactor, the missing test, the performance fix. |

Tiebreakers, in order:

1. Corrects a skill → the skill. Hard rule, beats everything below.
2. Skill vs. CLAUDE.md → the skill. CLAUDE.md is loaded every session; a skill is loaded
   when it's relevant. Prefer the one that costs nothing when it isn't needed.
3. Skill vs. auto memory → the skill.
4. CLAUDE.md vs. auto memory → CLAUDE.md for a *decision the project made*, auto memory
   for a *gotcha you discovered*.
5. Project vs. global CLAUDE.md → project, unless it would be equally true in a repo that
   shares none of this code.
6. Knowledge vs. work → if the fix is a code change somebody must make, it's an issue,
   not a paragraph.

## Step 5 — Present the plan and get approval

Print a table, then ask. Write nothing first.

```
| # | Lesson | Destination | Action |
|---|--------|-------------|--------|
| 1 | ...    | ...         | append / update in place / new file |
```

Name the exact target file or skill in the Destination column. Then use
`AskUserQuestion` to get **Approve** or **Reject** — and take a reject as a reject, not
as an invitation to renegotiate.

## Step 6 — Execute, in this order

Track the remaining items with your todo tool.

1. **Issues / backlog entries** — file them first, while the context is still exact.
2. **Auto memory** — read the target (or `MEMORY.md`) first; add or update one fact per
   file, then the one-line pointer in `MEMORY.md`.
3. **CLAUDE.md / AGENTS.md** — read the file, find the section it belongs in, and edit
   there. A new top-level section is a last resort.
4. **Existing skill updates** — edit the skill's own files. Use `skill-creator` if the
   change is structural.
5. **New skills** — use `skill-creator`, and give it the trigger conditions and the
   session context that produced the lesson.
6. **Plugin-skill lessons** — apply to the local copy, then tell the user which upstream
   source (catalog repo, plugin repo) needs the same change. Do not edit the plugin's
   install directory.

## Writing conventions

- **Match the tone of what's already there.** A file that reads as terse imperative rules
  does not get a new paragraph that reads as an essay.
- **Imperative mood.** "Call the preset by name" beats "presets should be called by name".
- **Write the rule, not the anecdote.** The session is the evidence, not the content. One
  concrete example is allowed when the rule alone would be ambiguous.
- **Say what would falsify it.** A rule with no failure mode attached is a preference;
  say which mistake it prevents.
- **Formality follows the destination.** CLAUDE.md is read by every contributor and every
  session — it earns full sentences. A memory file is a note to yourself.
- **Never invent a lesson to fill the table.** "Nothing durable came out of this session"
  is a valid and frequent outcome. Say it and stop.

## Self-improvement

See `skills/workflow/references/self-improvement.md`.
