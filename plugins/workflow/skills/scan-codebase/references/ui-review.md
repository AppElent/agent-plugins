# Scoped UI verification

Read the app's docs/guidelines/shared/README.md, relevant sets, and app.md before judging UI. If guideline installation is absent, report the missing standard instead of silently generating one.

Sample initial loading, background refresh, empty/filter-empty, error, and mutation flows. For each retained finding, record route, state, platform, source evidence, consequence, and the relevant rule or app exception. Source imports alone cannot establish UX compliance.

Separate automated evidence from browser and native-device observation. Build/typecheck core before dependent targets. For native flows include cold launch, session transitions, provisioning, deep links, locale persistence, network recovery, keyboard, and the main journey. State which targets or device checks were unavailable.
