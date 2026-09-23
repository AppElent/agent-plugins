---
name: upgrade-deps-mobile
description: Upgrade dependencies in Expo or React Native apps while preserving Expo SDK and React Native compatibility. Use when dependency maintenance involves an Expo, React Native, EAS, iOS, or Android project; supports either patch/minor-only updates or major upgrades with migrations.
---

# upgrade-deps-mobile

Upgrade an Expo or React Native app without splitting its native dependency
matrix into incompatible versions.

## Choose the upgrade scope

Before changing dependencies, offer these two scopes unless the user already
selected one:

1. **Patch and minor** — update compatible patch/minor releases and leave every
   major version, including the Expo SDK and React Native, unchanged.
2. **Include majors** — also upgrade major releases, review their migrations,
   and apply required code and configuration changes. Upgrade one framework
   generation at a time so each migration can be verified.

State the selected scope in the final report. A request to "update" or
"upgrade" without a scope does not authorize major upgrades.

## Establish the dependency model

Read the repository instructions, package manifest, lockfile, app config,
native directories, and package-manager metadata. Record the current Expo SDK,
React, React Native, Expo Router, and EAS CLI versions where present. Inspect
the working tree before editing and preserve unrelated changes.

Use the repository's package manager. Keep exactly its existing lockfile; do not
migrate package managers as part of an upgrade.

Classify the app before selecting commands:

- **Expo:** the package manifest includes `expo`. Treat the Expo SDK as the
  compatibility authority for React, React Native, React Native Web, and Expo
  modules. Use `npx expo install` for packages governed by Expo, even when the
  repository uses pnpm, yarn, bun, or npm.
- **Bare React Native:** `react-native` is present without Expo. Treat the React
  Native release and its documented React, Metro, CLI, native-template, iOS,
  and Android requirements as one migration unit.

When current mechanics or version compatibility matter, load the installed
Expo upgrade guidance for Expo apps or consult the official React Native
upgrade documentation for bare apps. Release notes and migration guides are
required evidence in **Include majors** mode.

## Plan the version set

Inventory outdated direct dependencies with the repository's package manager.
Separate them into:

- framework-coupled packages;
- ordinary runtime dependencies;
- development and tooling dependencies;
- requested majors excluded by the selected scope.

In **Patch and minor** mode, constrain every direct dependency to its current
major. Do not let a broad updater rewrite ranges beyond that boundary.

For Expo apps, run `npx expo install --check`. If **Include majors** changes the
Expo SDK, update the SDK first according to the maintained Expo upgrade
guidance, then run `npx expo install --fix` to align compatible packages. Never
select React or React Native versions independently of the target Expo SDK.

For bare React Native major upgrades, compare the old and target templates and
apply the documented native-file changes deliberately. Preserve existing
project customizations. A generated native directory does not authorize
regenerating or deleting it; commands such as `expo prebuild --clean` require
explicit user authorization.

## Apply and verify

Install the planned version set and include only dependency, lockfile, and
necessary migration changes. Resolve peer-dependency warnings by correcting
the version set, not by forcing the install or suppressing checks.

Run the checks the repository actually defines. The verification gate is:

1. `npx expo-doctor` for Expo apps;
2. typecheck and lint/format checks;
3. automated tests;
4. the production or export build used by the repository;
5. native build checks available in the current environment.

If an iOS build is unavailable on the current host, report it as unverified
and give the exact EAS or macOS check needed. Do not claim web or Android
verification as evidence for iOS behavior. Any visual, navigation, gesture,
permission, or native-module migration also needs a focused check on a physical
iPhone or the project's accepted iOS test environment.

Stop with the last known-good dependency set when a migration cannot be made
cleanly. Do not weaken tests, force incompatible peer dependencies, or hide
warnings to complete the upgrade.

## Report

Report:

- selected scope and version changes, highlighting framework-coupled moves;
- migrations applied and majors intentionally deferred;
- pass/fail/not-run status for every verification gate;
- iOS device or build checks still required.

Commit or push only when the user requested it. Keep upgrade commits focused on
dependency changes and the code/configuration migrations they require.

## Self-improvement

Once the upgrade is reported, follow the reflection in
[the workflow reflection](../workflow/references/self-improvement.md). Capture
only a reusable gap in this workflow's instructions; ordinary package breakage belongs in the app, not in
the workflow plugin.
