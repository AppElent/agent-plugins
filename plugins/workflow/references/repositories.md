# Toolkit repositories

Reusable executable code and CLI recipes belong in https://github.com/AppElent/appelent-packages. Resolve APPELENT_PACKAGES_PATH or a user-provided checkout and verify packages/<owner>/package.json.

Skills, goal routing, and shared guidelines belong in https://github.com/AppElent/agent-plugins. Resolve APPELENT_PLUGINS_PATH or a user-provided checkout and verify the marketplace and plugins/ tree. Installed plugin caches are references, not writable contribution checkouts.

App-wide capabilities, reusable feature capture, and toolkit maintenance belong in development; web-specific procedures in web; native design/integration in mobile; reviews and codebase scans in workflow. Read the source checkout's CONTRIBUTING.md before adding a skill or FEATURE record. Run pnpm check and bump all three manifests for each changed plugin. Package versions, feature adoption versions, and guideline catalog versions are independent.

When implementing or reviewing app code, read docs/guidelines/shared/README.md if present, load the relevant sets, then read docs/guidelines/app.md for local decisions and exceptions. Shared guidelines are authored centrally and deployed by appelent guidelines; a plugin installation does not deploy them.
