# Contributing

Put mobile product and native-app knowledge in `plugins/mobile`, AppElent web
features in `plugins/web`, and provider-neutral engineering workflows in
`plugins/workflow`. Runtime libraries belong in `packages/`.

Skills are the shared source of truth. Describe required capabilities rather
than assuming a provider-specific tool exists. Put provider-only command UX in
that provider's supported command surface.

When changing a plugin's `skills/` or `commands/`, bump its version in
`plugin.json`, `.claude-plugin/plugin.json`, and `.codex-plugin/plugin.json` in
the same commit. Run `pnpm check` before opening a pull request.

Never commit `.env` files, credentials, local caches, generated output, or
dependency directories.
