# Publishing

Plugins and runtime packages version independently. For a plugin release,
bump all three manifests in that plugin, run `pnpm check`, and tag the release
after merging. For an `@appelent/*` package release, bump only that package and
publish it through the GitHub Packages workflow.

Publishing requires `GITHUB_TOKEN` from GitHub Actions. Credentials must never
be stored in this repository.
