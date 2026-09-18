---
description: Advise a provider, model and reasoning effort for a task, across the Codex and Claude subscriptions.
argument-hint: "help | list | refresh | <describe the task>"
---

Use the `model-selector` skill from this plugin to handle: $ARGUMENTS

If arguments describe a task, advise a single `(provider, model, effort)` tuple
with a one-line reason and a paste-ready launch command. `list` prints the tiers
and their current members without advising. `refresh` re-runs the desk research
behind `references/model-notes.md`.

Advice only — never launch the session.
