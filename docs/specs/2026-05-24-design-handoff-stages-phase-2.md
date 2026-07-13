---
title: "pdomain-ui design handoff — Phase 2: per-stage components (43 components + ArtifactViewer)"
date: 2026-05-24
kind: spec
status: implemented
owner: CT
created: 2026-05-24
last_verified: 2026-07-13
promotes_to: docs/architecture/stage-component-library.md
disposition: promote-then-retire
related:
  - pdomain-ui/MIGRATION_NOTES.md
  - pdomain-ui/docs/specs/2026-05-24-pdomain-ui-design-handoff-design.md
  - pdomain-prep-for-pgdp/docs/specs/2026-05-24-pdomain-ui-design-handoff-implementation.md
  - docs/plans/2026-05-24-pdomain-ui-design-handoff.md
milestone: "spec: pdomain-ui-design-handoff-phase-2 (#TBD)"
---

# pdomain-ui design handoff — Phase 2: per-stage components

## §1 TL;DR

Phase 1 (milestone #333) shipped 61 foundation exports: primitives, atoms,
shell molecules, full-page templates, cross-stage molecules, Storybook, and
store factories. What remains is **43 per-stage components** (across eight
stages and two add-on surfaces) plus one new **multi-consumer molecule**
(`ArtifactViewer`) that both `pdomain-prep-for-pgdp` and `pdomain-ocr-labeler-spa` need.

This spec defines the exhaustive component catalog, the prioritized milestone
order, the `ArtifactViewer` API (the critical cross-consumer deliverable),
the stage-folder layout convention, and the promotion rule for recurring
patterns. It is the source-of-truth for all Phase 2 GH issues in
`ocr-container-meta`.

**Consumer contract cross-reference:** this spec covers the pdomain-ui
library side. The pdomain-prep-for-pgdp consumer integration plan — routes,
stores, backend contracts, e2e acceptance — lives in
`pdomain-prep-for-pgdp/docs/specs/2026-05-24-pdomain-ui-design-handoff-implementation.md`.
Do not duplicate consumer-side content here.

---

## §2 Context

### Phase 1 scope (complete)

Milestone #333 closed with:

- `src/primitives/` — Button, Badge, Input, Chip, Separator, Tooltip,
  Toggle, StatTile, FlagChip, RowFlagBadge, DiskCostBanner, ViewToggle,
  QualityBanner, BulkActionBar, AttributesPanel, Segmented, KanbanBoard,
  ConfigureHeader, ConfigureTabs, ThumbGrid, StageJumpPopover,
  RunAllDirtyPanel, BuildPackagePanel, SummaryCell, SummaryStrip,
  ThumbFlagBadge, ThumbSizeToggle, FilterToolbar, TableHeader,
  TableFooter, ProjectConfigureFrame.
- `src/icons/` — `<Icon name>` dispatcher + 28 added lucide exports.
- `src/shell/` — AppShell, AppHeader, JobsPill, JobsDrawer, JobRow,
  TopNav, Breadcrumb, Drawer.
- `src/templates/` — PipelineTemplate, ProjectSettingsTemplate,
  ProjectsLandingTemplate, StageStrip, TabsBand, ProjectsDrawer,
  SettingsNav.
- `src/canvas/` — PageImageCanvas + slots (slot-based Konva wrapper).
- `src/worklist/` — VirtualizedWordList.
- `src/stores/` — factory functions (UIPrefs, SuiteSiblings, AppShell).
- `src/types/generated/` — codegen types from pdomain-book-tools schemas.
- `src/testids/` — testid constants catalog.

### What remains (Phase 2 scope)

Eight stage-specific folders and one cross-cutting component that recurs
across two consumer repos:

| Folder | Components | Notes |
|---|---|---|
| `src/stages/Source/` | 7 | `final/source/` |
| `src/stages/Grayscale/` | 8 | `final/grayscale/` + WF11 |
| `src/stages/Crop/` | 7 | `final/crop/` + WF10 |
| `src/stages/PageReorder/` | 4 | `wf09/` |
| `src/stages/Scannos/` | 6 | `wf05b/` |
| `src/stages/HyphenJoin/` | 8 | `final/hyphen_join/` + WF05 |
| `src/stages/Validation/` | 6 | `wf02/` |
| `src/stages/PageWorkbench/` | 11 | `wf-pw/` |
| Add-ons: QualityFlags | 3 | `wf03/` augmentations |
| Add-ons: Projects | 3 | `final/projects/` augmentations |
| Add-ons: Upload | 2 | `wf01/` modal variants |
| **Total** | **69 named** | after promotion dedup: **43 net new** |

"Net new" deducts: Drawer (already in shell/), ProjectsEmpty merged into
ProjectsLandingTemplate (Phase 1), StageContextStrip/StageJumpPopover/
FilterToolbar/BulkActionBar (already in primitives/), and the 6 per-stage
control sub-exports of StageControlsPanel that share a single compound
component.

### Design sources

All design sources are in `pdomain-ui/docs/templates/design_handoff_pdomain_ui/`:

- `final/source/source.jsx` — Source stage
- `final/grayscale/grayscale.jsx` — Grayscale stage
- `final/crop/crop.jsx` — Crop stage
- `final/hyphen_join/hyphen.jsx` — Hyphen Join stage
- `final/projects/projects.jsx` — Projects landing
- `wf09/pages-tab.jsx` — Page Reorder stage
- `wf05b/scanno-capture.jsx`, `scanno-promote.jsx`, `scanno-configure.jsx` — Scannos
- `wf05/` — Hyphen Join workbench variants
- `wf02/validation-panel.jsx` — Validation stage
- `wf03/wf03-variations.jsx` — Quality Flags add-ons
- `wf-pw/wf-pw-variations.jsx` — Page Workbench cross-cutting
- `wf01/` — Folder upload modal variants
- `wf10/crops-grid.jsx` — Crop card density modes
- `wf11/wf11-variations.jsx` — Grayscale variant explorations

### Two-consumer constraint

`ArtifactViewer` is the only Phase 2 component needed by **two** consumer
repos before either can proceed with page-workbench work:

- `pdomain-prep-for-pgdp` — `PageWorkbenchPage` image annotation surface.
- `pdomain-ocr-labeler-spa` — its image-annotation surface (currently ad-hoc
  Konva chrome that will migrate to the shared molecule).

This shared need elevates `ArtifactViewer` to the first milestone.

---

## §3 Goals / Non-Goals

### Goals

- Catalog every per-stage component not shipped in Phase 1, assign it a
  canonical name and target path, and write its slot/prop API surface.
- Specify `ArtifactViewer` in detail (props, overlays, slot API, Storybook
  stories) so both consumers can start integration immediately.
- Define the `src/stages/<stage>/` folder layout convention and the barrel
  export pattern for per-stage subpath exports.
- Define the promotion rule: recurring patterns that appear across 2+ stages
  get promoted to `src/primitives/` rather than duplicated in stage folders.
- Establish the milestone order so per-stage issues can be filed and tracked
  in `ocr-container-meta`.

### Non-Goals

- **Consumer wiring**: routes, stores, and backend contracts are out of scope
  for pdomain-ui. That work belongs in per-consumer specs (the pdomain-prep-for-pgdp
  spec is already written; pdomain-ocr-labeler-spa's is pending).
- **Stages without a design source**: Dewarp, Deskew, Threshold, Denoise,
  OCR, Spellcheck, Illustrations, Regex, Page Split, Proof Pack, Zip, Build
  Package, Submit Check, Archive are listed as no-design in `final/index.html`
  — out of scope until designs exist.
- **Backend adapters**: `pdomain-ops` is the owner of suite plumbing; pdomain-ui
  never imports from it.
- **Animated transitions / micro-interactions**: the JSX prototypes are the
  spec for what exists, not pixel-perfect timing curves.
- **Breaking existing Phase 1 APIs**: new stage subpath exports are additive;
  `./primitives`, `./shell`, `./templates`, `./canvas`, `./icons` are frozen.

---

## §4 Constraints

- All Phase 1 hard constraints apply (no CVA, no hex literals, no direct
  `lucide-react` imports outside `src/icons/`, stores are factories,
  strict TS).
- `ArtifactViewer` must compose `PageImageCanvas` via its existing slot API
  — it must not duplicate or bypass the Konva stage management.
- Per-stage components must not import each other across stage folders.
  Shared patterns go to `src/primitives/` first.
- No `!important` in ported CSS; strip all design-canvas scaffold
  (`DesignCanvas`, `DCSection`, `DCArtboard`).
- `data-screen-label` / `data-comment-anchor` attributes from prototypes map
  to `src/testids/` constants — coordinate naming with consumers before
  shipping a stage.
- `make ci AI=1` green before every commit.
- `pnpm codegen:check` must remain clean — no hand-edits to
  `src/types/generated/`.

---

## §5 Options Considered

### O-A · Stage-parallel: ship all stages simultaneously as one milestone

Rejected. 43 components across 8 stages is too large to review or
integrate atomically. No stage-specific component is blocked by another
stage; parallel implementation would balloon the WIP surface.

### O-B · Stage-serial: one stage per milestone, alphabetical order

Possible but sub-optimal. `ArtifactViewer` (Page Workbench) is the
critical-path item for both consumers; shipping Source first would delay
both consumers' page-workbench work.

### O-C · Dependency-ordered milestones: ArtifactViewer first (chosen)

`ArtifactViewer` unblocks two consumers. Page Workbench cross-cutting
(PWHeader, EditModeSelector, StageControlsPanel, etc.) depends on
`ArtifactViewer` and itself unblocks per-stage control panels.
Remaining stages are independent; order them by wired-vs-wireframe
priority (wired stages in `final/` before wireframe-only stages).

### O-D · Promote all recurring patterns to primitives first, then stages

Good principle but impractical as a blocking gate. Promotions are identified
per-stage as work proceeds; the promotion rule (§6.5) is a guideline, not a
pre-pass.

**Decision: O-C** — dependency-ordered milestones.

---

## §6 Decision

### §6.1 Scope and prioritization order

Milestones ordered by dependency and consumer unblocking:

| Milestone | Contents | Unblocks |
|---|---|---|
| M1 | `ArtifactViewer` + three overlays | both consumers' page-workbench integration |
| M2 | Page Workbench cross-cutting (10 components) | per-stage workbench control panels |
| M3 | Source stage (7 components) | pdomain-prep-for-pgdp S01 slice |
| M4 | Grayscale stage (8 components) | pdomain-prep-for-pgdp S02 slice |
| M5 | Crop stage (7 components) | pdomain-prep-for-pgdp S03 slice |
| M6 | Hyphen Join stage (8 components) | pdomain-prep-for-pgdp S15 slice |
| M7 | Scannos stage (6 components) | pdomain-prep-for-pgdp S13 slice |
| M8 | Page Reorder stage (4 components) | pdomain-prep-for-pgdp S11 slice |
| M9 | Validation stage (6 components) | pdomain-prep-for-pgdp S19 slice |
| M10 | Quality Flags add-ons (3 components) | pdomain-prep-for-pgdp wf03 slice |
| M11 | Projects add-ons (3 components) | pdomain-prep-for-pgdp landing slice |
| M12 | Upload modal add-ons (2 components) | pdomain-prep-for-pgdp wf01 slice |

Stages M3–M5 are fully wired in `final/` and have the richest design
detail; M6–M9 are well-specified in the wf-series wireframes; M10–M12
add incremental components on top of already-shipped templates.

---

### §6.2 Per-stage component catalog

All 43 net-new components. "Design source" references are
`file:line-range` inside `pdomain-ui/docs/templates/design_handoff_pdomain_ui/`.

#### Stage: Source (`src/stages/Source/`)

7 components.

| Component | Design source | Description |
|---|---|---|
| `SourceBanner` | `final/source/source.jsx:238-341` | State-machine banner: idle / generating (with progress) / selection (count + bulk actions). Props: `state`, `progress`, `selectedCount`, `onBulkAction`. **Shipped 2026-05-25 · a49d8bd** (3 discriminated branches; created `./stages/Source` subpath + vite entry). |
| `FileToolbar` | `:344-406` | Filter chips (All/Marked/Skipped/Unmarked/Inserts with counts) + density toggle S/M/L + "Insert page" CTA. Props: `filter`, `onFilterChange`, `density`, `onDensityChange`, `onInsert`. **Shipped 2026-05-25 · d84310f** (plain `<button>` chips with `aria-pressed` — Chip primitive is non-interactive; Segmented for density). |
| `ThumbCard` | `:126-208` | Thumbnail card: checkbox (M/L density only), page number, status dot, role badge, image thumbnail. Props: `page`, `density`, `selected`, `onSelect`, `onRoleChange`. **Shipped 2026-05-25 · 6f70690** (article container, button for clickable body — a11y; native `<select>` for role change; status dot via `data-status` attr). |
| `BulkBar` | `:409-458` | Sticky bottom bulk-action bar: selected count + role actions (Page/Cover/Back/Blank/Duplicate) + danger Remove. Props: `selectedCount`, `onAction`. **Shipped 2026-05-25 · 14a765f** (`BulkAction` union; sticky positioning is CSS-only). |
| `InsertDialog` | `:461-595` | Modal dialog: position (Before/After), anchor filename selector, kind (Missing/Blank/Errata/Manual), note with 280-char counter, replacement image dropzone. Props: `open`, `onOpenChange`, `anchorOptions`, `onInsert`. **Shipped 2026-05-25 · aa2494f** (Dialog primitive; kind as role=radio card grid; hard-stop submit at >280 chars; inline file dropzone — no external dnd lib). |
| `SourcePageWorkbench` | `:1240-1267` | Per-page detail view: 5-button role segment, page number, rotation, tone hint, before/after image viewer (uses `ArtifactViewer`), prev/next/apply navigation. Props: `page`, `onRoleChange`, `onApply`, `onNavigate`. **Shipped 2026-05-25 · c7e3754** (uses ArtifactViewer overlayMode='view' with afterImageUrl; true before/after split is follow-on requiring ArtifactViewer 2-image API). |
| `SourceStepSettings` | Step Settings tab block | Preset dropdown + save-as-preset + thumbnail quality radio + concurrent workers slider (1–8) + re-generate button + auto-confirm toggle. Props: `settings`, `onChange`, `onSavePreset`. **Shipped 2026-05-25 · ee0d270** (inline save-preset form — no native prompt; integer-step slider; plain radios for thumb quality). |

#### Stage: Grayscale (`src/stages/Grayscale/`)

8 components.

| Component | Design source | Description |
|---|---|---|
| `BackendChip` | `final/grayscale/grayscale.jsx:43-63` | GPU/CPU indicator chip. Reused in Grayscale and Page Workbench. Promote to `src/primitives/` — see §6.5. Props: `backend`, `fallback`. **Shipped 2026-05-24 · 1cfc595** (M2 atom promotion). |
| `AutoDetectBanner` | `:70-112` | Rationale banner: detected mode + estimated time + re-detect button. Props: `mode`, `profile`, `estimatedSecondsPerPage`, `onRedetect`. **Shipped 2026-05-25 · 721dab9** (created `./stages/Grayscale` subpath; aside + Sparkles icon). |
| `ModeCard` | `:119-209` | Two-up mode chooser (Standard/Perceptual): checkmark + time estimate badge (exact/fuzzy tone). Props: `selectedMode`, `onModeChange`, `estimates`. **Shipped 2026-05-25 · 485d628** (`role="radiogroup"` + 2 `role="radio"` cards; Badge tone for estimates). |
| `AdvancedParams` | `:215-296` | 3-slider accordion (Sampler radius / Gamma 1–3 / Output range), each with numeric input + reset. Props: `params`, `onChange`. **Shipped 2026-05-25 · 485d628** (Accordion-wrapped; per-field reset to GRAYSCALE_PARAMS_DEFAULT; output row is 2 number inputs). |
| `GrayscaleOverview` | `:351-419` | Stat tiles + summary cards tab. Props: `stats`. **Shipped 2026-05-25 · 485d628** (4 StatTile primitives + optional mode breakdown cards). |
| `GrayThumb` | `:425-462` | Per-page thumbnail with time estimate overlay. Props: `page`, `estimatedSeconds`. **Shipped 2026-05-25 · 485d628** (interactive prop renders button only when onClick also provided). |
| `PageViewer` | `:888-1013` | Split before/after viewer (Before/Split/After segmented) with 13-page thumbnail scroller + re-run button. Composes `ArtifactViewer`. Props: `page`, `mode`, `onModeChange`, `onRerun`. **Shipped 2026-05-25 · 485d628** (before/after → overlayMode='view'; split → overlayMode='split' with splitX=0.5; thumb scroller uses role="group"). |
| `StageControlsLeft` | `:673-823` | Per-page left-drawer control panel: inheritance banner (clean/modified/preset) + CPU-fallback warning + mode chooser + advanced params + sticky footer (Revert / "Save as default"). See §6.5 for promotion note. Props: `inheritance`, `params`, `onChange`, `onRevert`, `onSave`. **Shipped 2026-05-25 · 485d628** (composes M2 StageControlsPanel + ModeCard + AdvancedParams in `controlsSlot`). |

#### Stage: Crop (`src/stages/Crop/`)

7 components.

| Component | Design source | Description |
|---|---|---|
| `CropBanner` | `final/crop/crop.jsx:268-384` | State-machine banner: running / review (with flag summary) / done. Props: `state`, `flagCounts`, `onRerun`. |
| `CropToolbar` | `:387-476` | Filter chips (All/Flagged/Clean/Reviewed/Errors) + per-flag drill-down (when filter=flagged) + re-run CTA + density toggle. Props: `filter`, `onFilterChange`, `activeFlagDrill`, `density`, `onDensityChange`, `onRerun`. |
| `CropCard` | `:154-263` | Per-page crop thumbnail: checkbox (M/L), page number, status dot, flag chips (max 1/2/4 per density + "+N" overflow), CroppedThumb with bbox overlay. Props: `page`, `density`, `selected`, `onSelect`. |
| `CropBulkBar` | `:479-522` | Bulk action bar: flag summary + Re-deskew only / Re-run from initial_crop (N) / Accept as-is / Restore default bbox. Props: `selectedCount`, `flagSummary`, `onAction`. |
| `BboxEditor` | `:552-754` | Interactive bbox editor: 8 draggable handles + T/R/B/L margin inputs (px/% unit toggle) + delta-from-default + apply-to scope (This page / Selected N / All flagged). Composes `ArtifactViewer` for the magnified page view. Props: `page`, `bbox`, `onChange`, `onApply`, `scope`, `onScopeChange`. |
| `CropOverview` | `:849-941` | Flag distribution chart + activity log. Props: `flagDistribution`, `recentActivity`. |
| `CropStepSettings` | `:947-1211` | Strategy radio (Edge-detect/ML model/Manual/From source) + margin slack slider + symmetry guard toggle + min page area slider + auto-accept toggle + re-deskew after crop toggle + stale-bump warning. Props: `settings`, `onChange`. |

#### Stage: Page Reorder (`src/stages/PageReorder/`)

4 components.

| Component | Design source | Description |
|---|---|---|
| `ReorderScansBanner` | `wf09/pages-tab.jsx:530-578` | Banner: detected (sparkles + count + "N detected / M high / K medium" + sort dropdown + "Skip stage" + "Auto-apply (M high)") vs clean (green checkmark + "Re-detect"). Props: `state`, `detected`, `highCount`, `mediumCount`, `sortBy`, `onSort`, `onAutoApply`, `onSkip`, `onRedetect`. |
| `SwapRow` | `:414-487` | Per-swap decision row: number badge + PageThumb pair + confidence badge (high/medium) + reasoning text + mono signal list + action buttons (Pending: Skip/Inspect/Accept; Post-decision: static badge). Props: `swap`, `state`, `onSkip`, `onInspect`, `onAccept`. |
| `PageThumb` | `:379-412` | Reorder-specific page thumbnail pair with central swap icon. Distinct from Source's `ThumbCard` — reorder context only, no role badges. Props: `pageA`, `pageB`. |
| `AfterApplyStrip` | `:630-645` | Post-apply confirmation strip: accepted/skipped summary + "Undo" affordance. Props: `acceptedCount`, `skippedCount`, `onUndo`. |

#### Stage: Scannos (`src/stages/Scannos/`)

6 components.

| Component | Design source | Description |
|---|---|---|
| `ScannoToken` | `wf05b/scanno-capture.jsx:77-92` | Underlined span marking a suspect token in the page text. Props: `token`, `source` (rule/ocr/manual — maps to token color), `onClick`. |
| `InlineMarkPopover` | `:366-413` | Inline popover on token click: accept / dismiss / promote actions + confidence label + rule source. Props: `token`, `open`, `onAccept`, `onDismiss`, `onPromote`, `onClose`. |
| `CandidateDetail` | `wf05b/scanno-promote.jsx:300-410` | Right-pane candidate detail: evidence contexts (3 of N), promote-preview form, promote/dismiss actions. Props: `candidate`, `contexts`, `onPromote`, `onDismiss`. |
| `RuleDetail` | `wf05b/scanno-configure.jsx:290-406` | Right-pane rule detail: hits count / contributing books / contributors + auto-apply toggle + conflict warnings. Props: `rule`, `onToggleAutoApply`. |
| `ToggleBadge` | `:265-288` | Mini auto-apply toggle badge for table rows. Renders as a labeled switch inline with text. Promote to `src/primitives/` — see §6.5. Props: `checked`, `onCheckedChange`, `label`. **Shipped 2026-05-24 · 48c4bce** (M2 atom promotion). |
| `NavGroup` | `:236-263` | Side-nav category group header with expand/collapse. Used in the scanno rule library left nav. Props: `label`, `count`, `expanded`, `onToggle`, `children`. |

#### Stage: Hyphen Join (`src/stages/HyphenJoin/`)

8 components.

| Component | Design source | Description |
|---|---|---|
| `HyphenOverview` | `final/hyphen_join/hyphen.jsx` | Workflow cards + stat tiles (undecided / auto-joined / mismatch / flagged) + `PostBookNotesPreview`. Props: `stats`, `notesPreview`. |
| `HyphenUndecided` | Undecided tab block | Queue sidebar (sorted list of undecided cases) + focused case detail with `HJDecisionCard`. Props: `cases`, `selectedId`, `onSelect`, `onDecide`. |
| `HyphenAutoJoined` | Auto-joined tab block | Grouped-by-word validation view. Props: `groups`, `onValidate`. |
| `HyphenMismatch` | `MismatchedReportV4` block | Mismatch report view: conflicting-decision table. Props: `mismatches`, `onResolve`. |
| `HyphenStepSettings` | Step Settings block | Rule library panel + n-gram cache controls + auto-flag thresholds. Props: `settings`, `onChange`. |
| `HyphenPageWorkbench` | `:1059-1193` | Per-page before/after split with `HJDecisionCard` (Validate join / Accept / Keep / Flag). Composes `ArtifactViewer`. Props: `page`, `cases`, `onDecide`. |
| `HJStatusPill` | `:534-568` | Status pill for a hyphen-join decision: cross-page (purple/gt), validated (green/exact), auto-joined (dashed exact), undecided (amber/fuzzy), flagged (red/mismatch). Props: `status`. |
| `HJDecisionCard` | Case detail block | Inline case detail: original text + join proposal + ngrams sparkline + keyboard shortcut hints (J/K/Y/N/F). Props: `case`, `onAccept`, `onKeep`, `onFlag`, `onNext`, `onPrev`. |

#### Stage: Validation (`src/stages/Validation/`)

6 components.

| Component | Design source | Description |
|---|---|---|
| `SummaryHeader` | `wf02/validation-panel.jsx:102-148` | Pass/warn/error state banner with check counts and primary CTA. Props: `state`, `counts`, `onDownload`, `onFixAll`. |
| `PanelToolbar` | `:150-168` | Re-validate button + last-run timestamp. Props: `lastRun`, `onRevalidate`. |
| `CheckRow` | `:42-100` | Collapsible check row: check name + `CheckIcon` + affected page chips (collapsed) / full affected page list (expanded). Props: `check`, `expanded`, `onToggle`. |
| `CheckIcon` | `:7-25` | State icon: pass (green check) / warn (amber alert) / error (red x) / running (spinner) / skip (dash). Promote to `src/primitives/` — see §6.5. Props: `state`. **Shipped 2026-05-24 · 4b1d788** (M2 atom promotion). |
| `PageChip` | `:28-40` | Mono-font page prefix navigation chip (e.g. `p019`). Promote to `src/primitives/` — see §6.5. Props: `prefix`, `onClick`. **Shipped 2026-05-24 · 10d2688** (M2 atom promotion; kanban's prior `PageChip` export renamed to `KanbanPageChip` to clear the name). |
| `DownloadFooter` | `:170-206` | Contextual CTA footer: "Download" (pass state) / "Download anyway" + "Fix & rebuild" (warn) / "Fix all (N)" (error, download disabled). Props: `state`, `fixableCount`, `onDownload`, `onFix`. |

#### Page Workbench cross-cutting (`src/stages/PageWorkbench/`)

11 components (Drawer already shipped in `src/shell/`).

| Component | Design source | Description |
|---|---|---|
| `ArtifactViewer` | `wf-pw/wf-pw-variations.jsx:264-444` | **Multi-consumer molecule** — see §6.3 for full API spec. Composes `ArtifactPlate` + `PaperRender` + three overlays on top of `PageImageCanvas`. **Shipped 2026-05-24 · 9f81be7** (M1 complete: ArtifactViewer + SplitOverlay + IllustOverlay + WordBboxOverlay + RotateHandle; subpath `./stages/PageWorkbench`). |
| `PWHeader` | `:19-52` | Page Workbench header: breadcrumb (project / stage / page) + Prev/Next page buttons + `EditModeSelector` + actions slot. Props: `breadcrumb`, `currentIdx`, `total`, `onPrev`, `onNext`, `mode`, `onModeChange`, `actionsSlot`. **Shipped 2026-05-24 · 7e08a19** (uses existing Breadcrumb/Button; counter is 1-indexed). |
| `EditModeSelector` | `:54-83` | Segmented control: View / Split / Illustration / Rotate. Props: `mode`, `onModeChange`. **Shipped 2026-05-24 · 7f9b774** (composes Segmented; `EditMode` type subset of `OverlayMode`). |
| `PageAttributesBar` | `:100-223` | Collapsible inline attribute bar + `AttrEditorPopover` (inline value editing). Props: `attrs`, `onChange`. **Shipped 2026-05-24 · 21cbe44** (AttrEditorPopover internal — not re-exported; native `<select>` inside popover to avoid nested-portal conflicts). |
| `StageControlsPanel` | `:457-668` | Left-drawer container that hosts per-stage control sub-components. Slot-based: accepts a `controlsSlot` render prop for per-stage controls (`ThresholdControls`, `GrayscaleControls`, `DeskewControls`, `InitialCropControls`, `OcrControls`). Props: `controlsSlot`, `inheritance`, `onRevert`, `onSave`. **Shipped 2026-05-24 · 649eacb** (banner copy: clean→"Using defaults", modified→"Overrides active", preset→"Preset applied"; composes BackendChip for `cpuFallback` warning). |
| `HierarchyTreePanel` | `:1296-1414` | Right-drawer tree panel: block/paragraph/line/word hierarchy with `TreeRow` (expand/collapse + type badge + selection). Props: `tree`, `selectedId`, `onSelect`, `onTypeChange`. **Shipped 2026-05-24 · e4417c2** (TreeRow internal; native `<select>` for type-change menu; badge tone block/paragraph/line/word → brand/ocr/clean/neutral). |
| `BlockTypePickerPanel` | `:1440-1534` | Right-drawer type picker: grid of block types (`TypeGrid`) for reassigning selected block. Props: `selectedType`, `onSelect`. **Shipped 2026-05-24 · 63ba716** (TypeGrid internal; 3-col grid with roving-tabindex keyboard nav). |
| `PageAttributesPanel` | `:1538-1622` | Right-drawer full attribute editor (full expansion of `PageAttributesBar`). Props: `attrs`, `onChange`. **Shipped 2026-05-24 · 6b77cde** (vertical form; commit-on-blur/Enter for text/number; immediate-on-change for select; reuses `PageAttribute` type from PageAttributesBar). |
| `OcrTextPanel` | `:1763-1983` | Right-drawer OCR text review: `LineBlockCards` / `LineBlockRows` / `WordCard` / `WordRow` with `ConfPip` (confidence pip). Props: `lines`, `viewMode`, `onWordEdit`. **Shipped 2026-05-24 · b2b9f88** (5 internals: LineBlockCard/Row + WordCard/Row + ConfPip; ConfPip thresholds 0.9/0.7 exact/fuzzy/mismatch). |
| `TextReviewPane` | `:711-785` | Collapsible bottom pane (280px open / 44px collapsed). Props: `text`, `open`, `onOpenChange`. **Shipped 2026-05-24 · fad741f** (pure CSS open/closed via `data-open` attr; accepts string or ReactNode; added `chevU` icon to dispatcher). |
| `LabelerCanvas` | `:1132-1287` | Annotation-mode canvas (extends `PageImageCanvas` with labeler overlays: block bbox drawing, selection handles, `LayerToggle` UI). Props: `imageUrl`, `blocks`, `onBlocksChange`, `layerVisibility`, `onLayerVisibilityChange`. **Shipped 2026-05-24 · 9fb1e71** (M2 rendering-only — drag-to-create + handle-drag out of scope, follow-on if needed; composes PageImageCanvas underlay/tool slots; LayerToggle internal). |

#### Add-ons: Quality Flags (`src/stages/QualityFlags/`)

3 components (QualityBanner already shipped as `src/primitives/QualityBanner`,
StageContextStrip/StageJumpPopover/FilterToolbar already shipped).

| Component | Design source | Description |
|---|---|---|
| `StageContextStrip` (variant=configure) | `wf03/wf03-variations.jsx:375-451` | `StageContextStrip` with a `variant` prop for the configure-page context; if the Phase 1 export lacks this variant, add it non-breakingly. |
| `PageThumb` (quality-flags variant) | `:489-569` | Per-page thumbnail with quality flag pills overlaid. Distinct from Source's `ThumbCard` (no role segment). Props: `page`, `flags`, `selected`, `onSelect`. |
| `PageRow` | `:781-827` | List-mode page row with inline flag pills + tone-colored score cells. Props: `page`, `flags`. |

Note: `BulkActionBar` is already in `src/primitives/` as Phase 1 output;
the QualityFlags `BulkActionBar` usage just composes it.

#### Add-ons: Projects (`src/stages/Projects/` or `src/templates/`)

3 components. `ProjectsPage` and `ProjectsEmpty` were partially merged into
`ProjectsLandingTemplate` in Phase 1. These are the sub-components that
remain un-exported or need an explicit named export:

| Component | Design source | Description |
|---|---|---|
| `PipelineMini` | `final/projects/projects.jsx:93-116` | 23-dot pipeline progress strip (compact, for the projects sidebar). Props: `stages`, `activeStageId`. |
| `AttributesPanel` (projects variant) | `:157-285` | Collapsible 2-column attributes panel for projects detail pane (Bibliographic / PGDP project / Format / Comments sections). Phase 1 shipped `AttributesPanel` as a generic primitive; this adds the projects-specific default sections as a thin wrapper or slot configuration. |
| `ProjectsEmpty` | `:656-723` | First-time hero empty state. Check if already absorbed into `ProjectsLandingTemplate state="empty"` (Phase 1 decision OQ-11) — if so, close as no-op; if the hero needs a standalone export, add it. |

#### Add-ons: Upload modal (`src/stages/Upload/`)

2 components (the 5 `ModalA`–`ModalE` variants were all specified in the
consumer spec; pdomain-ui ships the two production variants plus Storybook stories
for the others):

| Component | Design source | Description |
|---|---|---|
| `ModalC` | `wf01/` ModalC block | Desktop right-side sheet: 4-step left rail (Name / Source / Review / Upload) + right content area. Props: `open`, `onOpenChange`, `step`, `onStepChange`, `stepContent`. |
| `ModalB` | `wf01/` ModalB block | Compact drop target (<768px): single-page compact modal with drag-and-drop zone. Props: `open`, `onOpenChange`, `onFiles`. |

Storybook stories for ModalA, ModalD, ModalE: created but not exported from
subpath (design-exploration only).

---

### §6.3 ArtifactViewer API specification

`ArtifactViewer` is the Phase 2 critical-path component. Both
`pdomain-prep-for-pgdp` and `pdomain-ocr-labeler-spa` depend on it for their
image-annotation surface. It is exported as a top-level named export from
`@pdomain/pdomain-ui/stages/PageWorkbench` (and also re-exported from the
root barrel under `./stages`).

#### Role

`ArtifactViewer` is a **composition molecule** that wraps:

1. `ArtifactPlate` — the visual chrome (paper shadow, border, padding).
2. `PaperRender` — the image rendering layer (scales the source image to
   fit the plate with configurable object-fit).
3. One of three **overlay modes** on top of `PageImageCanvas` Konva slots:
   - `SplitOverlay` — draggable vertical split line for before/after comparison.
   - `IllustOverlay` — illustration bbox highlight boxes.
   - `WordBboxOverlay` — per-word bounding-box rectangles.

`PageImageCanvas` from `src/canvas/` provides the Konva `Stage` and
background image layer. `ArtifactViewer` uses `PageImageCanvas`'s slot API
to mount the active overlay as a child layer — it does not bypass or
replicate Konva stage management.

#### Props

```tsx
export type OverlayMode =
  | 'view'        // no overlay
  | 'split'       // before/after draggable split
  | 'illust'      // illustration bbox highlight
  | 'rotate'      // rotation handle (EditModeSelector rotate mode)
  | 'words';      // word-level bbox overlay

export interface SplitProposal {
  /** Normalized x position of the split line (0–1). */
  splitX: number;
  onSplitXChange?: (x: number) => void;
}

export interface IllustBbox {
  id: string;
  /** Normalized [x, y, w, h] relative to image dimensions. */
  bbox: [number, number, number, number];
  label?: string;
}

export interface WordBbox {
  id: string;
  /** Normalized [x, y, w, h] relative to image dimensions. */
  bbox: [number, number, number, number];
  confidence?: number;
  selected?: boolean;
}

export interface ArtifactViewerProps {
  /** Source URL for the page image. */
  imageSrc: string;
  /** Page geometry (original pixel dimensions, used to compute scale). */
  pageWidth: number;
  pageHeight: number;
  /** Active overlay mode. Defaults to 'view'. */
  overlayMode?: OverlayMode;
  /** Data for SplitOverlay (required when overlayMode='split'). */
  splitProposal?: SplitProposal;
  /** Data for IllustOverlay (required when overlayMode='illust'). */
  illustBboxes?: IllustBbox[];
  /** Data for WordBboxOverlay (required when overlayMode='words'). */
  wordBboxes?: WordBbox[];
  /** Called when a word bbox is clicked (overlayMode='words'). */
  onWordClick?: (id: string) => void;
  /** Rotation angle in degrees (overlayMode='rotate'). */
  rotationDeg?: number;
  onRotationChange?: (deg: number) => void;
  /** CSS class applied to the outer ArtifactPlate wrapper. */
  className?: string;
  /** Slot for additional Konva layers (advanced — use sparingly). */
  extraLayersSlot?: React.ReactNode;
}
```

#### Internal structure

```
ArtifactViewer
  └─ ArtifactPlate (paper shadow + border)
       └─ PaperRender (image scaling layer)
            └─ PageImageCanvas (Konva Stage + background image slot)
                 ├─ SplitOverlay      [when overlayMode='split']
                 ├─ IllustOverlay     [when overlayMode='illust']
                 ├─ WordBboxOverlay   [when overlayMode='words']
                 ├─ RotateHandle      [when overlayMode='rotate']
                 └─ extraLayersSlot   [optional additional layers]
```

`ArtifactPlate` and `PaperRender` are internal sub-components; they are
not independently exported (use `ArtifactViewer` for the composed surface).
`SplitOverlay`, `IllustOverlay`, `WordBboxOverlay` are exported individually
from `@pdomain/pdomain-ui/stages/PageWorkbench` for consumers that need
to compose them with a custom outer shell.

#### Cross-consumer shape comparison

Both consumers use the same `ArtifactViewerProps` shape:

| Consumer | `overlayMode` | Key data props |
|---|---|---|
| `pdomain-prep-for-pgdp` — Grayscale PageViewer | `'split'` | `splitProposal` with re-detectable `splitX` |
| `pdomain-prep-for-pgdp` — Crop BboxEditor | `'view'` (with `LabelerCanvas` wrapping) | — |
| `pdomain-prep-for-pgdp` — OCR/Labeler | `'words'` | `wordBboxes` with confidence |
| `pdomain-ocr-labeler-spa` — annotation surface | `'words'` or `'view'` | `wordBboxes`, `onWordClick` |

The shape is intentionally minimal — consumers that need richer annotation
(drawing new bboxes, drag-to-resize) should use `LabelerCanvas` instead,
which extends `PageImageCanvas` directly.

#### Storybook stories (required)

- `View` — plain image, no overlay.
- `SplitMode` — draggable vertical split (uses a mock before/after image pair).
- `IllustMode` — two illustration bboxes highlighted.
- `WordsMode` — word-level bboxes with confidence pips (mocked word array).
- `RotateMode` — rotation handle overlay.
- `NarrowContainer` — 320px wide (mobile-ish context).
- `LargeImage` — 4000×5000px source dimensions (scale stress test).

---

### §6.4 Stage-folder layout convention

New folder: `src/stages/`. Each stage sub-folder contains:

```
src/stages/
  <Stage>/
    index.ts                # named re-exports for all stage components
    <Component>.tsx         # component + Props type
    <Component>.test.tsx    # Vitest + jsdom tests
    <Component>.stories.tsx # Storybook stories
```

Sub-path export in `package.json` (one entry per stage):

```json
"./stages/<stage>": {
  "import": "./dist/stages/<stage>/index.js",
  "types": "./dist/stages/<stage>/index.d.ts"
}
```

Each stage barrel (`index.ts`) re-exports its components with named exports
only — no default exports.

`ArtifactViewer` and the three overlay components live in
`src/stages/PageWorkbench/` and are re-exported from both
`./stages/PageWorkbench` and the root barrel.

---

### §6.5 Pattern reuse — promotion to `src/primitives/`

Components that appear in 2+ stage folders with the same or near-identical
API are promoted to `src/primitives/` to avoid duplication. The stage folder
then imports from `src/primitives/` rather than defining a local copy.

Identified promotions from the catalog above:

| Component | Appears in | Promoted path | Rationale |
|---|---|---|---|
| `BackendChip` | Grayscale, PageWorkbench (StageControlsPanel) | `src/primitives/BackendChip.tsx` | GPU/CPU status is suite-wide vocabulary |
| `CheckIcon` | Validation CheckRow, potentially other status displays | `src/primitives/CheckIcon.tsx` | Generic state icon (pass/warn/error/running/skip) |
| `PageChip` | Validation CheckRow, potentially Page Reorder row | `src/primitives/PageChip.tsx` | Mono prefix chip is generic; analogous to existing `FlagChip` |
| `ToggleBadge` | Scannos rule table, potentially Hyphen Join threshold table | `src/primitives/ToggleBadge.tsx` | Mini labeled switch inline with text |
| `StageControlsLeft` pattern | Grayscale, Crop (BboxEditor has similar), PageWorkbench (StageControlsPanel) | Do not promote as a component — instead parameterize `StageControlsPanel` to accept a `controlsSlot` render prop | The slot content differs per stage; only the chrome (inheritance banner + footer) is shared — use `StageControlsPanel` |

**Promotion rule:** if the component is purely presentational with no
stage-specific vocabulary in its props, promote. If it has any stage-specific
enum or data type in its props, keep in the stage folder.

**Process:** when a later milestone discovers a new promotion candidate, file
a follow-on issue to move it before the stage milestone ships. Do not leave
duplicates in the tree.

---

## §7 Implementation Plan

Milestones map 1:1 to GH issues in `ocr-container-meta` under the milestone
`spec: pdomain-ui-design-handoff-phase-2 (#TBD)`.

### Milestone 1: ArtifactViewer + overlays

**Deliverables:**

- `src/stages/PageWorkbench/ArtifactViewer.tsx` + `ArtifactPlate.tsx` +
  `PaperRender.tsx` (internal sub-components).
- `src/stages/PageWorkbench/SplitOverlay.tsx`.
- `src/stages/PageWorkbench/IllustOverlay.tsx`.
- `src/stages/PageWorkbench/WordBboxOverlay.tsx`.
- `src/stages/PageWorkbench/index.ts` — exports `ArtifactViewer`,
  `SplitOverlay`, `IllustOverlay`, `WordBboxOverlay` plus `OverlayMode`,
  `SplitProposal`, `IllustBbox`, `WordBbox`, `ArtifactViewerProps`.
- 7 Storybook stories (§6.3).
- Unit tests: overlay mode switching, `onWordClick` callback, `onSplitXChange`
  callback, `onRotationChange`, `extraLayersSlot` renders.
- `package.json` subpath entry `./stages/PageWorkbench`.

**Dependencies:** `PageImageCanvas` (already shipped), `src/canvas/`.

**Unblocks:** Milestone 2 (PageWorkbench cross-cutting), pdomain-prep-for-pgdp
PageViewer, pdomain-ocr-labeler-spa annotation migration.

### Milestone 2: Page Workbench cross-cutting

**Deliverables:** `PWHeader`, `EditModeSelector`, `PageAttributesBar`,
`StageControlsPanel`, `HierarchyTreePanel`, `BlockTypePickerPanel`,
`PageAttributesPanel`, `OcrTextPanel`, `TextReviewPane`, `LabelerCanvas`.

Promoted to `src/primitives/` in this milestone: `BackendChip`, `CheckIcon`,
`PageChip`, `ToggleBadge` (if not already needed by an earlier stage).

**Dependencies:** Milestone 1 (`ArtifactViewer`).

**Unblocks:** per-stage control panels in M3–M9.

### Milestone 3: Source stage

**Deliverables:** `SourceBanner`, `FileToolbar`, `ThumbCard`, `BulkBar`,
`InsertDialog`, `SourcePageWorkbench`, `SourceStepSettings`.

**Dependencies:** M1 (`ArtifactViewer` used in `SourcePageWorkbench`).

**Unblocks:** pdomain-prep-for-pgdp S01 slice.

### Milestone 4: Grayscale stage

**Deliverables:** `AutoDetectBanner`, `ModeCard`, `AdvancedParams`,
`GrayscaleOverview`, `GrayThumb`, `PageViewer`, `StageControlsLeft`.

`BackendChip` promoted to primitives in M2; this milestone imports it.

**Dependencies:** M1 (`ArtifactViewer` used in `PageViewer`), M2
(`StageControlsPanel` chrome), primitives `BackendChip`.

**Unblocks:** pdomain-prep-for-pgdp S02 slice.

### Milestone 5: Crop stage

**Deliverables:** `CropBanner`, `CropToolbar`, `CropCard`, `CropBulkBar`,
`BboxEditor`, `CropOverview`, `CropStepSettings`.

**Dependencies:** M1 (`ArtifactViewer` used in `BboxEditor`), M2
(`StageControlsPanel`).

**Unblocks:** pdomain-prep-for-pgdp S03 slice.

### Milestone 6: Hyphen Join stage

**Deliverables:** `HyphenOverview`, `HyphenUndecided`, `HyphenAutoJoined`,
`HyphenMismatch`, `HyphenStepSettings`, `HyphenPageWorkbench`,
`HJStatusPill`, `HJDecisionCard`.

**Dependencies:** M1 (`ArtifactViewer` used in `HyphenPageWorkbench`).

**Unblocks:** pdomain-prep-for-pgdp S15 slice.

### Milestone 7: Scannos stage

**Deliverables:** `ScannoToken`, `InlineMarkPopover`, `CandidateDetail`,
`RuleDetail`. `ToggleBadge` and `NavGroup` — check if promoted to
`src/primitives/` in M2; if so, import from there and close as no-op for
those two.

**Dependencies:** none (no `ArtifactViewer` usage in Scannos text-review
surfaces).

**Unblocks:** pdomain-prep-for-pgdp S13 slice.

### Milestone 8: Page Reorder stage

**Deliverables:** `ReorderScansBanner`, `SwapRow`, `PageThumb` (reorder
variant), `AfterApplyStrip`.

**Dependencies:** none.

**Unblocks:** pdomain-prep-for-pgdp S11 slice.

### Milestone 9: Validation stage

**Deliverables:** `SummaryHeader`, `PanelToolbar`, `CheckRow`,
`DownloadFooter`. `CheckIcon` and `PageChip` promoted in M2 — import from
`src/primitives/`.

**Dependencies:** M2 (`CheckIcon`, `PageChip` from promoted primitives).

**Unblocks:** pdomain-prep-for-pgdp S19 slice.

### Milestone 10: Quality Flags add-ons

**Deliverables:** Audit whether `StageContextStrip` needs a `variant=configure`
prop extension (non-breaking if so); `PageThumb` (quality-flags variant);
`PageRow`.

**Dependencies:** Phase 1 `StageContextStrip`, `FilterToolbar`,
`BulkActionBar` (all already in primitives).

**Unblocks:** pdomain-prep-for-pgdp wf03 slice.

### Milestone 11: Projects add-ons

**Deliverables:** `PipelineMini`, `AttributesPanel` (projects-variant
wrapper or slot configuration), `ProjectsEmpty` (verify absorbed or add
standalone).

**Dependencies:** Phase 1 `ProjectsLandingTemplate`, `AttributesPanel`
(primitives).

**Unblocks:** pdomain-prep-for-pgdp landing page slice.

### Milestone 12: Upload modal add-ons

**Deliverables:** `ModalC` (desktop right-side sheet, 4-step rail),
`ModalB` (compact drop target). Storybook stories for ModalA/D/E
(non-exported).

**Dependencies:** Phase 1 primitives (Dialog, Segmented, etc.).

**Unblocks:** pdomain-prep-for-pgdp wf01 slice.

---

## §8 Test Plan

### Per-component requirements

Every component in the catalog must have, before its milestone closes:

1. **Storybook story** — at least one story per distinct state variant
   shown in the design source. Stories must work in both `:root` (dark
   default) and `[data-theme="light"]`.
2. **Unit test** — Vitest + jsdom. Required coverage:
   - Renders without crash on minimal required props.
   - Prop variants exercise every discriminated-union branch.
   - Event callbacks (`onClick`, `onChange`, etc.) fire with correct args.
   - `data-testid` attributes from `src/testids/` are present in rendered
     output (spot-check at least one per component).
3. **Type check** — `pnpm typecheck` clean under strict settings.
4. **CI gate** — `make ci AI=1` green before commit.

### ArtifactViewer cross-consumer integration test

A dedicated integration test (`ArtifactViewer.integration.test.tsx`)
exercises both consumer shapes:

```tsx
// pdomain-prep-for-pgdp shape
render(
  <ArtifactViewer
    imageSrc="mock.png"
    pageWidth={2400}
    pageHeight={3200}
    overlayMode="split"
    splitProposal={{ splitX: 0.5 }}
  />
);
expect(screen.getByRole('separator')).toBeInTheDocument(); // split handle

// pdomain-ocr-labeler-spa shape
render(
  <ArtifactViewer
    imageSrc="mock.png"
    pageWidth={2400}
    pageHeight={3200}
    overlayMode="words"
    wordBboxes={[{ id: 'w1', bbox: [0.1, 0.1, 0.05, 0.02], confidence: 0.95 }]}
    onWordClick={vi.fn()}
  />
);
expect(screen.getByTestId('word-bbox-w1')).toBeInTheDocument();
```

The mock uses `vi.mock` for `PageImageCanvas` (existing jsdom Konva mock
pattern — see `project_m5_canvas.md` memory for the pattern).

### Stage testid coordination

Before shipping each stage milestone, coordinate `data-testid` names with
both consumer repos. The testid constant must be added to `src/testids/`
in the same commit as the component.

---

## §9 Open Questions

**OQ-P2-1: Does `StageControlsLeft` pattern justify a primitive?**

`StageControlsLeft` (Grayscale) and `StageControlsPanel` (PageWorkbench)
share the same chrome — inheritance banner, top controls slot, sticky
footer (Revert / Save). The difference is only the `controlsSlot` content.
Should `StageControlsPanel` be promoted to `src/primitives/` so it can be
used directly by Grayscale (skipping `StageControlsLeft`), or should
Grayscale define its own simpler wrapper?

**Recommendation:** promote `StageControlsPanel` to primitives in M2 and
have Grayscale (`StageControlsLeft`) simply compose it. Grayscale adds no
new chrome — it only supplies the `controlsSlot` content.

**OQ-P2-2: Where do per-stage stores live?**

Each wired stage (Source, Grayscale, Crop, HyphenJoin) has local UI state:
selected pages, active filter, density toggle, settings form. Should these
stores be:

- a) Defined in the stage folder (`src/stages/<Stage>/use<Stage>Store.ts`)
  as Zustand factory functions — close to the components that use them.
- b) Collected in `src/stores/` alongside the existing suite-level stores
  (`UIPrefs`, `SuiteSiblings`).

**Recommendation:** option (a). Stage stores are strictly local to their
stage and are not shared across stages. The existing `src/stores/` folder
hosts only suite-wide shared state. Per-stage stores should live adjacent
to the components that use them.

**OQ-P2-3: Should `pdomain-ocr-labeler-spa`'s existing canvas chrome migrate
to `ArtifactViewer`, or stay separate?**

`pdomain-ocr-labeler-spa` currently has an ad-hoc Konva chrome for its image-
annotation surface. Option A: migrate it to `ArtifactViewer` (unified,
consumes pdomain-ui). Option B: keep it separate (labeler-spa's annotation
needs may diverge from the prep-for-pgdp split/illust/words modes).

**Recommendation:** the `overlayMode='words'` + `LabelerCanvas` path in
`ArtifactViewer` covers the labeler-spa word-level annotation case. The
migration should happen, but it is the labeler-spa team's call after
`ArtifactViewer` ships. File as a labeler-spa follow-on issue, not a
pdomain-ui blocker.

Cross-repo recommendation:

```
Cross-repo recommendation
  Target: pdomain-ocr-labeler-spa
  Reason: ArtifactViewer (shipping M1) covers the annotation surface;
          migrating the ad-hoc Konva chrome would unify both consumers
          under one tested component.
  gh issue create -R pdomain/pdomain-ocr-labeler-spa \
    -l kind:feature-request -l status:backlog \
    --title "Migrate annotation canvas to pdomain-ui ArtifactViewer" \
    --body "pdomain-ui will ship ArtifactViewer in Phase 2 M1. \
            ArtifactViewer supports overlayMode='words' + onWordClick, \
            matching the labeler-spa annotation surface. \
            This issue tracks migrating the current ad-hoc Konva chrome \
            to consume ArtifactViewer from @pdomain/pdomain-ui/stages/PageWorkbench."
  → Run this? CT can edit before executing.
```

---

*Cross-reference: MIGRATION_NOTES.md §12 (Phase 3 deferral list) for the
complete list of design-bundle identifiers consciously omitted from Phase 1
and now addressed in this Phase 2 spec.*

## Adversarial Review

**Stage / sources:** Post-implementation review against stage exports and
tests, May 24-25 history, and the migration red-team. **Accepted findings /
residual risk:** the catalog's major M1-M12 component batches shipped, but the
document's draft label and uniform target contracts do not match current
practice. SourcePageWorkbench retains an unused `beforeImageUrl`, LabelerCanvas
is rendering-only despite `onBlocksChange`, and ArtifactViewer later adopted
ZoomViewport. Promote present behavior to
`docs/architecture/stage-component-library.md`; mutation behavior and consumer
migration require owner decisions.
