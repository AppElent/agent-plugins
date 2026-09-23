---
name: maintain-repo
description: Use when implementing or fixing Appelent runtime packages, developer CLI recipes, shared guidelines, or the goal-based agent plugins.
---

# Maintain the Appelent toolkit

Read [repository ownership](../../references/repositories.md) and the selected checkout's contributor instructions. Preserve existing work. Runtime behavior and automation live in appelent-packages; agent guidance and the guideline source live in agent-plugins.

For packages, find the owning module and its current package scripts. Preserve native/web export boundaries. Run affected tests, typecheck, and build; use packed-consumer checks for export changes. For emitted starter code, run its formatting and generated-consumer checks.

For CLI/recipes, preserve plan/apply/verify semantics, conservative conflicts, metadata-only receipts, retries, and explicit manual acceptance. Exercise already-applied and customized states. Keep help and docs aligned with real handlers. The CLI capability list is authoritative.

For plugins, read the owning plugin README and CONTRIBUTING.md. Use the existing router; update command mappings and the feature routing catalog when ownership changes. Keep references inside the installed plugin or explicitly resolve an available external owner. Run pnpm check and the isolated-plugin checks; bump all three manifests of each changed plugin.

For shared guidelines, read guidelines/README.md in agent-plugins. Edit the central source and increment its catalog version. Run guideline validation/export and exercise CLI plan/apply/check against the new bundle. Keep app exceptions separate.

Use the sibling capture-feature skill for reusable feature capture. For codebase improvement scans, use workflow’s scan-codebase skill when available; otherwise report the missing plugin and the proposed scan scope. Consumer migration, publication, and plugin installation follow the user's actual scope; a tooling change alone does not perform them.
