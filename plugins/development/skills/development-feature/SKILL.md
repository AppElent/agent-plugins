---
name: development-feature
description: Use when listing, inspecting, or applying Appelent app capabilities, including baseline, auth, localization, developer tooling, and native foundation.
---

# App capability catalog

Read [the routing catalog](../../features.json). Each entry identifies the plugin/skill that owns its FEATURE.md; procedure overrides identify where legacy numbered steps live. This catalog is routing metadata, not the executable recipe catalog.

Resolve another plugin through the skills actually available in the session, or an explicitly identified agent-plugins source checkout. If an owner is unavailable, report it as unavailable rather than treating its feature as missing from the app or guessing its version. This plugin's own skills are siblings of this folder.

## Locating source checkouts

For guidance contributions, use APPELENT_PLUGINS_PATH, an ancestor checkout containing the Appelent marketplace and plugins/, or a user-provided path. Verify the checkout before writing; installed caches are read-only references. For executable changes, use the separate APPELENT_PACKAGES_PATH and verify its packages/ workspace. See [working with apps](../../references/working-with-apps.md).

## list / show <feature>

For list, read each available owner's FEATURE.md and show name, description, feature version, owner, and app-recorded coverage when available. A package field means runtime-backed; otherwise describe the actual guided/recipe capability. Guidelines and utility skills are not installed app features.

For show, summarize the selected FEATURE's current contract and relevant changelog. Do not infer supported stacks from a feature name.

## steps <feature>

Read the owner's SKILL.md, or the procedure override in features.json. Parse existing `### N. Title` headings under `## Task`. Baseline's override is web-baseline; preserve its 16 historical numbers. If there are no such headings, explain that the procedure has no numbered selectors.

## apply <feature> [--step <n>[,<n>...]] [--update] [options]

1. Read the owning FEATURE.md, app instructions, local guidelines, and existing appelent.json. Confirm the requested target/variant is supported; clarify a materially different unsupported stack rather than silently converting the app.
2. Compare recorded and current feature versions. For an update, read intervening changelog entries and preserve intentionally customized source. Package semver, feature versions, recipe receipts, and guideline versions are separate.
3. Load the owning skill and any required platform procedure. Inspect the installed CLI's help/capabilities, plan supported automation, resolve conflicts, apply the requested scope, and verify. A missing recipe does not imply that the feature cannot be integrated through documented package APIs.
4. Record only completed requirements. Preserve existing feature IDs, unknown fields, options, and partial steps. For --step validate the requested numbers first, run shared prerequisites, and merge completed numbers without claiming unexecuted steps. Remove a partial steps array only when every required step at that version is verified.
5. Report app checks and remaining external/device acceptance separately from configuration receipts. Follow the common target-coverage rules in working-with-apps.

For --all, require explicit user scope and a verified source checkout's projects.json registry. Process its registered paths, report missing paths, and keep each app's changes and evidence separate. Do not register new apps or commit changes merely because a capability was applied.

## capture / issue / issues / fix

For reusable implementation capture, use the sibling capture-feature skill. Guidelines are centrally authored in agent-plugins/guidelines, executable code in appelent-packages, and app-only behavior in the app.

For issue/ issues/ fix, use [development-project](../development-project/SKILL.md)'s issue procedure with AppElent/agent-plugins as the explicit target for skill/catalog problems. Runtime package/CLI issues target AppElent/appelent-packages. Creating an issue or comment requires user scope.

## Self-improvement

Follow [the reflection](references/self-improvement.md) once per invocation.
