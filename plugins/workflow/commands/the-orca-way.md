---
description: Run worktrees and subagent sessions as Orca-managed ones — a substrate policy, not a method.
argument-hint: "<the instruction to run the orca way>"
---

Use the `the-orca-way` skill from this plugin to handle: $ARGUMENTS

It is a substrate policy: it decides only *where* work runs, never whether to
use a worktree or how to split the work. If arguments name another skill or
task, that governs how the work is done — pass its invocation through into the
prompt sent to the spawned session.
