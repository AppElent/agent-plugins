# Applying baseline through the developer CLI

Read this before running a numbered baseline step. Preserve all 16 step numbers and existing partial records.

1. Inspect the app and the installed `@appelent/dev` README/help. Run `appelent doctor --json` and `appelent capabilities --json`. Pin the reviewed CLI release before applying; preserve the rest of the dependency graph.
2. Plan the relevant recipe with `appelent recipe plan <id> --json`. Review changed files, conflicts and manual requirements. Apply supported wiring with `recipe apply`, then `recipe verify`. On custom shapes, adapt deliberately and verify the app; a failed recipe is not authorization to overwrite it.
3. Use the mapping below for old step selectors. A composite recipe may span multiple steps; inspect its plan and keep the requested scope. Do not run the whole composite for a narrow step when it would alter unrelated configuration.
4. Run target checks and relevant live/provider/browser/device checks. Record only completed legacy steps using the version read from development's baseline FEATURE.md. Preserve unrecognized feature/options fields. Keep recipe receipts and guideline reviews separate.

| Baseline steps | Mechanism |
| --- | --- |
| 1–3, 5–7 | `baseline.config` for supported mechanical configuration; review remaining script/provider/app-specific prerequisites |
| 4 | Existing `env.manifest.ts` and `env check/plan/apply/generate`; captured Infisical JSON in memory, explicit destinations |
| 8 | `baseline.preview`; preserve app seed functions, environments, branch and Worker identity |
| 9 | `baseline.issue-reporter`; inspect server token isolation and app UI integration |
| 10 | Native host run settings; setup is separate from persistent backend/web processes |
| 11 | `baseline.ci` and host adapter; preserve existing workflows/actions/permissions and managed ranges |
| 12 | Actual verification and partial adoption report; never a blind version stamp |
| 13 | Existing i18n feature and package; opt-in |
| 14 | `baseline.mobile-viewport` and browser accessibility review |
| 15 | `baseline.pwa`; source artwork, root registration and output build checks remain explicit |
| 16 | `baseline.ui-hygiene` plus [UI guidance](ui-guidance.md); review app-specific states and layouts |

`baseline.web` composes web recipes; `mobile.foundation` and `mobile.release` are separate opt-ins. Existing provider identities and routes are not starter defaults. Template output alone cannot prove an integration is ready.

For workspaces use development's dev skill when available and the installed @appelent/dev workspace documentation. T3/Orca own the worktree and host settings. Replace broad env-copy behavior with a verified setup hook; select the workspace backend explicitly and write its URLs/credential after source routing. Do not turn a parent's key into a child's deployment selection. Inspect cleanup evidence even when the checkout has already disappeared.

For capture or codebase review use development's capture-feature or workflow's scan-codebase skill when available; the CLI is responsible for deterministic changes and the skill for source-backed decisions.
