---
name: baseline
description: Use when scaffolding or adopting an Appelent app and choosing shared developer tooling, guideline sets, and the appropriate web or native baseline.
---

# Set up an Appelent app

Read `FEATURE.md` and [working with apps](../../references/working-with-apps.md). Inspect existing package targets, app identity, environment manifests, and workspace settings. Preserve deliberate customization.

Use the actual `appelent --help` and `capabilities --json` output to choose supported operations. For a new app, preview `create`; for an existing app, plan explicit recipe capabilities. Default adoption can include the web baseline, so use explicit capabilities for a native-only or narrowly scoped request.

- **Web:** load the web plugin's `web-baseline` skill. It retains all 16 historical numbered steps and maps mechanical parts to CLI recipes. The existing `baseline` feature ID and partial step records still refer to that web procedure. For `--step`, obtain the step list from web-baseline's `## Task`, never from this router.
- **Native:** load the mobile plugin's `mobile-foundation` skill. Select `mobile.foundation` and, when release configuration is requested, `mobile.release`. Native-only work records mobile-foundation, not completion of the web baseline.
- **Both:** apply each target's requirements and report their evidence separately. Share domain modules where the app already does so.

When a required platform skill is unavailable, complete read-only inventory and supported CLI previews, then report the missing procedure. Do not mark the feature adopted from an incomplete procedure.

During setup, select the general and applicable web/mobile guideline sets from a reviewed versioned bundle. Run `guidelines plan`, then `apply` within the requested scope, then `check`. Keep app-specific decisions in app.md.

Keep the established credential mechanism: captured Infisical JSON in memory and explicit manifest destinations. T3/Orca own worktree creation and native workspace settings; the CLI prepares and cleans app resources. Host setup and persistent dev servers are separate.

Finish with recipe verification plus relevant app/provider/browser/device checks. Record only completed numbered steps and target adoption, preserving unknown app metadata.

## Self-improvement

Follow [the catalog reflection](../development-feature/references/self-improvement.md) once per invocation.
