# Shared app guidelines

This directory owns the reusable guidelines deployed into app repositories. Skills describe procedures; these documents describe the standards those procedures apply. The developer CLI supplies installation and conflict detection separately from this content.

## Author and export

Edit the relevant general, web, or mobile document and its catalog entry. Keep one rule in one source file. The catalog's `when` text tells an agent when to load each set. Register every document; unlisted files fail validation.

Increment `catalog.json`'s guideline version whenever content or routing changes. Guideline releases are independent of plugin and CLI versions. Once distributed, treat a version as immutable. The consuming CLI detects a changed bundle under an already installed version.

Run `pnpm guidelines:check`, `pnpm test`, and `pnpm guidelines:pack`. The export is `dist/guidelines/appelent-guidelines-<version>.json`: a self-contained UTF-8 JSON artifact, with no scripts or credentials. Export is local; these commands do not publish a release. Retain the exported artifact with its release when distributing it.

## Install in an app

Use a built or released `@appelent/dev` that provides `guidelines --help`. From the app root:

```text
appelent guidelines list --source /path/to/appelent-guidelines-1.0.0.json
appelent guidelines plan --source /path/to/appelent-guidelines-1.0.0.json --set general --set web
appelent guidelines apply --source /path/to/appelent-guidelines-1.0.0.json --set general --set web
appelent guidelines check
```

Select both web and mobile for a repository with both platforms. Nothing selects targets implicitly. For an update, pass the new bundle to plan/apply and omit `--set` to retain the installed selection. Providing sets replaces that selection.

Review and commit `docs/guidelines/`, `.appelent/guidelines.json`, and the managed block added to `AGENTS.md`. The CLI preserves the rest of `AGENTS.md` and creates `docs/guidelines/app.md` only when absent. Record app-specific decisions and reasoned exceptions there. Shared changes go back to this source directory.

The local receipt pins the version, bundle hash, selected sets, and managed file hashes. The app can use its guidelines and check for local edits offline. Updates stop before content writes if a managed file was customized. Removing a set only removes its unchanged managed files; unrelated documents remain app-owned.

The app's AGENTS.md pointer is the entry point for agents even without a plugin installed. Skills working in that app should follow the local guidelines for the task; they should not substitute an unpinned copy from a plugin cache. The existing skill/plugin reorganization is a separate migration.
