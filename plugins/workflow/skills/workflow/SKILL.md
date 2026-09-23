---
name: workflow
description: Front door for reusable engineering workflows. Use when the user asks to list or choose AppElent workflow capabilities, capture a durable workflow lesson, or route work involving reviews, audits, handoffs, dependency maintenance, model selection, or self-improvement.
---

# Workflow router

Route the request to one owner:



- `scan-codebase`: source-backed adoption gaps, engineering improvements, and product hypotheses.
- `cleaning-up-codebases`: structural cruft and architectural drift.
- `feature-gap-analysis`: competitor-backed product gap analysis.
- `handoff-session`: continue work in a fresh agent session.
- `model-selector`: choose a provider, model, and reasoning effort.
- `review-app` or `review-session`: autonomous or collaborative app review.
- `self-improve`: extract durable lessons from agent work.
- `the-orca-way`: use Orca-managed execution when explicitly requested.
- `upgrade-deps`: upgrade project dependencies safely.
- `usage-audit`: evaluate behavior against metered-service quotas.

For `list`, summarize these routes. For `show <skill>`, load that skill and
explain its contract. For `capture`, use `self-improve` and place reusable
workflow knowledge in this plugin.

For toolkit implementation or reusable feature capture, use development’s maintain-repo or capture-feature skill when available. If development is unavailable, report the required owner and preserve the task scope.

## Provider portability

Describe required capabilities—browser control, task delegation, shell access,
or issue creation—rather than assuming a named provider tool. When a workflow
contains a provider-specific branch, select the branch matching the active
environment and preserve the workflow's completion criteria.

## Self-improvement

After a workflow exposes reusable friction, read
`references/self-improvement.md` and offer to capture the lesson.
