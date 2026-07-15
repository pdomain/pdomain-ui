---
Status: active
Owner: CT
Created: 2026-07-15
Last verified: 2026-07-15
Kind: issue
Level: I2
---

# ComputeTargetPanel shows a raw device id and never tests the `local` current value

## Agent Index

- **Kind:** issue
- **Status:** active
- **Level:** I2
- **Last verified:** 2026-07-15
- **Resolution:** Open
- **Severity:** Low — cosmetic label plus a test-coverage gap, no release urgency
- **Affected version:** `@pdomain/pdomain-ui` at 2026-07-15
- **Read when:** touching `ComputeTargetPanel`, its device-label rendering, or its
  test fixtures.
- **Search terms:** ComputeTargetPanel, active device, current local, device
  label, compute target test.
- **Relates to:** [issues README](./README.md),
  [cross-app common UI modules](../architecture/cross-app-common-ui-modules.md)

## Summary

`ComputeTargetPanel` renders the raw device id for the active target and its
tests never exercise the real backend value `current: 'local'`. So a
backend-reported `current: 'local'` shows in the UI literally as "Active: local",
and no test pins the invariant that `current` is one of the available device ids.
Migrated from `ocr-container-meta` issue #394 on 2026-07-15.

## Impact

- Cosmetic: users see a raw id (`local`, `cuda:0`) instead of a friendly label.
- Coverage gap: the panel's fixtures never cover `current: 'local'`, an id that
  is not present in `available`, so a regression there would pass CI silently.
- No release urgency. Found during the `pdomain-ocr-simple-gui`
  2026-07-14 review-fixes, Phase E.

## Environment / versions

```
Package: @pdomain/pdomain-ui
Files:   src/shell/ComputeTargetPanel.tsx, src/shell/ComputeTargetPanel.test.tsx
Date:    2026-07-15
```

## Evidence

1. `src/shell/ComputeTargetPanel.tsx:163` renders
   `Active: <strong>{current ?? 'auto'}</strong>` — the raw `current` id, so
   `current: 'local'` displays as "Active: local".
2. `src/shell/ComputeTargetPanel.test.tsx` sets `current: 'cpu'` (line 12) and
   `current: 'cuda:0'` (lines 129, 158). No test sets `current: 'local'`, and no
   test asserts `current ∈ available[].id`.

## Root-cause hypotheses

1. The panel prints `current` directly rather than mapping it through a label
   lookup against `available`.
2. The fixtures were written around `cpu`/`cuda:0` and never updated for the
   `local` sentinel the backend can return.

## Defects to fix

- Active-device text should be a friendly label, or a follow-up decision should
  record why the raw id is acceptable.
- A test should pin the `current ∈ available ids` invariant, or explicitly cover
  the `local`-not-in-`available` backend reality.

## Next steps

- Add a friendly label for the active device (for example
  "NVIDIA GeForce … (auto)") derived from `available`.
- Add a `ComputeTargetPanel.test.tsx` case that sets `current: 'local'` and
  asserts the rendered label plus the id invariant.

## What is NOT broken

- Device selection and the Force-CPU button, which are covered by existing tests
  for `cpu` and `cuda:0`.
- The backend contract itself; this is a presentation and test-coverage issue.

## Resolution

Open.
