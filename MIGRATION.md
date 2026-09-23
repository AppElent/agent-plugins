# Marketplace and ownership migration

The AppElent marketplace now has development, web, mobile, and workflow plugins. The standalone plugin formerly distributed by AppElent/appelent-packages is retired; that repo owns executable packages and the CLI.

| Capability | Current owner |
| --- | --- |
| Baseline selection, auth, i18n, app CLI, developer CLI | development |
| Historical web baseline steps and browser i18n integration | web |
| Native foundation and mobile design/review/release | mobile |
| Capture, scans, repository maintenance, engineering workflows | workflow |

Use /development:feature, /development:project, and /development:dev for app-wide operations. /web:feature and /web:project remain web entry points and explain where moved capabilities now live. Former /appelent:* and /toolbox:* commands are not shipped as runtime aliases.

The auth, i18n, cli, dev, baseline, mobile-foundation, and mcp feature IDs remain unchanged. Baseline's 16 numbered selectors remain in web-baseline. Feature version bumps describe changed adoption procedures, not the namespace move alone. Native-only work does not mark the historical web baseline complete. Legacy auth/i18n records do not prove cross-platform coverage.

Plugin source versions for this change: development 1.0.0, web 2.0.0 (moved public skills), mobile 1.1.0, workflow 1.1.0. These are local source versions until published and installed. No application migration or user-machine plugin installation is implied.

The former packages repo's dev/mobile/capture/scan/maintenance work is incorporated here. Registered project paths were transferred to projects.json. Its legacy plugin manifests, skills, commands, setup/bundling scripts, and plugin-only checks are removed after source validation; runtime code remains there.

Runtime package copies and the package publisher in this repository still require a separate registry-access and publisher cutover. Do not publish from both repositories or infer registry availability from source versions.
