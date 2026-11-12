---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-11-12
verified_against:
  - "src/stages/Source/SourcePageWorkbench.tsx"
  - "src/stages/PageWorkbench/LabelerCanvas.tsx"
  - "src/stages/Projects/index.ts"
  - "src/primitives/Banner.tsx"
  - "src/primitives/DiskCostBanner.tsx"
  - "src/primitives/QualityBanner.tsx"
  - "src/stages/Source/BulkBar.tsx"
  - "src/index.ts"
  - "package.json"
---

# Stage component library

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** adding stage subpaths, PageWorkbench visuals, or reusable stage chrome.
- **Search terms:** stage components, ArtifactViewer, LabelerCanvas, stage subpaths, promotion rule.

## Typed stage subpaths keep orchestration in consumers

Stage folders publish typed presentation components through stage subpaths.

They compose shared primitives.

Consumers own stores, routes, backend contracts, and state machines.

ArtifactViewer is the shared PageWorkbench visual shell.

It integrates ZoomViewport.

Repeated stage chrome promotes to slot-based primitives when reuse is proven.

Stage-specific wrappers remain valid when their data or behavior differs.

## Public stage exports are mixed, and Projects stays private

`package.json` publishes these stage subpaths: `PageWorkbench`, `Source`,
`Grayscale`, `Crop`, `HyphenJoin`, `Validation`, `QualityFlags`, `Scannos`,
`PageReorder`, and `Upload`.

The root barrel also re-exports `PageWorkbench`, `Source`, `Grayscale`, and `Crop`.

Later stage families are subpath-only.

`src/stages/Projects/index.ts` exports `PipelineMini`, `ProjectsEmpty`, and `ProjectsAttributesPanel`.

`package.json` has no `./stages/Projects` entry.

The root barrel does not export them.

Whether that stage becomes public or moves to the PGDP app is an open roadmap decision.

## Slot primitives host shared stage chrome

`Banner`, `StageToolbar`, and `Thumbnail` are the shared chrome for stage banners, toolbars, and page cards.

Stage folders pass stage-specific labels and data through slots.

The primitive does not own the stage's state names.

`DiskCostBanner` and `QualityBanner` still render their own shells. They do not compose `Banner`.

Source `BulkBar` still renders its own buttons. It does not compose `BulkActionBar`.

Per-stage settings panels stay separate on purpose, because their forms do not share one chrome.

The decision record is
[slot-based stage primitives](../decisions/2026-05-25-slot-based-stage-primitives.md).

## Partial public contracts remain explicit

SourcePageWorkbench currently renders the after image.

It discards its retained `beforeImageUrl`.

Full comparison is later work.

LabelerCanvas renders blocks and selection handles.

It does not call `onBlocksChange` or implement drag mutation.

The former Phase 2 catalog was still labeled draft despite shipped batches.

It is now retired after promotion to this architecture record.

## Reuse governs stage-component promotion

- Keep state and orchestration out of the component library.
- Export coherent stage families through typed subpaths.
- Promote repeated chrome, not stage vocabulary or state machines.
- Record partial public contracts explicitly until they are implemented or removed.

## Code, tests, and history verify the architecture

- Former source: the May 24 Phase 2 stage-component catalog and the
  [slot-based stage primitives decision](../decisions/2026-05-25-slot-based-stage-primitives.md)
- Code/tests: `src/stages/`, `src/stages/PageWorkbench/ArtifactViewer.tsx`,
  `src/stages/PageWorkbench/LabelerCanvas.tsx`,
  `src/stages/Source/SourcePageWorkbench.tsx`, `src/stages/Projects/index.ts`,
  `src/primitives/Banner.tsx`, `src/primitives/StageToolbar.tsx`,
  `src/primitives/Thumbnail.tsx`, `src/stages/Source/BulkBar.tsx`
- Checked 2026-11-12 by reading `package.json`, `src/index.ts`, and those
  stage and primitive files. The test suite was not re-run for this pass.
- History: commits `9f81be7`, `9fb1e71`, `c7e3754`, and May 25 M3-M12 batches
