---
kind: research
status: active
owner: CT
created: 2026-06-14
last_verified: 2026-11-12
---

# PGDP Design Handoff Gap Analysis

**Date:** 2026-06-14
**Scope:** Compare `pdomain-ui` against the newer PGDP app design package at
`../pdomain-prep-for-pgdp/docs/plans/design_handoff_pgdp_app`.
**Output:** Gaps only where the shared component library still needs work. This
is not a blank-slate port plan; substantial `pdomain-ui` work already exists.

## Shared foundations exist, but reusable stage patterns remain

`pdomain-ui` already covers the original shared design-system foundation. This
foundation includes tokens, primitives, shell chrome, pipeline/project templates,
canvas, worklists, and several stage slices. The newer PGDP handoff is broader:
it contains 24 wired pipeline stages, a Projects surface, the pipeline shell,
and 31 statechart YAMLs in the current sibling checkout. The remaining gaps are concentrated in two places:

1. New PGDP app-local stage surfaces that were previously out of scope because
   they had no final designs: threshold, deskew, denoise, dewarp, post-crops,
   canvas-map, OCR, text-zones, text-review, illustrations, regex, proof-pack,
   build-package, zip, submit-check, and archive.
2. Common abstractions that repeat across those app-local stages. Settings
   rows, cards, and sliders, plus `WorkbenchLayout`, have since shipped. See
   [cross-app common UI modules](../architecture/cross-app-common-ui-modules.md).
   Settings inheritance banners, gate and confirm panels, file and tree views,
   generic review-page grids, and reusable stage lifecycle chrome are still
   absent. The living list is the
   [roadmap](../plans/2026-06-14-pgdp-common-component-backlog.md).

Behavioral state machines, backend registry changes, event-log semantics, XState
implementations, and full PGDP stage tools remain app-owned. `pdomain-ui` should
expose presentational building blocks and typed component contracts. It should
not expose PGDP-specific orchestration or one-off stage screens. The handoff
defines this boundary: promote generic atoms/chrome to `pdomain-ui`, while stage
tools stay app-local. The original `PROMPT.md:79-82` citation is historical;
that overview file is absent from the current sibling checkout.

## Goal

Compare pdomain-ui with the newer PGDP design package and identify remaining
work that belongs in the shared component library.

## Method

Compare authoritative PGDP layouts and statecharts with the current package
exports, shared components, templates, workbench code, and stage barrels. Then
separate reusable presentation and typed contracts from app-owned orchestration
and stage-specific behavior.

## Evidence

The original analysis cites PGDP final layouts, statecharts, and `pdomain-ui`
exports. Current code also shows that the settings kit and WorkbenchLayout have
shipped. The review-foundation and pack-tail components named in the companion
backlog remain absent.

**Verification (2026-11-07):** `src/settings/index.ts` exports
`SettingsCard`, `SettingsRow`, `SettingsValue`, and `SettingSlider`; both
`src/primitives/index.ts` and `src/index.ts` re-export them. `WorkbenchLayout`
has implementation, story, tests, and public exports from `src/workbench/` and
the root barrel. The review-foundation and pack-tail names below remain absent
from `src/`.

## Conclusions

The shared-versus-app-owned boundary remains valid, but the gap list now needs
narrowing. Settings components and WorkbenchLayout are implemented. Lifecycle,
review composition, gates, confirmation, artifact-tree components, and
export-policy decisions remain open.

## Next steps

The 2026-11-12 roadmap pass completed the three follow-ups from this analysis:

1. Settings kit and WorkbenchLayout are marked complete in
   [cross-app common UI modules](../architecture/cross-app-common-ui-modules.md).
2. Their shipped paths are the `./settings` and `./workbench` subpaths, the
   primitives re-export for settings, and the root barrel.
3. Remaining review, gate, artifact-tree, and export decisions are sequenced
   in the [roadmap](../plans/2026-06-14-pgdp-common-component-backlog.md).

## What this does NOT establish

This analysis does not require pdomain-ui to implement complete PGDP stage
screens or own PGDP state machines, backend behavior, or domain algorithms.
Existing components and stage slices do not by themselves prove full visual or
behavioral conformance with the newer PGDP designs.

## PGDP and package sources define the comparison

The original handoff assigned look and layout to `final/` and behavior to
`statecharts/`. Its overview described 24 pipeline
stages, Projects, the pipeline shell, and the app-shell template:

PGDP source paths below are relative to
`../pdomain-prep-for-pgdp/docs/plans/design_handoff_pgdp_app/`.

The following overview citations are retained from the original analysis as
historical evidence. Their files are absent in the current checkout; they are
not current verification inputs.

- `README.md:9-20`
- `README.md:34-41`
- `PROMPT.md:11-33`
- `PROMPT.md:61-83`
- `statecharts/README.md:8-16`
- `statecharts/README.md:80-107`
- `statecharts/README.md:113-184`

Current verification on 2026-11-13 reads the concrete YAML contracts instead:
`stage-runner.yaml`, `tool-image-stage-review.yaml`, `page-workbench.yaml`,
`tool-source.yaml`, `tool-validation.yaml`, `tool-build-package.yaml`,
`tool-zip.yaml`, `tool-submit-check.yaml`, and `tool-archive.yaml` under
`statecharts/`. That directory contains 31 YAML files. The handoff root's
`README.md` and `PROMPT.md`, and `statecharts/README.md`, are absent. These
source checks establish proposed behavior, not implemented library components.

The current `pdomain-ui` package already exports broad shared surfaces:

- `package.json` exports, lines 28-140, for package subpaths and theme CSS exports.
- `src/primitives/index.ts:1-260` for primitives and cross-stage molecules.
- `src/templates/index.ts:1-68` for pipeline/project templates.
- `src/shell/index.ts:27-123` for suite shell, jobs, settings, dock, update, and compute panels.
- `src/canvas/index.ts:1-70` for Konva page rendering and overlays.
- `src/worklist/index.ts:1-66` for review lists.
- `src/stages/*/index.ts` for existing stage slices.

## Existing components cover the shared foundation

| Area                                       | Evidence                                                                                                                                                                                                                                                                                                                                         | Notes                                                                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token values and semantic color vocabulary | `theme/tokens.css:1-130`; PGDP `design-system/tokens.css:5-89`                                                                                                                                                                                                                                                                                   | Names and values align for the core surface, border, ink, accent, status, layer, font, and shadow tokens. `pdomain-ui` also has spacing, radius, type, transition, shadow, and overlay extensions.                        |
| Core atoms                                 | `src/primitives/index.ts:12-58`, `:123-149`, `:162-180`, `:237-249`                                                                                                                                                                                                                                                                              | Button, icon button, input, textarea, badge, chip, status pip, keycap, card, separator, segmented, progress, step dots, field/field row, page header, stat tile, flag chip, toggle, view toggle, backend chip, thumbnail. |
| Rich badge/status tones                    | `src/primitives/Badge.tsx`; [design-system composition](../architecture/design-system-composition.md)                                                                                                                                                                                                                                           | The older handoff's badge tone gap has been addressed.                                                                                                                                                                    |
| App shell and job chrome                   | `src/shell/index.ts:27-123`; PGDP `design-system/template.jsx:10-194`, `:293-300`                                                                                                                                                                                                                                                                | `AppShell`, `AppHeader`, `JobsPill`, `JobRow`, `JobsDrawer`, `Breadcrumb`, `TopNav`, drawers, right panel, settings modal, utility dock.                                                                                  |
| Pipeline/project templates                 | `src/templates/index.ts:11-68`; `src/templates/PipelineTemplate.tsx`; `src/templates/ProjectsLandingTemplate.tsx`; `src/templates/ProjectSettingsTemplate.tsx`                                                                                                                                                                                   | Stage strip, tabs band, projects drawer, pipeline template, project settings template, settings nav, projects landing, stage jump popover, configure frame.                                                               |
| Settings kit                               | `src/settings/index.ts`; `src/primitives/index.ts`; `src/index.ts`                                                                                                                                                                                                                                                                                | `SettingsCard`, `SettingsRow`, `SettingsValue`, and `SettingSlider` ship publicly. Verify any PGDP preset, inheritance, or dense-layout requirements against this kit before extending it.                              |
| Canvas/workbench foundation                | `src/canvas/index.ts:15-70`; `src/stages/PageWorkbench/index.ts:15-63`                                                                                                                                                                                                                                                                           | Page image canvas, overlay layers, selection/viewport hooks, `ArtifactViewer`, split/illustration/word/rotate overlays, stage controls, OCR text panel, page attributes panel, labeler canvas.                            |
| Workbench layout                           | `src/workbench/WorkbenchLayout.tsx`; `src/workbench/index.ts`; `src/index.ts`                                                                                                                                                                                                                                                                     | `WorkbenchLayout` ships with stories and tests. Verify PGDP slot needs before extending it; do not add a parallel shell.                                                                                                      |
| Existing stage-component slices            | `src/stages/Source/index.ts:9-44`; `src/stages/Grayscale/index.ts:11-41`; `src/stages/Crop/index.ts:9-50`; `src/stages/HyphenJoin/index.ts:6-39`; `src/stages/Validation/index.ts:6-19`; `src/stages/Scannos/index.ts:6-31`; `src/stages/PageReorder/index.ts:6-19`; `src/stages/Upload/index.ts:11-16`; `src/stages/QualityFlags/index.ts:6-11` | These are shipped building blocks, not proof that the full newer PGDP final screen is covered. Treat them as baseline evidence and review partial coverage below.                                                         |

## Existing stage slices cover only part of the newer designs

Some current stage slices map to an older handoff or wireframe subset. They are
not missing, but they do not fully cover the newer PGDP final designs. The table
focuses on areas where this pass found a concrete new shared-library decision.
Grayscale, Crop, HyphenJoin, Upload, and QualityFlags remain baseline shipped
slices. Any additional reuse needs roll into the review, settings, and workbench
gaps below.

| Area                  | Current `pdomain-ui` coverage                                                                                                                          | New PGDP handoff surface                                                                                                                                                                      | Shared-library gap                                                                                                    | App-owned remainder                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Source                | `SourceBanner`, `FileToolbar`, `ThumbCard`, `BulkBar`, `InsertDialog`, `SourcePageWorkbench`, `SourceStepSettings` (`src/stages/Source/index.ts:9-44`) | PGDP source also names `SourceFiles`, `SourceMetadata`, `SourceOverview`, `SourceStageControlsLeft`, `SourceViewer`, `SkeletonThumb`, and role/preview helpers (`COMPONENT_INDEX.md:300-301`) | Reusable skeleton thumbnail, metadata/overview sections if repeated, and tighter review toolbar/page-grid composition | Final Source route composition, real image ingestion state, OpenAPI/SSE wiring |
| Page order / reorder  | `AfterApplyStrip`, `ReorderScansBanner`, `PageThumb`, `SwapRow` (`src/stages/PageReorder/index.ts:5-19`)                                               | PGDP page order now includes naming, unified ledger/ribbon/spine, sequence/pages/overview/settings, page roles, and run-leaf management (`COMPONENT_INDEX.md:180-199`)                        | Artifact tree/ledger/spine primitives only if reused by pack/review surfaces; otherwise keep app-local                | Page-order machine, numbering/runs/leaves semantics, file naming rules         |
| Scannocheck / scannos | `CandidateDetail`, `ScannoToken`, `NavGroup`, `InlineMarkPopover`, `RuleDetail` (`src/stages/Scannos/index.ts:5-31`)                                   | PGDP Scannocheck has banner, pages, overview, settings, suspects, list builder, cards, thumbs, status/type chips (`COMPONENT_INDEX.md:288-289`)                                               | Settings kit, review page grid, typed list-builder shell if reused by word/hyphen libraries                           | Wordcheck rule semantics, global library promotion, OCR token source behavior  |
| Validation            | `SummaryHeader`, `PanelToolbar`, `CheckRow`, `DownloadFooter` (`src/stages/Validation/index.ts:6-19`)                                                  | PGDP validation also uses repeated `Body`, `Card`, `Gate`, `Seg`, `SetRow`, `Stat`, `Toggle2`, `Tree`, `VALMain`, and `VALSettings` (`COMPONENT_INDEX.md:370`)                                | Generic gate/confirm panel, settings kit, artifact/tree view                                                          | Validation rule catalog, blockers, PGDP acceptance checks                      |

## Remaining gaps center on reusable stage infrastructure

### 1. App-local stages need reusable shared infrastructure

`pdomain-ui` currently exposes stage subpaths for PageWorkbench, Source,
Grayscale, Crop, HyphenJoin, Validation, QualityFlags, Scannos, PageReorder,
and Upload (`package.json:69-108`). The PGDP handoff includes additional final
stage directories. These stages should be implemented mainly in
`pdomain-prep-for-pgdp`. The `pdomain-ui` work is the reusable substrate that
these app-local stages can consume:

| PGDP app-local stage surface | PGDP evidence                                                                     | Reusable `pdomain-ui` implication                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Threshold                    | `COMPONENT_INDEX.md:348-358`; `final/threshold/threshold.jsx`                     | Image-stage review shell, settings kit, compare viewer. Histogram/bilevel controls stay app-local until reused. |
| Deskew                       | `COMPONENT_INDEX.md:108-115`; `final/deskew/deskew.jsx`                           | Image-stage review shell and compare viewer. Guide-line overlays may be PageWorkbench slots.                    |
| Denoise                      | `COMPONENT_INDEX.md:93-100`; `final/denoise/denoise.jsx`                          | Image-stage review shell, review grid, protected-mark chip patterns if reused.                                  |
| Dewarp                       | `COMPONENT_INDEX.md:116-127`; `final/dewarp/dewarp.jsx`                           | Image-stage review shell and compare viewer. Mesh/curve visualization stays app-local unless reused.            |
| Post-transform crop          | `COMPONENT_INDEX.md:232-242`; `final/post_transform_crop/post-transform-crop.jsx` | Review grid/editor shell and possible BBox editor extension.                                                    |
| Post-OCR crop                | `COMPONENT_INDEX.md:220-230`; `final/post_ocr_crop/post-ocr-crop.jsx`             | Review grid/editor shell and content-thumb slots.                                                               |
| Canvas map                   | `COMPONENT_INDEX.md:75-87`; `final/canvas_map/canvas-map.jsx`                     | Review grid/editor shell; spread/aspect views likely app-local.                                                 |
| OCR                          | `COMPONENT_INDEX.md:162-172`; `final/ocr/ocr.jsx`                                 | Workbench layout, confidence/status chip primitives, settings kit. Recognition semantics stay app-local.        |
| Text zones                   | `COMPONENT_INDEX.md:344-346`; `final/text_zones/text-zones.jsx`                   | Workbench layout and zone-chip/legend patterns if reused. Page-split mutation stays app-local.                  |
| Text review                  | `COMPONENT_INDEX.md:319-331`; `final/text_review/text-review.jsx`                 | Review queue/worklist shell and confirm gate. Discussions and text-review machine stay app-local.               |
| Illustrations                | `COMPONENT_INDEX.md:151-160`; `final/illustrations/illustrations.jsx`             | Gallery/card patterns only if reused; illustration workflow stays app-local.                                    |
| Regex                        | `COMPONENT_INDEX.md:275-287`; `final/regex/regex.jsx`                             | Gate panel, settings kit, rule-row/list shell if reused. Regex semantics stay app-local.                        |
| Proof pack                   | `COMPONENT_INDEX.md:255-265`; `final/proof_pack/proof-pack.jsx`                   | Artifact tree and gate panel. Manifest semantics stay app-local.                                                |
| Build package                | `COMPONENT_INDEX.md:56-61`; `final/build_package/build-package.jsx`               | Artifact tree and gate panel; existing `BuildPackagePanel` remains the small launcher/control primitive.        |
| Zip                          | `COMPONENT_INDEX.md:372-382`; `final/zip/zip.jsx`                                 | Artifact tree, checksum/status rows, gate panel. Compression behavior stays app-local.                          |
| Submit check                 | `COMPONENT_INDEX.md:303-313`; `final/submit_check/submit-check.jsx`               | Gate/confirm panel and settings kit. Credential/live-submit behavior stays app-local.                           |
| Archive                      | `COMPONENT_INDEX.md:48-49`; `final/archive/archive.jsx`                           | Artifact tree, retention list, gate panel. Cold-storage route behavior stays app-local.                         |

### 2. Repeated helpers need typed shared exports

The PGDP component index repeats several helpers across 3-8 final files:
`Body`, `Card`, `Gate`, `Seg`, `SetRow`, `Stat`, `Toggle2`, `Tree`,
`SettingRow`, and `SettingSlider` (`COMPONENT_INDEX.md:21-31`). Current
`pdomain-ui` covers some under different names (`Card`, `Segmented`,
`StatTile`, `Toggle`, `FieldRow`) and ships the settings kit; the remaining
gaps are the reusable patterns below.

| Pattern                                  | Current coverage                                                     | Gap                                                                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Body` / stage body padding wrapper      | `PipelineTemplate` has a body slot; stage files hand-roll wrappers   | Add a lightweight `StageBody` or document that templates own body spacing.                                               |
| `Gate` / confirm panel                   | `Banner`, `QualityBanner`, `CheckIcon`, `Validation.CheckRow` exist  | No generic gate panel for validation/build/zip/submit/archive chains.                                                    |
| `SetRow` / `SettingRow` / `SettingsCard` | Public `SettingsCard`, `SettingsRow`, and `SettingsValue` from `src/settings/` | Verify PGDP preset, inheritance, and dense-layout requirements before extending the shipped kit. |
| `SettingSlider`                          | Public `SettingSlider` from `src/settings/`, re-exported from `/primitives` and the root | Verify PGDP units, value labels, and error-state needs before extending the shipped control. |
| `Tree` / artifact file tree              | No generic tree/list-tree primitive found in public exports          | Add tree component for build/proof/zip/archive package contents.                                                         |
| Review status dot / flag chip family     | `StatusPip`, `JobStatusPip`, `FlagChip`, stage-specific chips        | Need shared stage-review status/flag model to avoid per-stage chip clones.                                               |
| Filter toolbar with counts + density     | `FilterToolbar`, `ThumbSizeToggle`, `StageToolbar`                   | Needs a review-page toolbar composition that encodes filters, counts, density, selected count, and actions consistently. |
| Exclusive inline editor                  | Crop has `BboxEditor`; PageWorkbench has `StageControlsPanel`        | Image-stage review needs a generic inline editor shell with apply scope and confirm behavior.                            |

### 3. Common statechart projections need shared components

The statecharts identify reusable behavior patterns. The machines belong in the
app, but their visual projections need common components:

- `stageRunner` lifecycle projects into StageStrip dots and PipelineMini
  (`statecharts/stage-runner.yaml`).
- `imageStageReview` recurs across seven stages and requires flag-grid, bulk
  bar, exclusive inline editor, apply scope, and confirm gate
  (`statecharts/tool-image-stage-review.yaml`).
- `pageWorkbench` recurs across twelve stages and uses stage-control schemas as
  data (`statecharts/page-workbench.yaml`).
- Settings inheritance is repeated for every stage's Settings tab
  (`statecharts/tool-source.yaml` and `tool-image-stage-review.yaml`).
- Confirm-and-advance gates and the pack chain connect validation, build, zip,
  submit-check, and archive (`statecharts/tool-validation.yaml`, `tool-build-package.yaml`,
  `tool-zip.yaml`, `tool-submit-check.yaml`, and `tool-archive.yaml`).

`pdomain-ui` should expose components that render these projections from typed
data. It should not own the `XState` actors, SSE reconciliation, backend stage
registry, or event-log semantics. The original analysis attributed that
boundary to `PROMPT.md:63-83` and `PROMPT.md:123-157`; those unavailable
overview citations remain historical rather than current implementation proof.

### 4. Package exports need explicit stage policies

The `Projects` stage components exist under `src/stages/Projects/`. However,
the stage subpaths in `package.json` (lines 69-108) do not include
`./stages/Projects`. The current recommendation is in the
[roadmap](../plans/2026-06-14-pgdp-common-component-backlog.md): move the
folder to `pdomain-prep-for-pgdp` if only that app uses it, and add the
subpath only when a second app imports it.

Several existing stage folders are exported in their own barrels. PageWorkbench,
Source, Grayscale, and Crop are also re-exported from the root barrel in
`src/index.ts`. Later stage families are subpath-only. That mixed policy is
recorded in
[stage component library](../architecture/stage-component-library.md).

## App-owned behavior should remain outside the library

Do not promote these to `pdomain-ui` unless a second consumer needs them:

- XState v5 machine implementations and machine invariant tests.
- FastAPI/OpenAPI/backend registry, event log, SSE, and project reindex behavior.
- PGDP-specific route actions such as live submit, archive retention, or global
  word/hyphen library writes.
- Domain-specific visual math: dewarp mesh geometry, OCR confidence heuristics,
  validation rule definitions, regex engine semantics, and package manifest
  construction.

## Sequence the reusable work through the companion backlog

Use the companion backlog doc,
`docs/plans/2026-06-14-pgdp-common-component-backlog.md`, to sequence reusable
component work before PGDP app-local stage implementations consume those pieces.
