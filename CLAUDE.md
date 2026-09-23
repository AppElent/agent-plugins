# Agent plugin marketplace

This repository owns the development, web, mobile, and workflow plugins and the central guideline source. Read CONTRIBUTING.md and the owning plugin README before changing routing or skills.

Run pnpm check. Skill, command, or required-reference changes require matching version bumps in all three manifests of each affected plugin. Feature, package, guideline, and plugin versions are independent.

For shared guideline changes, read guidelines/README.md. For runtime implementation or CLI recipes, use the separate appelent-packages checkout. Installed plugin caches are reference snapshots, not contribution checkouts.
