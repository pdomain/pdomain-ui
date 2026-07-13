---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Canvas and shell extension points

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** integrating custom canvas overlays, image-node behavior, or AppShell footer content.
- **Search terms:** onImageNodeReady, selectionLayerListening, AppShell footer, consumer canary.

## Current behavior

`PageImageCanvas` calls `onImageNodeReady` with the mounted Konva image node and
with `null` when no node is ready. Consumers use this escape hatch for behavior
that needs the underlying image node.

The selection layer does not receive pointer events by default.
`selectionLayerListening` opts into them. ArtifactViewer enables listening for
word mode; LabelerCanvas explicitly leaves it off.

`AppShell.footer` is optional. When present, AppShell renders a full-width
footer row. When absent, it renders neither the footer element nor a reserved
grid row.

## Concrete deviations

The former consumer-canary plan grouped these shipped extension points with a
settings direction that did not ship as proposed. The `system` theme and local
persistence adapter remain owner decisions, while the centered settings modal
was superseded by the shell utility dock.

## Durable decisions

- Keep low-level canvas access opt-in and typed.
- Keep selection-layer pointer interception off unless a mode needs it.
- Do not reserve shell layout space for an absent optional footer.
- Separate proven extension points from unresolved consumer preferences.

## Evidence

- Code: `src/canvas/PageImageCanvas.tsx`, `src/canvas/types.ts`,
  `src/shell/AppShell.tsx`, `src/shell/types.ts`
- Tests: `tests/canvas/PageImageCanvas.issue12.test.tsx`,
  `tests/canvas/PageImageCanvas.issue13.test.tsx`,
  `src/shell/AppShell.issue14.test.tsx`
- Commits: `610abe6` (image-node callback), `35930f8` (selection-layer
  listening contract and tests), `951f483` (optional footer)
