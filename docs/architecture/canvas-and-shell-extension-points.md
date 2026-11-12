---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-11-10
verified_against:
  - "src/canvas/PageImageCanvas.tsx"
  - "src/shell/AppShell.tsx"
  - "src/shell/ComputeTargetPanel.tsx"
  - "src/stages/PageWorkbench/ArtifactViewer.tsx"
---

# Canvas and shell extension points

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** integrating custom canvas overlays, image-node behavior, AppShell footer content, or ComputeTargetPanel.
- **Search terms:** onImageNodeReady, selectionLayerListening, AppShell footer, consumer canary, ComputeTargetPanel, active device, local sentinel.

## Canvas and shell hooks remain opt-in

`PageImageCanvas` calls `onImageNodeReady` with the mounted Konva image node. It
calls the same callback with `null` when that mounted image ref unmounts.
Initial loading or failure before the image mounts does not emit `null`.
Consumers use this escape hatch for behavior that needs the underlying image node.

The selection layer does not receive pointer events by default.
`selectionLayerListening` opts into them. ArtifactViewer enables listening for
word mode; LabelerCanvas explicitly leaves it off.

`AppShell.footer` is optional. When present, AppShell renders a full-width
footer row. When absent, it renders neither the footer element nor a reserved
grid row.

## ComputeTargetPanel decides from its device data

`ComputeTargetPanel` renders nothing when `info` is missing or `info.available`
is empty. It never reads `info.mode`. `pdomain-ops` returns an empty list on
hosted deployments, so the deploy-mode decision stays in the backend.

The active-device line resolves its text in this order:

1. If `current` matches an `available` entry, show that entry's label.
2. If `current` is `local` with no matching entry, show `Local compute target`.
3. If `current` is null or absent, show `Automatic`.
4. Show any other value unchanged, including an empty string, so an unexpected
   backend value stays visible.

## The settings direction did not ship as proposed

The former consumer-canary plan grouped these shipped extension points with a
settings direction that did not ship as proposed. The `system` theme and local
persistence adapter remain owner decisions. The shell utility dock superseded
the centered settings modal.

## Extension points stay typed and conditional

- Keep low-level canvas access opt-in and typed.
- Keep selection-layer pointer interception off unless a mode needs it.
- Do not reserve shell layout space for an absent optional footer.
- Separate proven extension points from unresolved consumer preferences.

## Code, tests, and commits verify the contracts

- Code: `src/canvas/PageImageCanvas.tsx`, `src/canvas/types.ts`,
  `src/shell/AppShell.tsx`, `src/shell/ComputeTargetPanel.tsx`, `src/shell/types.ts`
- Tests: `tests/canvas/PageImageCanvas.issue12.test.tsx`,
  `tests/canvas/PageImageCanvas.issue13.test.tsx`,
  `src/shell/AppShell.issue14.test.tsx`, `src/shell/ComputeTargetPanel.test.tsx`
- Commits: `610abe6` (image-node callback), `35930f8` (selection-layer
  listening contract and tests), `951f483` (optional footer), `ab0170d`
  (active-device labels), `d5d017e` (device-list gate)
