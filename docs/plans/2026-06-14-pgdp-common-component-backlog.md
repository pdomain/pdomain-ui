---
kind: plan
status: active
owner: CT
created: 2026-06-14
last_verified: 2026-11-12
verified_against:
  - "package.json"
  - "src/settings/index.ts"
  - "src/workbench/WorkbenchLayout.tsx"
  - "src/index.ts"
  - "src/stages/Projects/index.ts"
  - "docs/context/intent-map.md"
---

# The single list of remaining pdomain-ui work

This file is the single list of remaining pdomain-ui work.

> **For agentic workers:** use `superpowers:subagent-driven-development` for
> implementation work. Keep stage folders and common-component folders as
> separate tasks so reviewers can tell whether a pattern is truly reusable.

Shipped behavior lives in the architecture docs.

Open specs, plans, and issues linked below keep their own acceptance detail.

## Agent Index

- **Kind:** plan
- **Status:** active
- **Read when:** choosing the next library change, or deciding whether work belongs in another repo.
- **Search terms:** roadmap, PGDP backlog, settings kit, review foundation, separate repos.

## Goal

Finish the shared presentation components the PGDP designs still need.

Keep product screens, state machines, and domain algorithms out of this library.

## Architecture

Build typed, presentation-only primitives for repeated settings, review, gate, and artifact patterns.

Keep full stage tools and orchestration in the app that owns them.

Move a component into this library only when it serves at least two stage families or more than one consumer app.

Shipped settings and workbench behavior is recorded in
[cross-app common UI modules](../architecture/cross-app-common-ui-modules.md).

Stage export policy and slot primitives are recorded in
[stage component library](../architecture/stage-component-library.md).

## Tech Stack

The stack is typed React component APIs, Storybook stories, Vitest coverage, token-only styles in `theme/primitives.css`, and package and Vite exports for public modules.

## Global Constraints

Treat shipped stage and common-module work as the baseline.

Do not re-port Source, Grayscale, Crop, HyphenJoin, Validation, QualityFlags, Scannos, PageReorder, Upload, PageWorkbench, shell, templates, or core primitives.

Re-port from that list only when a newer PGDP design requires an extension.

Keep state machines, backend registry, SSE, event logs, routes, domain
algorithms, and stage-specific machine behavior outside pdomain-ui.

Every new component needs a typed API, Storybook stories, Vitest coverage,
and token-only styling in `theme/primitives.css`.

## Components already shipped

These former backlog tasks are done.

Do not add a second copy.

- `SettingsCard`, `SettingsRow`, `SettingsValue`, and `SettingSlider` ship from `src/settings/`. The same barrel also ships `SettingsAsyncSection`, `PreferencePathRow`, `StatusActionRow`, and `GuidancePanel`.
- `WorkbenchLayout` ships from `src/workbench/WorkbenchLayout.tsx` with slots `header`, `toolbar`, `navigation`, `viewer`, `inspector`, and `footer`.
- The older acceptance names "controls panel" and "sidecar" were not added as separate slots.
- `Banner`, `StageToolbar`, and `Thumbnail` ship as slot primitives.
- Known composition gaps are in the stage architecture doc.

A gap check is still useful for the original settings and slider acceptance lists.

- Check dense rows, the named story states, and label and control association.
- Check slider keyboard, clamping, decimal step, and aria value text.

That check extends the shipped components.

It does not create new ones.

Source of the original gap list:
[PGDP design handoff gap analysis](../research/2026-06-14-pgdp-design-handoff-gap-analysis.md).

## Library components still to add

Build these in pdomain-ui.

Each one stays presentation-only.

The new target files named below are not in the tree.

Components named as ingredients, such as `FilterToolbar` and `ArtifactViewer`, already ship.

The contracts come from `pdomain-prep-for-pgdp` `docs/plans/design_handoff_pgdp_app/statecharts/`.

That folder has no `statecharts/README.md`.

Do not cite the copy of `COMPONENT_INDEX.md` in this repo for these contracts. Its line ranges are a different inventory.

### Settings inheritance banner

`tool-source.yaml` defines a reusable settings region with states `default`, `modified`, and `preset`.

The note in that file says every stage Settings tab uses the same banner.

Put the banner in `src/primitives/SettingsInheritanceBanner.tsx`, or in a stage-settings shell if that shell owns the layout.

- `default` copy is "Using project default · Standard quality preset".
- `modified` copy is "Modified · N changes vs project default".
- `preset` copy is "Using preset · IA / JP2 archive scans" and says it is not the project default.
- From `modified`: save as default, revert, and save as preset.
- From `preset`: reset to default.
- From `default`: load a preset.
- Do not add a "view affected stages" action. That action is not in `tool-source.yaml`.

### Stage settings audit

Source, Validation, PageReorder, and Scannos cover parts of older designs. They do not cover the newer PGDP screens.

1. Compare current exports with the names in the gap analysis tables.
2. Classify each missing piece as reuse, promote, or keep app-local.

Do not move stage machine behavior into this library.

Source: [gap analysis](../research/2026-06-14-pgdp-design-handoff-gap-analysis.md).

- Source against `SourceFiles`, `SourceMetadata`, `SourceOverview`,
  `SourceStageControlsLeft`, and `SourceViewer`.
- PageReorder against page-order naming, the unified ledger, ribbon, and
  spine, roles, and run-leaf management.
- Scannos against Scannocheck pages, overview, settings, suspects, and the
  list builder.
- Validation against `VALMain` and `VALSettings`.

### Image-review banner, filters, grid, and editor

Image review stages share lifecycle chrome, filters, a page grid, and an inline editor (`tool-image-stage-review.yaml`).

Current `FilterToolbar`, `ThumbSizeToggle`, `StageToolbar`, `ThumbGrid`, and `Thumbnail` cover pieces of this, not the whole composition.

`StageLifecycleBanner` is unbuilt. The target file is `src/primitives/StageLifecycleBanner.tsx`.

It has two projections, and they do not share one state list.

- Stage runner (`stage-runner.yaml`): `notrun`, `queued`, `running`, `clean`, `flagged`, `stale`, and `error`.
- Image-review banner (`tool-image-stage-review.yaml`): `running`, `review`, and `done`, plus a stale variant.
- The machine state that shows the done banner is named `settled`. Use `done` as the banner label.
- The banner has slots for a primary action, a secondary action, and stage-specific detail.
- The banner uses existing `Badge`, `Progress`, `Button`, and status tokens.

`ReviewFilterToolbar` is unbuilt. The target file is `src/templates/ReviewFilterToolbar.tsx` or `src/primitives/ReviewFilterToolbar.tsx`.

`tool-image-stage-review.yaml` already names the data.

- Filter values are `all`, `flagged`, `clean`, or a flag kind.
- Density values are `S`, `M`, or `L`.
- The named data includes a selected-row list.

- Filters show counts from the stage totals and an active state.
- Density control delegates to `ThumbSizeToggle` or the existing density primitives.
- The toolbar has an optional selected count and an action slot.
- The toolbar needs keyboard and aria tests for the interactive filters.

`ReviewPageGrid` is unbuilt. The target file is `src/templates/ReviewPageGrid.tsx`.

`imageStageReview` covers seven stages: threshold, deskew, denoise, dewarp, post-transform crop, post-OCR crop, and canvas map.

- The grid composes `ThumbGrid`, `Thumbnail`, `FlagChip`, and status indicators.
- Row states from that machine are `running`, `clean`, `flagged`, `failed`, and `reviewed`.
- Density is `S`, `M`, and `L`.
- The grid also has selection.
- Stage-specific overlays stay slots.

`InlineReviewEditorShell` is unbuilt. The target file is `src/templates/InlineReviewEditorShell.tsx`.

The image-review editor is one expanded row. That row is a wipe compare, stage controls, and apply-to scope `this`, `selected`, or `sameIssue` (`tool-image-stage-review.yaml`).

- Wipe compare stays in this shell. It is not an `ArtifactViewer` mode.
- The shell has a controls slot, an apply-scope control, and cancel, accept, and re-run actions.
- The shell does not know crop, deskew, or dewarp math. Those controls are passed in per stage.
- Tests cover scope changes and action callbacks.

### Unbuilt gate panels and artifact tree

`GatePanel` is unbuilt. The target file is `src/primitives/GatePanel.tsx`.

Validation rule levels are `pass`, `warn`, and `error` (`tool-validation.yaml`).

The panel may also show that machine's `blocked` and `passed` states.

- Do not replace `BuildPackagePanel` or `RunAllDirtyPanel`. Those pack launchers already ship.
- The panel has a title, a description, an icon or status slot, and optional actions.
- It can render as a list item or a full panel.

`ConfirmAdvancePanel` is unbuilt. The target file is `src/templates/ConfirmAdvancePanel.tsx`.

Image review gates "Confirm and advance" on every flag being reviewed (`tool-image-stage-review.yaml`).

- It receives blocker count, resolved count, target stage label, primary action, and disabled reason.
- It uses `GatePanel` internally.
- Shared stories cover clean, blockers present, and primary action disabled with a reason.
- Dry-run failed, dry-run passed, and submitted are submit-check states (`tool-submit-check.yaml`).
- Write those stories only on the PGDP app's submit-check screen.

`ArtifactTree` is unbuilt. The target file is `src/primitives/ArtifactTree.tsx`.

- Proof pack renders a contents tree (`tool-proof-pack.yaml`).
- Zip renders a contents tree and the archive checksum (`tool-zip.yaml`).
- Archive renders a keep/drop list of `name`, `meta`, and `keep`, plus
  kept and dropped sizes (`tool-archive.yaml`).

### Second image on the page workbench

`ArtifactViewer` already has `overlayMode` values `view`, `split`, `illust`, `rotate`, and `words`.

`split` is a one-image divider.

Do not reuse those names for before/after compare.

The PGDP page workbench viewer is `single` or `comparing` (`page-workbench.yaml`).

Comparing is a curtain or a side-by-side pair, with a second image source.

Add that compare as its own prop on `src/stages/PageWorkbench/ArtifactViewer.tsx`, or as a companion viewer.

Keep the wipe compare in `InlineReviewEditorShell`.

- This must not regress current labeler and PageWorkbench consumers.

`SourcePageWorkbench` still discards `beforeImageUrl`.

Decide that prop together with this compare work.

See owner decisions below.

## Other open work in this repo

The Field help slot is shipped. `Field` renders optional help in a native
disclosure under the control. The summary reads "Help" unless `helpLabel` is
set, the disclosure starts closed, and an error still appears under it.
[Field and FieldRow contracts](../architecture/field-primitives.md).

## Fixes from the open branches

These defects landed with `night-audit-residuals` (`ab0170d` through `3ca2679`).
That range includes `worktree-fix-compute-panel-and-dep-updater`.

- Friendly active-device labels and the empty-device-list gate are in
  `ComputeTargetPanel` (`ab0170d`, `d5d017e`). The active-device issue, plan,
  and spec were retired on that branch. The record is
  [canvas and shell extension points](../architecture/canvas-and-shell-extension-points.md).
- `scripts/update-pdomain-deps.sh` reads object-form codegen pins (`86c169e`).
  [Contract](../architecture/codegen-contract.md).
- CropCard passes the bottom-left flag overlay only when the page has flags
  (`70927e3`).
- CoverPlaceholder uses `--cover-ink` and `--shadow-cover-inset` (`c380728`).
  [Theme and component quality](../architecture/theme-and-component-quality.md).
- Lint suppressions that remain have a local rationale (`159d64a`).
  [Lint deviations](../process/lint-deviations.md).

## Deferred until a consumer asks

- Key sequences such as `g p` in `useShortcuts`.
  [Plan](2026-07-21-shortcut-sequences-conditional.md).
  [Issue](../issues/2026-07-15-useshortcuts-chord-sequences.md).
- LogViewer.
  [Spec](../specs/2026-05-21-log-viewer.md).
- A richer ColorField picker, or settings panels addressed by URL.
- Removing AppShell `drawer` and `rightPanel`, the SettingsModal shim, and
  the inert JobsPill and AppHeader props. Current code still keeps them.
  [Shell utility dock](../architecture/shell-utility-dock.md).
- Splitting `theme/primitives.css`. Keep one runtime entry until the file
  becomes unwieldy.
- Consumer migration that this repo cannot prove:
  - UtilityDock in `pdomain-ocr-simple-gui`, `pdomain-prep-for-pgdp`, and `pdomain-ocr-labeler-spa`.
  - The labeler accordion on `AccordionTrigger` slots.
  - Adoption of the records, source-intake, viewport, settings, status, and workbench subpaths.

## Owner decisions

- Abandon or replace the dep-refresh auto-land spec. It targets GitHub
  workflows deleted in commit `0aa42b5` on 2026-09-13.
  [Spec](../specs/2026-07-16-dep-refresh-auto-land-design.md).
- Confirm that a current consumer still needs the draft LogViewer contract.
- Close or revive the consumer-canary prefs direction. The proposed `system` theme and local persistence adapter never shipped. The utility dock replaced the shared centered modal.
- Decide LabelerCanvas drag-to-create. The component renders blocks and
  handles but does not call `onBlocksChange`.
- Confirm whether the labeler SPA moved its annotation chrome to
  ArtifactViewer.
- Decide whether a mounted Konva canvas must repaint on a live theme change.
- Decide what to do with `SourcePageWorkbench`'s unused `beforeImageUrl`: implement the compare contract or remove the prop.

This file stays the one roadmap.

Split a component into its own spec when someone starts building it.

## App-local stages stay in pdomain-prep-for-pgdp

Build these stages in `pdomain-prep-for-pgdp` after the shared components above exist.

The table is a consumption map, not a package-subpath backlog.

| Family       | PGDP app-local stages                                                                       | Shared pdomain-ui base                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Image review | `Threshold`, `Deskew`, `Denoise`, `Dewarp`, `PostTransformCrop`, `PostOcrCrop`, `CanvasMap` | `StageLifecycleBanner`, `ReviewFilterToolbar`, `ReviewPageGrid`, `InlineReviewEditorShell`, settings kit |
| OCR and text | `OCR`, `TextZones`, `TextReview`, `Illustrations`, `Regex`                                  | Workbench layout, gate panel, settings kit, specialized worklist and text components |
| Pack tail    | `ProofPack`, `BuildPackage`, `Zip`, `SubmitCheck`, `Archive`                                | `GatePanel`, `ConfirmAdvancePanel`, `ArtifactTree`, settings kit                     |

Each app-local stage needs local route files, stories for the PGDP `DCArtboard` states, and tests for interaction and accessibility.

It needs only the visuals that are specific to that stage.

## Where the other work belongs

Do not start a second component library.

Shared presentation stays here.

The items below already have a home, or they need a new repo only when a second app shares them.

**Move, rather than publish, the Projects stage.** `PipelineMini`, `ProjectsEmpty`, and `ProjectsAttributesPanel` live under `src/stages/Projects/`.

They are not exported.

If only the PGDP app uses them, move that folder to `pdomain-prep-for-pgdp`.

Add `./stages/Projects` only when a second app imports it.

**Move the design-reference bundle.** `docs/templates/design_handoff_pd_ui/` is the PGDP design input for this library.

Docgraph ignores `docs/templates/`.

A newer handoff path is cited by the gap analysis under `pdomain-prep-for-pgdp`.

Keep one copy with the app's design docs.

Delete this copy only after that home is confirmed.

**Keep PGDP route mutations in the PGDP app.** Submit, archive, library promotion, and page-set mutation stay in `pdomain-prep-for-pgdp`.

**Keep suite infrastructure in pdomain-ops.** That repo is in-process suite registry, shared UI preferences, the sibling launcher, and GPU dispatch.

It is not a project-stage event log.

Do not add SSE, reindex, or the project event log there unless the owner expands that charter.

**Keep geometry and OCR contracts where they already are.**

- Pure-Python geometry, typography, matching, OCR result types, and PGDP round readers live in `pdomain-book-contracts`.
- Scan imaging and OCR tooling live in `pdomain-book-tools`.
- Font-free PGDP measurement lives in `pdomain-pgdp-measure`.
- The DP project mirror lives in `pdomain-pgdp-api-client`.
- Dewarp mesh solving, OCR confidence scoring, validation rule definitions, and regex engine behavior belong with those tools or with the PGDP app. They do not belong in pdomain-ui. They do not need a new repo.

**Add a workflow package only for a second consumer.** XState v5 machines for the statechart YAMLs stay in `pdomain-prep-for-pgdp` while that app is the only runner.

A small workflow package is worth it when another app must run the same machines.

That package is not a pdomain-ui module.

**Add a project-state service only for a second consumer.** Backend registry re-cuts, project-stage state, the event log, SSE, and reindex stay in the PGDP app's backend. They stay there until another app needs the same log.
