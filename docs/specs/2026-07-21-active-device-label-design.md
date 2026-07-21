---
kind: spec
status: active
owner: CT
created: 2026-07-21
last_verified: 2026-07-21
---

# Friendly active-device labels design

`ComputeTargetPanel` will show a human-readable active target while preserving raw unknown identifiers for diagnosis.

## Agent Index

- **Kind:** spec
- **Status:** active
- **Read when:** changing active-device text in `ComputeTargetPanel`.
- **Search terms:** ComputeTargetPanel, active device, local sentinel, friendly label.
- **Relates to:** [active-device issue](../issues/2026-07-15-computetargetpanel-active-device-label.md),
  [implementation plan](../plans/2026-07-21-active-device-label.md).

## Adversarial Review

The author checked the design against the issue, current component, current tests, and package constraints. An independent writing-docs review could not run because the shared agent pool had no free slot. No unresolved author finding remains.

## The label follows a fixed fallback order

The panel will resolve the display text from the existing `DeviceInfo` value. It will not change selection, persistence, or backend contracts.

1. If `current` matches an entry in `available`, show that entry's `label`.
2. If `current` is `local` and has no matching entry, show `Local compute target`.
3. If `current` is null or absent, show `Automatic`.
4. For every other unmatched identifier, show the raw identifier unchanged.

Known identifiers therefore gain friendly names, while an unexpected backend value remains visible instead of being hidden behind a generic label.

## A small pure helper owns presentation

Add a module-local `activeDeviceLabel` helper beside the component. It accepts `current` and `available`, then returns a string. Keeping the lookup pure makes every fallback independently testable without expanding the public package API.

The rendered line remains `Active: <strong>…</strong> (via …)`. The effective-source suffix and all controls remain unchanged.

## Errors remain observable

The helper never throws for a missing match. Unknown non-empty identifiers remain visible verbatim. An empty string is also preserved because silently treating malformed backend data as automatic would hide a contract problem.

## Tests pin labels without changing interactions

Component tests will cover a known CPU label, a known CUDA label, the unmatched `local` sentinel, an unknown identifier, and null. Existing radio selection and Force CPU tests continue to prove interaction behavior.

## Alternatives rejected

- Showing every raw identifier preserves diagnostics but does not solve the user-facing defect.
- Returning `Local compute target` for every unknown identifier hides backend contract drift.
- Adding a label field to the backend `current` contract expands cross-repository scope without need; `available` already owns known labels.

## Acceptance criteria

- Known current identifiers render their matching `available[].label`.
- Unmatched `local` renders `Local compute target`.
- Null renders `Automatic`.
- Other unmatched identifiers render unchanged.
- Device selection, Force CPU, and effective-source text behave as before.
