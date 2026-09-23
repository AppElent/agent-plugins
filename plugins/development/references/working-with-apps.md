# Working with an app

Read the app's AGENTS.md or CLAUDE.md first. When docs/guidelines/shared/README.md exists, read its index and the sets relevant to the task; then read docs/guidelines/app.md for documented decisions and exceptions. Use these pinned local guidelines rather than substituting rules from a plugin cache.

If guidelines are absent, explain the gap. Install them only when setup/adoption is in scope: use a reviewed versioned bundle with appelent guidelines plan/apply and explicit general/web/mobile sets. Never manufacture guideline content or overwrite app.md. Check local drift with guidelines check. Plugin installation itself installs neither guidelines nor the CLI.

## Executable and package documentation

Use the project's installed pinned @appelent/dev through pnpm exec appelent, or the reviewed global executable for host bootstrap. Inspect --version, --help, and capabilities --json before selecting automation. For local development, build in the explicitly identified packages checkout and invoke its absolute packages/dev/dist/bin.js with Node from the app directory.

Read API and command contracts from the matching installed @appelent package's README and docs. If unavailable, resolve APPELENT_PACKAGES_PATH or a user-provided checkout and verify packages/<name>/package.json. The canonical source is https://github.com/AppElent/appelent-packages. An installed plugin has no sibling packages directory. A source candidate is not proof of a published version; use a tested tarball or verify the requested release exists.

Recipe help is authoritative. Plan the selected capability, review conflicts/manual work, apply the authorized scope, then verify. There are no dedicated auth or i18n recipes currently: integrate their documented package APIs into app-owned code. Recipe success cannot establish browser, provider, or device acceptance.

## Adoption evidence

Preserve unknown appelent.json fields and existing feature IDs. Record the version from the owning FEATURE.md only after its requirements pass. Preserve baseline's numbered partial steps. Its historical baseline record describes web adoption; native-only setup uses mobile-foundation.

For auth/i18n, legacy records without target information do not prove cross-platform coverage. Report the verified targets; when adopting multiple platforms, retain options and record options.targets with the targets actually verified. Pending platforms stay explicitly pending. Keep recipe receipts and guideline receipts separate from feature completion.

## Editing the toolkit

Resolve APPELENT_PLUGINS_PATH or a user-provided agent-plugins checkout by its marketplace and plugins/ tree. Do not write into installed caches. APPELENT_PACKAGES_PATH identifies a different checkout for executable code. For guidance changes run pnpm check and bump all three manifests of each changed plugin; package and guideline versions are separate.
