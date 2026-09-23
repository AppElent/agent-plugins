---
name: web-feature
description: Use when selecting Appelent web implementation procedures, inspecting the web MCP feature, or following an existing web feature command after app-wide capabilities moved to development.
---

# Web implementation router

Read the app's instructions and its local guideline index/app.md when present. Route by responsibility:

- App setup and baseline selection, auth, i18n, app-user CLI, and developer CLI use belong to the development plugin. For an old `/web:feature apply baseline|auth|i18n|cli|dev` request, identify the new `/development:feature` owner and load it when available.
- Web baseline implementation is [web-baseline](../web-baseline/SKILL.md), retaining all 16 historical steps.
- TanStack localization implementation is [web-i18n](../web-i18n/SKILL.md).
- MCP is this plugin's local feature: read [its FEATURE](../mcp/FEATURE.md) and [procedure](../mcp/SKILL.md).

For list/show/steps, report only available source evidence. For MCP apply, inspect existing configuration, follow the procedure, verify, and record the current FEATURE version only after completion. For a step-scoped baseline request, preserve the existing step numbers and obtain the owning FEATURE version from development before updating adoption records.

Missing development does not block web review or reading these platform procedures. It does block guessing the moved features' versions or claiming full app-wide adoption. Identify the missing owner explicitly.

For contribution capture use development's capture-feature when available. For source edits, resolve APPELENT_PLUGINS_PATH or a user-provided agent-plugins checkout; validate its marketplace/plugins tree. Runtime code and API documentation belong to the separate appelent-packages checkout. Bump all three manifests of each changed plugin and run pnpm check.

For issue/issues/fix, use [web-project](../web-project/SKILL.md)'s procedure, targeting AppElent/agent-plugins for skill guidance and the runtime repository for package bugs. External issue creation requires user scope.

## Self-improvement

Follow [the reflection](references/self-improvement.md) once per invocation.
