---
name: ios-video-qa
description: Use when the user asks to triage an iOS screen recording into QA evidence, or review an existing triage pack against the repository and propose high-confidence fixes without repeatedly processing the full video.
---

# iOS Video QA

Use this skill when the user provides an iOS screen recording and wants UI/UX bugs triaged, or wants an engineering review of an existing triage pack.

The workflow has two explicit modes:

- **triage** — analyze the recording, extract compact evidence, and write a detailed QA report. Do not edit product code.
- **propose** — review the triage evidence against the codebase and propose root causes and fixes. Do not reopen the full recording unless the evidence is insufficient.

The user may invoke these explicitly, for example:

- `Use ios-video-qa in triage mode on this recording.`
- `Use ios-video-qa in propose mode on the latest triage report.`

If the user's intent clearly matches one mode, use it without asking them to restate the mode.

## Core principle

The full video is expensive context. Process it once during triage, convert useful moments into screenshots and short clips, and make later engineering work depend on those compact artifacts.

Do not make the proposal stage re-watch the entire source video by default.

# Mode: triage

## Goal

Convert one iOS screen recording into a compact QA evidence pack that another coding model can understand without watching the complete recording.

## Inputs

Required:
- One screen recording.

Optional:
- Spoken markers in the recording such as "bug one", "bug two", "issue", "wrong", "here", etc.
- A short description of the intended feature or flow.
- Existing acceptance criteria.

The repository may be open, but triage should not perform implementation-level source-code investigation. Keep this stage focused on observation and evidence.

## Output location

Create:

`qa/triage/<YYYY-MM-DD>-<short-session-name>/`

Inside it, create:

- `TRIAGE.md`
- `HANDOFF.md`
- `assets/`
  - screenshots for each issue
  - short clips only where motion/timing/interaction matters

Use stable issue IDs: `QA-001`, `QA-002`, etc.

## Workflow

### 1. Inspect the recording efficiently

Watch enough of the video to understand the complete tested flow.

Look specifically for:
- layout shifts
- clipping or overlap
- safe-area problems
- keyboard avoidance problems
- navigation mistakes
- incorrect state
- duplicated actions
- taps that appear ignored
- loading-state problems
- unexpected flashes
- animation or transition problems
- scroll problems
- modal/sheet sizing
- typography inconsistency
- spacing/alignment errors
- touch target problems
- disabled/enabled state mistakes
- stale data
- visual regressions
- platform behavior that feels non-native

If narration contains explicit bug markers, prioritize those moments but still inspect for nearby evidence.

### 2. Prefer screenshots over clips

For each issue, capture the minimum evidence needed.

Use screenshots for static problems.

Use a short clip only when the issue depends on:
- animation
- transition behavior
- timing
- scrolling
- keyboard appearance/disappearance
- multiple taps
- gesture behavior
- state changes

Keep clips tightly trimmed around the issue. Target roughly 3–12 seconds when possible.

Do not create a clip when one or two screenshots communicate the problem adequately.

### 3. Extract evidence

When ffmpeg is available, use the bundled helper:

`python scripts/extract_evidence.py <video> --out <assets-dir> ...`

You may also use native/local video tooling if more appropriate.

Evidence filenames must include issue IDs, for example:

- `QA-001-before.png`
- `QA-001-problem.png`
- `QA-002-keyboard-overlap.mp4`

Do not generate dozens of redundant frames.

### 4. Classify confidence and severity

For every issue assign:

Severity:
- `blocker`
- `high`
- `medium`
- `low`
- `polish`

Confidence:
- `high`
- `medium`
- `low`

Separate:
- directly observed defects
- probable defects needing product clarification
- subjective UX/polish suggestions

Do not present subjective preferences as confirmed bugs.

### 5. Write TRIAGE.md

Use this structure:

# iOS QA Triage

## Session
- Recording:
- Tested flow:
- Overall result:
- Issue count:

## Executive summary
A concise summary of the most important observed problems.

## Issues

### QA-001 — <short title>
- Severity:
- Confidence:
- Category:
- Observed:
- Expected:
- Reproduction:
- Evidence:
- Why it matters:
- Notes for engineering:

Repeat for each issue.

## UX / polish observations
Only include items that are not clearly defects.

## Things that looked correct
Mention important behaviors that were tested and appeared correct.

## Open questions
Only questions genuinely required to distinguish intended behavior from a bug.

### 6. Write HANDOFF.md

This is the compact artifact intended for the stronger engineering model.

Use this structure:

# QA Engineering Handoff

## Tested flow
One short paragraph.

## Priority order
Ordered list of issue IDs, highest-value first.

## Issue index

| ID | Severity | Confidence | Symptom | Evidence |
|----|----------|------------|---------|----------|

## Engineering review instructions

Review the issues against the repository.

For each high/medium-confidence issue:
1. identify the likely component/screen/state path involved;
2. trace the relevant implementation;
3. distinguish root cause from symptom;
4. propose the smallest robust fix;
5. note likely regressions or side effects;
6. specify tests or verification steps;
7. identify any issue that should NOT be fixed until product intent is clarified.

Prefer the extracted screenshots/clips. Do not reopen the original full recording unless an issue cannot be understood from the evidence pack.

Do not edit code during the proposal stage unless the user explicitly asks to implement after reviewing the proposal.

## Triage completion criteria

Before finishing:
- every reported defect has evidence where practical;
- clips are used only when motion matters;
- screenshots are not redundant;
- issue IDs are stable;
- observed behavior and inferred cause are clearly separated;
- the handoff can stand alone without the full video for most issues.

# Mode: propose

## Goal

Use an existing QA evidence pack plus the repository to produce an engineering proposal. This mode is intended for a stronger reasoning model.

## Inputs

Primary:
- `HANDOFF.md`
- `TRIAGE.md`
- referenced assets
- current repository

Secondary:
- original full recording only if necessary

## Video constraint

Do NOT watch or reprocess the entire original video by default.

If evidence is insufficient:
1. state exactly which issue lacks enough evidence;
2. inspect only the smallest relevant segment if the source recording is available;
3. add any newly extracted compact evidence back into the triage assets.

## Repository investigation

For each actionable issue:
- locate the relevant screen/component/module;
- trace state and event flow;
- inspect styles/layout constraints;
- inspect platform-specific iOS handling where applicable;
- inspect related tests;
- search for shared components before proposing one-off fixes.

Do not assume the visible component is the root cause.

## Output

Create:

`PROPOSAL.md`

next to the triage report.

Use this structure:

# iOS QA Fix Proposal

## Summary
Prioritized engineering assessment.

## Proposed fixes

### QA-001 — <title>
- Evidence:
- Likely files/components:
- Root-cause hypothesis:
- Confidence in root cause:
- Proposed change:
- Why this approach:
- Alternatives considered:
- Regression risks:
- Tests / verification:
- Estimated scope: `tiny | small | medium | large`
- Ready to implement: `yes | needs clarification`

Repeat for each issue.

## Cross-cutting findings
Note shared root causes, design-system issues, navigation/state problems, or repeated patterns.

## Recommended implementation order
Order fixes to reduce duplicated work and regression risk.

## Verification pass
Describe the shortest useful physical-device retest flow for the user.

## Proposal rules

- Do not inflate a visual symptom into an architectural rewrite.
- Prefer the smallest robust fix consistent with the codebase.
- Reuse existing patterns and components where reasonable.
- Explicitly say when the evidence does not justify a confident fix.
- Keep unrelated cleanup out of the proposal.
- Do not implement unless the user asks for implementation.

# Suggested user workflow

1. On the iPhone, screen-record one feature/journey.
2. Optionally say short markers such as "bug one" when something is wrong.
3. Run this skill in `triage` mode with a fast/cheaper model.
4. Review `TRIAGE.md` quickly.
5. Switch to the stronger model.
6. Run this skill in `propose` mode.
7. Approve selected issue IDs for implementation.
8. Test the new build on the physical iPhone and repeat.

## Self-improvement

If this workflow is unclear or misses a recurring QA need, record the lesson using
`skills/mobile/references/self-improvement.md`.
