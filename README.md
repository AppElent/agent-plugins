# AppElent Agent Plugins

One marketplace, four goal-based plugins. The same skill content is packaged for Claude Code and Codex.

| Plugin | Purpose | Entry points |
| --- | --- | --- |
| development | App-wide setup, auth, i18n, developer tooling, feature capture, toolkit maintenance | /development:feature, /development:project, /development:dev, /development:capture-feature, /development:repo |
| web | Web baseline implementation, browser localization, MCP | /web:feature, /web:project |
| mobile | Native foundation, design, QA, audits, release | /mobile:skill |
| workflow | Reviews, workflow lessons, codebase scans, handoffs | /workflow:skill, /workflow:scan-codebase |

The CLI and runtime implementation are maintained in [appelent-packages](https://github.com/AppElent/appelent-packages). Installing a plugin supplies agent guidance, not those executables.

## Install

Claude Code:

```text
claude plugin marketplace add AppElent/agent-plugins
claude plugin install development@appelent
claude plugin install web@appelent
claude plugin install mobile@appelent
claude plugin install workflow@appelent
```

Codex:

```text
codex plugin marketplace add https://github.com/AppElent/agent-plugins.git
codex plugin add development@appelent
codex plugin add web@appelent
codex plugin add mobile@appelent
codex plugin add workflow@appelent
```

Install the goal plugins needed by the app. Development routes to web for its detailed web baseline and to mobile for native foundation; missing platform procedures are reported explicitly. The setup helper installs all four: pnpm setup:codex, or pnpm setup:codex:dev for this local marketplace. Start a new task after installing/updating skills.

## Shared app guidelines

Versioned general, web, and mobile sets live in [guidelines/](guidelines/README.md). Export with pnpm guidelines:pack and use appelent guidelines plan/apply/check to deploy selected sets. Agents read the app's pinned copies and app-specific exceptions.

## Development

Run pnpm install, then pnpm check. Each plugin has portable, Claude, and Codex manifests with matching versions. See [CONTRIBUTING.md](CONTRIBUTING.md) and [MIGRATION.md](MIGRATION.md).

Existing runtime copies under packages/ and their publishing workflow remain transitional; registry/publisher cutover is a separate operation. New executable work belongs in appelent-packages.
