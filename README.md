# AppElent Agent Plugins

One marketplace for AppElent's portable AI agent plugins. The same skill
content is packaged for Claude Code and Codex.

| Plugin | Purpose | Claude Code entry points |
| --- | --- | --- |
| `mobile` | Mobile design, React Native/Expo, QA, audits, and release | `/mobile:skill` |
| `web` | TanStack/Convex/Clerk/Cloudflare features and `@appelent/*` packages | `/web:feature`, `/web:project` |
| `workflow` | Reviews, audits, handoffs, maintenance, and agent workflows | `/workflow:skill` |

## Install

### Claude Code

```bash
claude plugin marketplace add AppElent/agent-plugins
claude plugin install mobile@appelent
claude plugin install web@appelent
claude plugin install workflow@appelent
```

### Codex

```bash
codex plugin marketplace add https://github.com/AppElent/agent-plugins.git
codex plugin add mobile@appelent
codex plugin add web@appelent
codex plugin add workflow@appelent
```

The cross-platform helper runs the Codex commands for all three plugins:

```bash
pnpm setup:codex
```

For local plugin development, use `pnpm setup:codex:dev`. Start a new task
after installing or updating plugins so their skills reload.

## Development

```bash
pnpm install
pnpm check
```

Each plugin has one portable root manifest plus thin Claude Code and Codex
compatibility manifests. Keep the three versions equal within a plugin.
Runtime package versions under `packages/` are independent.

See [CONTRIBUTING.md](CONTRIBUTING.md) for routing and release rules and
[MIGRATION.md](MIGRATION.md) for the clean command-name migration.
