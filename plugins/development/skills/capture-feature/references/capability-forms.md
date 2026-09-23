# Choosing a capability's form

Read this when capturing a capability, comparing app implementations, or deciding where a scan finding belongs.

| Form | Put here when | Evidence of completion | Upgrade behavior |
| --- | --- | --- | --- |
| Runtime package | Multiple apps need the same behavior and a narrow stable interface | Behavioral tests, consumer typecheck/build and relevant runtime exercise | Dependency release; versioned public API |
| Recipe | The app should own the resulting source or integration | Reviewed diff, recipe verification, app integration checks | Explicit migration; customized source produces a conflict |
| Configuration | Tool policy or host setup has deterministic keys | Parsed config and target-tool validation | Merge managed keys and preserve unknown values/comments |
| Developer command | Repeated operations need ordering, ownership, retries or cleanup | Failure/retry/isolation tests and a development pilot | Pinned CLI release; retain metadata compatibility |
| Guideline | Correctness depends on content, design intent or judgment | Scoped review with examples and exceptions | Revised guidance, followed by another review |
| Skill | An agent must choose options, handle conflicts or interpret evidence | Representative task exercises with a concrete output | Plugin revision; call the CLI for mechanical operations |
| Check | A specific invariant can be observed | Positive and negative fixtures; report coverage limits | Check revision independent of feature installation |

A feature may combine these. Keep the runtime API, recipe revision, guideline review, and device acceptance separate. CLI receipts prove only their named mechanical checks. Preserve unknown app metadata and legacy partial baseline steps; never convert a partial record to complete just because a package was installed.

For initial content loading, guidance can call for a skeleton that matches the eventual content. A shared primitive handles animation and accessibility; the app owns its shape. Background refresh retains useful content. Mutations need pending/success/failure feedback. A skeleton import alone proves none of these behaviors.

A reusable contribution includes its evidence from real source, supported shapes/options, ownership boundary, prerequisites, conflict behavior, verification, upgrade path, and a consuming-app example. Keep app identifiers, domain models, navigation, copy, provider projects and signing credentials out of shared defaults.

Implementation lives in the appelent-packages repository's `packages/`; callable recipes live in its `packages/dev/src/recipes/`. Skills and central guideline sets live in agent-plugins. The current CLI's capability list is authoritative for supported automation. `FEATURE.md` explains the composed feature; `SKILL.md` selects and reviews it. Guideline sets are authored in agent-plugins/guidelines and deployed with a versioned receipt; installing their text is not evidence of UI conformance.
