# Contributing

Choose the owner before editing:

- development: app-wide setup, auth, localization, app-user CLI integration, developer CLI operation, reusable feature capture, and toolkit maintenance.
- web: web-specific procedures and browser guidance.
- mobile: native foundation, design, QA, audits, and release guidance.
- workflow: reviews, codebase scans, handoffs, and other engineering procedures.
- guidelines/: reusable rules deployed as pinned app-local files; read guidelines/README.md.
- Runtime implementation and recipes: the separate AppElent/appelent-packages repository. The old runtime copies/publisher in this repository are pending a separate publishing cutover; do not develop new behavior in those copies.

Each skill has SKILL.md frontmatter with a unique name matching its folder and a description stating when to use it. Put required resources inside that plugin. Cross-plugin routes name the external owner and explain what to do if it is unavailable; never assume sibling cache paths.

A capability that records app adoption owns one FEATURE.md with name, positive integer version, description, and optional @appelent package. Its level-two sections are What, Stack, Architecture, Configuration, and Changelog in that order. Update current sections and prepend a changelog entry when adoption requirements change. Package existence is checked in the canonical runtime repo, not through a relative sibling package path.

Register each FEATURE owner in plugins/development/features.json. This is routing metadata only. Preserve existing feature IDs and numbered partial-adoption selectors. A procedure override can keep platform-specific numbered steps with its platform plugin while the app-wide feature retains ownership.

When changing skills, commands, routing metadata, or required references, bump the affected plugin version in plugin.json, .claude-plugin/plugin.json, and .codex-plugin/plugin.json. Keep all three equal. Use a major version for removed public skill names, a minor for additions, and a patch for compatible corrections. Package, FEATURE, and guideline versions are independent.

Run pnpm check before opening a pull request. This includes feature ownership, per-plugin resource isolation, command routes, manifest parity, guideline exports, and repository tests. Keep actual runtime/device evidence separate from structural validation.

Preserve user scope: capturing a feature does not mark the source app adopted, and changing a skill does not publish a package or install the plugin. Never commit credentials, env files, local caches, or dependency directories.
