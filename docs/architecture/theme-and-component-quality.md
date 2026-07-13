---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Theme and component quality

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** changing tokens, component CSS, canvas colors, accessibility, or audit gates.
- **Search terms:** theme tokens, primitives CSS, Konva colors, component audit, accessibility.

## Current behavior

`theme/tokens.css` and `theme/primitives.css` are runtime truth. The sync script
copies those files to the design-system documentation mirror. The palette uses
semantic color tokens plus structural spacing, radius, typography, transition,
and shadow scales. Konva receives resolved color values rather than CSS `var()`
expressions.

Component quality includes keyboard behavior, semantic roles, stable labels,
explicit live-region choices, typed public APIs, and focused behavior tests.

## Concrete deviations

The 2026-05-28 audit claimed all findings in scope, but CropCard still installs
an empty flag overlay through an always-true React-element check. PipelineTemplate
also retains inline RGBA values in CoverPlaceholder. SourcePageWorkbench keeps
an unused `beforeImageUrl`, now tracked by later compare-viewer work.

## Durable decisions

- Keep the semantic color palette small; do not add brand/info aliases without a new decision.
- Add reusable structural scales where components demonstrably need them.
- Resolve theme tokens before painting a canvas.
- Treat behavior stubs as unshipped until focused tests prove them.
- Keep stores as factories and component styles token-based.

## Evidence

- Former sources: the May 28 component-audit remediation spec and plan
- Code: `theme/tokens.css`, `theme/primitives.css`, `src/canvas/resolveToken.ts`,
  `src/stages/Crop/CropCard.tsx`, `src/templates/PipelineTemplate.tsx`
- History: the May 28 foundation and audit-lane commits
