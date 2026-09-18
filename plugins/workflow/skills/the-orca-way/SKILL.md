---
name: the-orca-way
description: Route work through Orca-managed surfaces instead of the agent's private ones — Orca worktrees not raw git worktrees, Orca terminals not in-process subagents or background Bash, Orca's browser and editor not hidden tool panes. Use when, and only when, the user explicitly invokes it — appends "the orca way" or "/the-orca-way" to an instruction ("implement this in a worktree /the-orca-way", "run the dev server the orca way", "start the app the orca way", "/mattpocock-skills:implement /the-orca-way") — or literally says "spawn an orca session", "one worktree per ticket", "start a terminal with claude/codex and prompt it". Never load it because Orca happens to be installed or the cwd is an Orca worktree. This is a substrate policy, not a method — it never decides whether to use a worktree, run a command, or open a page, only that if you do, it happens in Orca where the user can see, take over, and resume it. Covers the substitution table, the terminal create/wait/send sequence, the command-in-a-terminal sequence, issue linking on the worktree, prompt shape, and the one confirm read.
---

# The Orca way

A **policy**, not a method. It answers one question — *where does this run, and
where does the user see it?* — and nothing else.

**Opt-in only.** This skill applies when the user invoked it in the current
instruction. Being inside an Orca worktree, having used it earlier in the
conversation, or noticing that `orca` is on PATH is not an invocation. Without
the words, use your ordinary tools.

The principle behind every row below: **if the user could want to watch it, stop
it, take it over, or come back to it later, it lives in Orca, not inside your
context.** Your Bash tool, your `Agent` tool, your browser pane, and your
`run_in_background` all die with you and are invisible to the user. Orca's
terminals, worktrees, tabs, and editor are visible, resumable, and survive you.

## The substitutions

| Something already decided | Then | Never |
| --- | --- | --- |
| a worktree is needed | `orca worktree create` | `git worktree add` |
| a subagent is needed | `orca terminal create` + `wait` + `send` | the in-process `Agent` tool |
| a command the user asked to run (start the app, dev server, watcher, build, tests, migration) | `orca terminal create --worktree active --command "<cmd>"` | Bash `run_in_background`, `preview_start`, a dev server hidden in your own shell |
| the user should see a page (local app, preview, deployed site) | `orca tab create --url` then `snapshot` / `screenshot` | the Claude Browser pane, Playwright MCP, describing the page from a curl |
| the user should see a file or a diff | `orca file open` / `orca file diff` | pasting the file into chat |
| a simulator or native app is driven | `orca emulator …` / `orca computer …` | `agent-device`, the computer-use MCP |
| the same prompt should run on a schedule | `orca automations create` | `/loop`, `CronCreate`, `ScheduleWakeup` |
| the work's state changes (started, in review, done) | `orca worktree set --workspace-status` / `--comment` | leaving the board stale |

That is the whole policy. While this skill is active the in-process `Agent` tool
is **prohibited** for spawning work, and the user-requested command is never run
where the user cannot see it.

**What stays in Bash:** commands you run to *inform yourself* — `git status`,
`cat`, `grep`, a quick `node -e`. The user did not ask for those and does not
need a tab for each. The line is *who asked*: if the user said "run X", X goes in
an Orca terminal; if you need X to decide your next step, Bash is fine.

## What this skill does not decide

It does not decide **whether** to cut a worktree, **whether** to fan out, whether
to start the app, which browser page to open, how many sessions to start, how to
partition the work, or how to verify and merge the result. Those belong to
whatever it is composed with.

**When composed with another skill** — `/mattpocock-skills:implement
/the-orca-way`, `/run /the-orca-way`, and the like — *that skill governs how the
work is done; this one governs where it runs.* If the composing skill spawns a
session, pass its invocation through into the prompt you send, so the child runs
it in its own context. Do not run the other skill yourself.

There is deliberately no ticket or spec vocabulary here. The composing skill
supplies the ask; this skill only carries it across — and, when the ask names an
issue, links it on the worktree card so the board knows too.

## A command, the Orca way

"Start the app the orca way", "run the tests the orca way", "run the migration
the orca way" all mean the same thing: the command runs in a fresh Orca terminal
in the active worktree, titled so the user can find the tab.

```bash
# 1. Create the terminal with the command as its startup argv
orca terminal create --worktree active --title "<what it is: dev, test, migrate>" \
  --command "<the command>" --json          # note the returned handle

# 2a. Long-running (server, watcher, emulator): confirm it came up, then leave it
orca terminal wait --terminal <handle> --for tui-idle --timeout-ms 60000 --json
orca terminal read --terminal <handle> --screen --json

# 2b. One-shot (build, test run, migration): wait for exit, then read the result
orca terminal wait --terminal <handle> --for exit --timeout-ms 600000 --json
orca terminal read --terminal <handle> --screen --json
```

- Use `--worktree active` unless the user named another worktree. The command
  runs in the checkout the user is looking at.
- `--title` is not optional in practice. An untitled tab running `pnpm dev` is
  indistinguishable from the three others already open.
- Long-running: **do not** `terminal wait --for exit` — it will not exit, and
  you will sit there until the timeout. Wait for `tui-idle`, read the screen once
  to confirm it is serving (a port, a "ready" line) or has failed, report that,
  and stop. **Never `terminal close`** a server the user asked to start; it is
  theirs now.
- One-shot: read `--screen` after exit, quote the actual failure if there is
  one, and do not silently re-run the same command in Bash "to see what
  happened" — the user can read the tab.
- If the command needs a URL opened afterwards (a dev server), see the next
  section; a server without a tab is half the work.
- `--command` takes the argv verbatim — no `cd`, no shell wrapper. The terminal
  starts in the worktree already.

## A page, the Orca way

When the user should look at something in a browser — the app you just
started, a preview deployment, a doc — open it in Orca's embedded browser, in the
same worktree, so the tab sits next to the terminal that serves it:

```bash
orca tab create --url "<url>" --worktree active --json
orca snapshot --json          # accessibility tree with @e refs, for you
orca screenshot --format png  # what the user sees, for the user
```

Use `snapshot` to verify structure and `screenshot` when the answer depends on
how it looks. Everything past opening and verifying — clicking through flows,
filling forms — is the `orca-cli` skill's browser section.

To put a file or a diff in front of the user instead of a page:

```bash
orca file open <path> --worktree active
orca file diff <path> --worktree active     # unstaged; add --staged for staged
```

## An agent session, the Orca way

### Choosing the argv

	erminal create` needs a `--command`. Ask `model-selector` for the
`(provider, model, effort)` tuple and use the paste-ready command it returns —
see [`../model-selector/SKILL.md`](../model-selector/SKILL.md). Do not carry your
own model table; that one is kept current against a live roster and this one
would go stale.

### The sequence

Each step below exists because omitting it fails **silently** — the session looks
fine and no work happens.

```bash
# 1. Worktree, when one is needed, as a child of the current one
orca worktree create --name <slug> --base-branch <base> \
  --parent-worktree active --setup run --json

# 2. Terminal running the agent (use the path: selector for a new worktree,
#    or --worktree active to run in the current checkout)
orca terminal create --worktree "path:<worktree-path>" --title "<short label>" \
  --command "<argv from model-selector>" --json   # note the returned handle

# 3. Wait for the TUI. The flags are --for and --timeout-ms.
orca terminal wait --terminal <handle> --for tui-idle --timeout-ms 180000 --json

# 4. Send the prompt and submit it
orca terminal send --terminal <handle> --text "<one line>" --enter --json

# 5. Confirm it actually started
orca terminal read --terminal <handle> --json

# 6. Move the card so the board reflects it
orca worktree set --worktree "path:<worktree-path>" --workspace-status in-progress --json
```

- `terminal create` has **no `--prompt`**. Only `worktree create` does. Steps 3-4
  are how a terminal gets its instruction.
- Skipping step 3 races TUI startup and the prompt is swallowed with no error.
- The flags are `--for` and `--timeout-ms`. `--condition` and `--timeout` are
  rejected.
- `--setup run` installs dependencies; without it the child starts with no
  `node_modules`.
- Pass `--activate` or `--focus` only when the user asked to watch. By default
  nothing steals their focus.
- **Link the issue.** If the ask names a GitHub issue number, a Linear
  identifier (`STA-335`), or a Linear URL — in the prompt, the brief, the branch
  name, or the composing skill's ticket — pass it as `--issue` or
  `--linear-issue` on `worktree create`. The card then shows the ticket, and
  `issue:<number>` becomes a usable selector for every later call. Do not guess
  an issue from vague context; if there is none, omit the flag. To link a
  worktree that already exists: `orca worktree set --worktree <sel> --issue <n>`.
- Use exactly one handle per terminal. On `terminal_handle_stale`, re-acquire
  with `orca terminal list --json` and continue with the **replacement only** —
  never dual-send to an old and a new handle.

Everything else about the CLI — selectors, card updates, the runtime — is the
`orca-cli` skill's, and `orca agent-context --json` is authoritative over both.

### The prompt is always one line

A newline **submits** in a TUI. An embedded newline sends a truncated prompt and
strands the rest as a second message.

So: whatever goes in `--text` is a single line. If the brief is longer than a
sentence or two, write it to a file and send the path instead of the prose:

```bash
--text "Read <path> and do what it says."
```

A brief on disk also survives a session that dies; prose typed into a TUI does
not.

**Where the file goes:**

1. The composing skill's own convention wins — `handoff-session` writes
   `docs/handoffs/<slug>.md`, so under it nothing changes.
2. No convention → `docs/briefs/<slug>.md`.
3. **Commit it to the base branch before `worktree create`.** A child worktree is
   a checkout of a branch; an uncommitted file in the parent is not visible there
   at a relative path. If you are not committing it, send an absolute path.

Redact secrets. Every brief becomes another agent's prompt.

### The session you spawn is cold

It has none of your context and cannot see the conversation that led here. Say,
in whatever the composing skill's brief already covers: the ask; the worktree
path and branch and that it works only there; **commit incrementally, never one
commit at the end** — sessions die and uncommitted work is the only work that
gets lost; and whether it may push or open a PR.

Point at context by absolute path rather than paraphrasing it. Duplicated context
goes stale.

### One confirm read, never a loop

Step 5 exists because a prompt can sit unsubmitted in a TUI input buffer, and a
stranded prompt looks exactly like a working session. The in-process `Agent` tool
cannot fail this way; a terminal can. So read **once**, confirm it started, and
stop.

Do not poll in a loop. Whether to wait for the *result* is the composing skill's
decision, not this one's — `handoff-session`, for instance, forbids everything
after the one confirm read, and that stricter rule wins when it is the caller.

If a session dies mid-flight, its worktree keeps everything: re-launch in the
same worktree and tell it what its own working tree already contains, so it
re-reads those files instead of assuming they are absent.

## Status is part of the work

A worktree has a card on the Orca board. When this skill moves work — spawns a
session, finishes a merge, hands something back for review — move the card with
it: `orca worktree set --worktree <selector> --workspace-status
todo|in-progress|in-review|completed`, and `--comment "<one line>"` for anything
the next person opening the card should know (the brief path, the PR URL, why it
is parked). A board that says "todo" over a session that finished an hour ago is
the same silent failure as a stranded prompt.

## Where this stops

- **Coordinating** several sessions — waiting on results, dispatching tasks,
  gates — is the `orchestration` skill's. This skill fires and confirms.
- **Driving** the browser, emulator, or desktop beyond opening and verifying is
  the `orca-cli` and `computer-use` skills'.
- **Full handoffs** of this conversation are `handoff-session`'s; compose it with
  this skill and it spawns the Orca way.

## Self-improvement

At the end of a run, reflect on this skill and offer to file what was unclear
back to this repo — see
[`../workflow/references/self-improvement.md`](../workflow/references/self-improvement.md).
