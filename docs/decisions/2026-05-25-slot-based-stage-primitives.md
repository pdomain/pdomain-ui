---
title: "Slot-based stage primitives — Banner, StageToolbar, Thumbnail"
date: 2026-05-25
kind: decision
status: accepted
owner: ConcaveTrillion
created: 2026-05-25
last_verified: 2026-07-13
related:
  - docs/architecture/stage-component-library.md
---

# Slot-based stage primitives

## Context

Phase 2 §6.2 names per-stage component classes after the stage: `SourceBanner`,
`CropBanner`, `FileToolbar`, `CropToolbar`, `ThumbCard` (Source), `GrayThumb`,
`CropCard`. By M4 it became clear several of these are the same chrome with
different content slotted in. By M5 (Crop) the duplication would have
multiplied: 7 stages × 5 patterns ≈ 35 near-duplicate per-stage components.

## Decision

Promote three slot-based primitives to `src/primitives/` to host the shared
chrome. Stage folders provide stage-specific data/labels via the slots.

| Primitive | Role | Stage components it absorbs |
|---|---|---|
| `Banner` | Tone-aware banner shell with headline/subtext/actions slots. Consumers control state machine externally. | `SourceBanner`, `AutoDetectBanner`, `CropBanner`, future stage banners |
| `StageToolbar` | leftSlot / centerSlot / rightSlot toolbar shell. | `FileToolbar`, `CropToolbar`, future stage toolbars |
| `Thumbnail` | Slot-based per-page card: image + page number + status dot + 4 corner overlay slots + footer. | `ThumbCard` (Source), `GrayThumb`, `CropCard`, future stage thumbs |

`BulkActionBar` already exists as a primitive (Phase 1) with `variant`,
`count`, `flagSummary`, `actions`, `onClear` props — Source's `BulkBar` and
Crop's `CropBulkBar` should compose it. (M3 Source's `BulkBar` was shipped
without composing `BulkActionBar`; file as follow-on tech-debt.)

`StepSettings` is intentionally NOT promoted — each stage's settings panel
(`SourceStepSettings`, `CropStepSettings`, etc.) differs too much in form
shape to share chrome usefully.

## Naming

- `Banner` — generic primitive. Existing domain-specific primitives
  (`DiskCostBanner`, `QualityBanner`) remain; they compose `Banner`.
- `StageToolbar` — distinct from `FilterToolbar` (Phase 1 single-line search box).
- `Thumbnail` — chosen over `ThumbCard` to avoid collision with the
  already-shipped Source `ThumbCard` (the Source one can be migrated later
  as a thin facade; not blocking).

## Going forward

- M5 Crop and later stages compose these primitives. Stage folders may still
  have stage-specific components but they should be thin facades (or
  data-shaping wrappers) over the primitive chrome.
- M3 Source / M4 Grayscale components remain as-is for now (shipped). File
  follow-on tickets to migrate them onto the new primitives.
- §6.5 "Promotion rule" applies more aggressively from M5 onward: if 2+
  stages would have nearly the same component, design a slot-based primitive
  for the chrome and have each stage compose it.

## Why slots over discriminated state-machine props

Initial sketch had `<Banner state="idle"|"generating"|"selection">` — but
each stage has a different state vocabulary (Source: idle/gen/select;
Crop: running/review/done; Validation: pass/warn/error). Encoding all of
them in one prop type bloats the primitive and re-introduces stage
vocabulary. Slot-based pushes the state machine to the consumer where it
belongs; the primitive just owns layout + tone.

## Consequences

Stage folders keep their state machines and stage-specific data while Banner,
StageToolbar, and Thumbnail own reusable chrome. Crop composes the shared
primitives; shipped Source and Grayscale components remain as-is, and
specialized DiskCostBanner and QualityBanner still use their own shells.

## Supersedes / Superseded-by

This decision supersedes the proposal to implement separate per-stage chrome
when slot composition can serve the same role. No superseding decision is
recorded.
