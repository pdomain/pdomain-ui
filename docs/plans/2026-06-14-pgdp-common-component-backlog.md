---
kind: plan
status: active
owner: CT
created: 2026-06-14
last_verified: 2026-07-13
---

# PGDP Common Component Backlog

> **For agentic workers:** use `superpowers:subagent-driven-development` for
> implementation work. Keep stage folders and common-component folders as
> separate tasks so reviewers can tell whether a pattern is truly reusable.

**Goal:** Flesh out the reusable `pdomain-ui` components still needed by the
newer PGDP design handoff, without duplicating components already shipped.

**Source gap analysis:** `docs/research/2026-06-14-pgdp-design-handoff-gap-analysis.md`

## Goal

Complete the reusable pdomain-ui component gaps that remain in the newer PGDP
design handoff without duplicating components that have already shipped.

## Architecture

Build typed, presentation-only primitives and module components for repeated
settings, review, gate, artifact, and workbench patterns. Keep full stage tools
and orchestration app-local. Move a component into the library only when it
serves at least two stage families or more than one consumer app.

The settings components `SettingsCard`, `SettingsRow`, `SettingsValue`, and
`SettingSlider` already ship from `src/settings/`. `WorkbenchLayout` already
ships from `src/workbench/`. Treat both areas as completed baseline work when
narrowing this backlog.

## Tech Stack

Typed React component APIs, Storybook stories, Vitest coverage, token-only
styles in `theme/primitives.css`, and package and Vite exports for public
modules.

## Global Constraints

Treat shipped stage and common-module work as the baseline instead of
re-porting it. Keep state machines, backend registry, SSE, event logs, routes,
domain algorithms, and stage-specific machine behavior outside pdomain-ui.

## Principles

- Treat current `pdomain-ui` work as baseline. Do not re-port Source,
  Grayscale, Crop, HyphenJoin, Validation, QualityFlags, Scannos, PageReorder,
  Upload, PageWorkbench, shell, templates, or core primitives unless the newer
  PGDP final designs require extension.
- Promote a component to `src/primitives/` or `src/templates/` only when it is
  used by at least two stage families or by more than one consumer app.
- Keep PGDP state machines, backend registry, SSE, event-log, and route behavior
  app-owned. The library renders typed state; it does not own orchestration.
- Keep full PGDP stage tools app-local unless there is a second consumer or a
  repeated visual pattern worth extracting. `pdomain-ui` should supply the
  shared pieces that those stages compose.
- Every new component needs a typed API, Storybook stories, Vitest coverage, and
  token-only styling in `theme/primitives.css`.

## P0 - Reconcile Public Surface

### 1. Decide whether `src/stages/Projects` is public

**Evidence:** `src/stages/Projects/index.ts` exports `PipelineMini`,
`ProjectsEmpty`, and `ProjectsAttributesPanel`. However,
`package.json:69-108` has no `./stages/Projects` subpath.

**Work:**

- Either add a package subpath and Vite entry for `./stages/Projects`, or
  document that these components are internal to `ProjectsLandingTemplate`.
- Add package/export contract tests either way.

### 2. Document root-barrel policy for stage exports

**Evidence:** Many stages have subpaths. The root barrel also directly
re-exports PageWorkbench, Source, Grayscale, and Crop in
`src/index.ts:337-516`.

**Work:**

- Decide whether stage components are root exports or subpath-only exports.
- Update `README.md` or `docs/usage/consumer-bootstrap.md` so consumers know the
  intended import path.

## P1 - Common Settings Kit

### 3. Add `SettingsCard`, `SettingsRow`, and `SettingsValue`

**Why:** PGDP repeats `SetRow`, `SettingRow`, and settings cards across stage
settings screens (`COMPONENT_INDEX.md:21-31`). `pdomain-ui` has `FieldRow` but
lacks a standard dense settings row and card system for stage defaults,
presets, and inheritance state.

**Target:** `src/primitives/SettingsCard.tsx`,
`src/primitives/SettingsRow.tsx`, `theme/primitives.css`.

**Acceptance:**

- Renders title, description, optional badge/status, action slot, and control slot.
- Supports dense row layout used by PGDP stage settings.
- Stories cover default, modified, preset, danger, disabled, and long text.
- Tests cover label/control association and action slot behavior.

### 4. Add `SettingSlider`

**Why:** PGDP repeats `SettingSlider` in image-stage settings
(`COMPONENT_INDEX.md:29-31`). Current public primitives do not expose a slider.

**Target:** `src/primitives/SettingSlider.tsx`.

**Acceptance:**

- Typed numeric range with min/max/step, unit suffix, value label, disabled
  state, and accessible range semantics.
- Can be used inside `SettingsRow`.
- Tests cover keyboard changes, clamping, decimal steps, and aria value text.

### 5. Add `SettingsInheritanceBanner`

**Why:** The statecharts specify `default | modified | preset` inheritance for
every stage settings tab (`statecharts/README.md:158-161`).

**Target:** `src/primitives/SettingsInheritanceBanner.tsx` or
`src/templates/StageSettingsShell.tsx` if it owns layout.

**Acceptance:**

- States: `default`, `modified`, `preset`.
- Optional stale/downstream warning copy and affected-stage count.
- Actions: save as default, revert, reset, view affected stages.
- Replaces one-off inheritance banners in future stage settings components.

### 6. Audit partial existing stage settings coverage

**Why:** Existing slices such as Source, Validation, PageReorder, and Scannos
cover useful parts of prior designs but do not fully cover the newer PGDP final
screens.

**Work:**

- For Source, compare current `src/stages/Source` exports to PGDP
  `SourceFiles`, `SourceMetadata`, `SourceOverview`, `SourceStageControlsLeft`,
  and `SourceViewer`.
- For PageReorder, compare the four current exports to PGDP page-order naming,
  unified ledger/ribbon/spine, roles, and run-leaf management.
- For Scannos, compare token/detail/rule primitives to PGDP Scannocheck pages,
  overview, settings, suspects, and list builder.
- For Validation, compare current row/footer/header primitives to PGDP `VALMain`
  and `VALSettings`.

**Acceptance:**

- A follow-up note classifies each missing piece as `reuse existing`,
  `promote common component`, or `keep app-local`.
- No stage-specific PGDP machine behavior is moved into `pdomain-ui`.

## P1 - Stage Review Foundation

### 7. Add `StageLifecycleBanner`

**Why:** PGDP stage tools share `running -> review -> settled` banners with
progress, counts, stale warnings, and confirm affordances
(`statecharts/README.md:151-157`).

**Target:** `src/primitives/StageLifecycleBanner.tsx`.

**Acceptance:**

- States: idle/not-run, queued, running, review, settled, error, stale.
- Slots for primary action, secondary action, and stage-specific detail.
- Uses existing `Badge`, `Progress`, `Button`, and status tokens.

### 8. Add `ReviewFilterToolbar`

**Why:** Image review stages repeat filter chips, flag counts, density S/M/L,
selected counts, and toolbar actions. The current `FilterToolbar`,
`ThumbSizeToggle`, and `StageToolbar` provide useful pieces but not the whole
review toolbar.

**Target:** `src/templates/ReviewFilterToolbar.tsx` or
`src/primitives/ReviewFilterToolbar.tsx`.

**Acceptance:**

- Typed filters with counts and active state.
- Density control delegates to `ThumbSizeToggle` or existing density primitives.
- Optional selected count and action slot.
- Keyboard and aria state tests for interactive filters.

### 9. Add `ReviewPageGrid`

**Why:** `imageStageReview` requires a reusable flag-grid/page-grid for seven
stages (`statecharts/README.md:119-124`). Current `ThumbGrid` and `Thumbnail`
exist, but stage pages still need a typed review composition.

**Target:** `src/templates/ReviewPageGrid.tsx`.

**Acceptance:**

- Composes `ThumbGrid`, `Thumbnail`, `FlagChip`, and status indicators.
- Supports density S/M/L, selection, loading skeletons,
  failed/running/reviewed states, and custom thumbnail overlay slots.
- Stage-specific visual overlays remain slots, not hard-coded.

### 10. Add `InlineReviewEditorShell`

**Why:** Shared image review needs an exclusive inline editor with apply scope:
this page, selected, same issue (`statecharts/README.md:121`, `:151-157`).

**Target:** `src/templates/InlineReviewEditorShell.tsx`.

**Acceptance:**

- Header, before/after or viewer slot, controls slot, apply-scope segmented
  control, cancel/apply footer, warning/gate slot.
- Does not know crop/deskew/dewarp math.
- Tests cover scope changes and action callbacks.

## P1 - Gate And Pack Tail Components

### 11. Add `GatePanel`

**Why:** PGDP repeats `Gate` across build, proof, validation, submit, archive,
regex, and zip surfaces (`COMPONENT_INDEX.md:21-31`; pack chain at
`statecharts/README.md:176-184`).

**Target:** `src/primitives/GatePanel.tsx`.

**Acceptance:**

- Tones: pass, warning, error, running, neutral.
- Title, description, icon/status slot, optional actions.
- Can render as a list item or full panel.

### 12. Add `ConfirmAdvancePanel`

**Why:** Compose/text/pack stages share gated "confirm and advance" behavior
(`statecharts/README.md:162-184`).

**Target:** `src/templates/ConfirmAdvancePanel.tsx`.

**Acceptance:**

- Receives blocker count, resolved count, target stage label, primary action, and
  disabled reason.
- Uses `GatePanel` internally.
- Stories cover clean, blockers, dry-run failed, dry-run passed, and submitted.

### 13. Add `ArtifactTree`

**Why:** Proof pack, build package, zip, submit check, and archive repeat file
tree/package manifest displays (`COMPONENT_INDEX.md:56-61`, `:255-265`,
`:303-313`, `:372-382`).

**Target:** `src/primitives/ArtifactTree.tsx`.

**Acceptance:**

- Tree/list hybrid with file/folder/status/checksum/size fields.
- Collapsible groups and row action slots.
- Can represent keep/drop retention lists for archive.

## P2 - Workbench And Comparison Extensions

### 14. Extend `ArtifactViewer` with explicit compare modes

**Why:** PGDP page workbench calls for before/after compare and split views
across multiple stages (`final/pipeline/page-workbench.jsx:184-227`;
`statecharts/README.md:86`, `:122`).

**Target:** `src/stages/PageWorkbench/ArtifactViewer.tsx` or a companion
`CompareViewer`.

**Acceptance:**

- Supports before, after, split, overlay modes with two image sources.
- Keeps stage-specific overlays as slots.
- Does not regress existing labeler/PageWorkbench consumers.

### 15. Add reusable `WorkbenchLayout`

**Why:** PGDP page workbench uses a repeated two-pane shell with controls,
viewer, notes, stat grid, and action footer (`final/pipeline/page-workbench.jsx`).

**Target:** `src/templates/WorkbenchLayout.tsx`.

**Acceptance:**

- Slots: header, controls panel, viewer, sidecar, footer.
- Compatible with `StageControlsPanel` and `ArtifactViewer`.
- Stories cover narrow/wide and long-controls states.

## P2 - PGDP App-Local Stage Consumption Map

Build these in `pdomain-prep-for-pgdp` after the common components above. This
order keeps the app-local stage implementations thin. The table is a
consumption map, not a `pdomain-ui` package-subpath backlog.

| Family       | PGDP app-local stages                                                                       | Shared `pdomain-ui` base to consume                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Image review | `Threshold`, `Deskew`, `Denoise`, `Dewarp`, `PostTransformCrop`, `PostOcrCrop`, `CanvasMap` | `StageLifecycleBanner`, `ReviewFilterToolbar`, `ReviewPageGrid`, `InlineReviewEditorShell`, settings kit |
| OCR and text | `OCR`, `TextZones`, `TextReview`, `Illustrations`, `Regex`                                  | Workbench layout, gate panel, settings kit, specialized worklist/text components                         |
| Pack tail    | `ProofPack`, `BuildPackage`, `Zip`, `SubmitCheck`, `Archive`                                | `GatePanel`, `ConfirmAdvancePanel`, `ArtifactTree`, settings kit                                         |

Each app-local stage implementation should get:

- Local route/component files in `pdomain-prep-for-pgdp`.
- Storybook stories corresponding to PGDP `DCArtboard` states.
- Unit tests for interaction props and accessibility.
- Only stage-specific domain visuals, not duplicated toolbar/settings/gate code.

## Out Of Scope For `pdomain-ui`

- XState v5 machine implementations from `statecharts/*.yaml`.
- Backend registry re-cut, project-stage state, event log, SSE, and reindex
  behavior.
- PGDP-specific route mutations: submit, archive, library promotion, page-set
  mutation.
- Domain algorithms and geometry: dewarp mesh solving, OCR confidence scoring,
  validation rules, package manifest generation, regex engine behavior.
