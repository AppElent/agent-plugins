# UI states

Design initial loading, populated, empty, error, and refresh states together. An empty result is different from a request that has not completed.

Use skeletons for initial loading when the content layout is predictable. Match the eventual structure and reserve its space. Use a compact progress indicator for actions or content whose shape is unknown; avoid replacing the entire screen for a local operation.

Keep existing content visible during background refresh. Indicate refresh activity without resetting scroll position, selection, or user input.

Put action progress and recoverable errors beside the action. Prevent duplicate submissions while work is pending, retain entered values on failure, and provide a retry or a clear next step.

Make empty states explain what is absent and offer an appropriate next action. Respect reduced motion in skeletons and transitions; loading indicators must not be the only accessible description of state.

Verify these states with delayed, empty, and failed responses. A successful fast response does not establish loading or error-state quality.
