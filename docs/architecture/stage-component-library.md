---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Stage component library

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** adding stage subpaths, PageWorkbench visuals, or reusable stage chrome.
- **Search terms:** stage components, ArtifactViewer, LabelerCanvas, stage subpaths, promotion rule.

## Typed stage subpaths keep orchestration in consumers

Stage folders publish typed presentation components through stage subpaths.
They compose shared primitives while consumers own stores, routes, backend
contracts, and state machines. ArtifactViewer is the shared PageWorkbench
visual shell. It integrates ZoomViewport.

Repeated stage chrome promotes to slot-based primitives when reuse is proven.
Stage-specific wrappers remain valid when their data or behavior differs.

## Partial public contracts remain explicit

SourcePageWorkbench currently renders the after image and discards its retained
`beforeImageUrl`; full comparison is later work. LabelerCanvas renders blocks
and selection handles but does not call `onBlocksChange` or implement drag
mutation. The former Phase 2 catalog was still labeled draft despite shipped
batches; it is now retired after promotion to this architecture record.

## Reuse governs stage-component promotion

- Keep state and orchestration out of the component library.
- Export coherent stage families through typed subpaths.
- Promote repeated chrome, not stage vocabulary or state machines.
- Record partial public contracts explicitly until they are implemented or removed.

## Code, tests, and history verify the architecture

- Former source: the May 24 Phase 2 stage-component catalog
- Code/tests: `src/stages/`, `src/stages/PageWorkbench/ArtifactViewer.tsx`,
  `src/stages/PageWorkbench/LabelerCanvas.tsx`,
  `src/stages/Source/SourcePageWorkbench.tsx`
- History: commits `9f81be7`, `9fb1e71`, `c7e3754`, and May 25 M3-M12 batches
