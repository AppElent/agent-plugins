# Engineering

Before changing behavior, identify the owning module and the existing app convention. Extend that owner instead of introducing a second mechanism for the same responsibility.

Keep domain decisions in the app, reusable runtime behavior in packages, deterministic setup in CLI recipes, and judgment in guidelines or skills. Extract shared code when actual callers demonstrate a common contract.

Keep credentials outside tracked files. Preserve the app's environment manifest and credential routing rather than introducing another secret-file convention.

Verify the behavior affected by the change, including its failure path. Distinguish automated checks from browser/device or provider acceptance that has not been exercised.
