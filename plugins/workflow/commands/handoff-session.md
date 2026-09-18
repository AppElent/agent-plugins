---
description: Compact this conversation into a brief on disk and start a fresh session that continues the work.
argument-hint: "[what the next session will focus on] [/the-orca-way]"
---

Use the `handoff-session` skill from this plugin to handle: $ARGUMENTS

Any arguments describe what the next session should focus on — tailor the brief
to that. Composing `/the-orca-way` into the invocation makes the successor an
Orca terminal instead of a detached CLI process; that skill then owns the spawn.

Hand over and stop. Never stay to supervise the session you started.
