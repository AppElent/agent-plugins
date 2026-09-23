# Native interaction

Before building a screen, decide its place in the navigation flow: push, replacement, sheet, or modal. Back navigation should return to the user's previous place; completed one-way flows should not become editable again by accident.

Use platform controls and conventions where they match the task. Account for safe areas, the keyboard, larger system text, screen-reader labels, and the app's supported themes.

Keep gestures and animations tied to an understandable action. Respect reduced motion and provide a discoverable alternative to gesture-only actions.

Preserve list position and entered values across refresh and recoverable failures. Pair these native conventions with the shared UI-state guidelines when those are installed.

Verify affected flows on the intended platform. Record Android/iOS differences and any platform that was not exercised; a web preview is not native-device evidence.
