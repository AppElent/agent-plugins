# Migration from the former repositories

This repository replaces the separate `AppElent/appelent-packages` and
`AppElent/appelent-skills` marketplaces. Those repositories remain available
during the transition, but this repository is the future source of truth.

The new marketplace intentionally makes a clean command-name break:

| Former command | New command |
| --- | --- |
| `/appelent:feature` | `/web:feature` |
| `/appelent:project` | `/web:project` |
| `/toolbox:skill` | `/workflow:skill` |
| `/toolbox:mobile` | `/mobile:skill` |

No runtime aliases are shipped for former command names.
