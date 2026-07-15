---
Status: active
Owner: CT
Created: 2026-07-15
Last verified: 2026-07-15
Kind: issue
Level: I1
---

# useShortcuts cannot match key sequences like `g p`

## Agent Index

- **Kind:** issue
- **Status:** active
- **Level:** I1
- **Last verified:** 2026-07-15
- **Resolution:** Open
- **Severity:** Low — deferred capability gap, conditional on suite demand
- **Affected version:** `@pdomain/pdomain-ui` at 2026-07-15
- **Read when:** adding sequence/chord navigation shortcuts, or changing
  `useShortcuts` key parsing.
- **Search terms:** useShortcuts, chord, sequence, key binding, g p navigation,
  ShortcutBinding.
- **Relates to:** [issues README](./README.md)

## Summary

`useShortcuts` parses a binding's `keys` by splitting on `+` only, so a
multi-key sequence like `g p` becomes one literal key compared against a single
`KeyboardEvent.key` and can never match. Suite-wide sequence navigation would
need a chord/sequence parser. This is a deferred, conditional capability gap, not
a live defect. Migrated from `ocr-container-meta` issue #401 on 2026-07-15.

## Impact

- Any `g p`-style sequence binding silently never fires.
- `pdomain-ocr-trainer-spa` had four dead `g p` / `g r` / `g m` / `g e`
  nav-chord registrations that relied on this; they were removed in its
  2026-07-14 review-fixes, Task 3.
- No current consumer depends on sequence shortcuts, so nothing is broken today.

## Environment / versions

```
Package: @pdomain/pdomain-ui
Files:   src/hooks/useShortcuts.ts
Date:    2026-07-15
```

## Evidence

1. `src/hooks/useShortcuts.ts:78` — `parseCombo` builds parts with
   `keys.split('+')`, so `'g p'` is treated as a single combo, not a sequence.
2. `src/hooks/useShortcuts.ts:134` — `matchesEvent` compares one
   `e.key.toLowerCase() === parsed.key`, with no notion of a pending prefix key.

## Root-cause hypotheses

1. `useShortcuts` was designed for modifier combos (`ctrl+k`), not for timed
   key sequences, so it has no state to hold a prefix key between events.

## Defects to fix

- None required now. If suite-wide sequence navigation is wanted, add a
  chord/sequence parser and a short-lived prefix-key state to `useShortcuts`.

## Next steps

- Decide, at the suite level, whether sequence navigation is wanted. Only then
  design the parser (prefix key, timeout window, escape/reset behavior).

## What is NOT broken

- Modifier combos (`ctrl+k`, `shift+?`, etc.), which parse and match correctly.

## Resolution

Open — deferred pending suite-level demand.
