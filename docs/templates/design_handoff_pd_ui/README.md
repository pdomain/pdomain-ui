# pdomain-prep-for-pgdp · design handoff for `pdomain-ui`

This bundle is the input for porting the pdomain-prep-for-pgdp designs into your existing shared **pdomain-ui** (React + Vite + TypeScript) component library.

> **Start here:** open `PROMPT.md`. That's the instruction file you give to Claude Code (or any IDE coding agent) at the root of your `pdomain-ui` repo.

## What's in this bundle

| Path | What it is |
|---|---|
| `PROMPT.md` | The full Claude Code prompt. Paste verbatim. |
| `COMPONENT_INDEX.md` | Auto-extracted inventory of every React component identifier across every `.jsx` file in the project. Includes a frequency table for triage. |
| `final/` | The near-final designs — wired stages (Source, Grayscale, Crop, Hyphen-join), Projects landing, Pipeline shell, Template. Each `<stage>/` folder is a self-contained design canvas (`index.html` + JSX modules) showing one stage in many states. |
| `final/index.html` | The launcher — also the map. Read this first; it shows which stages are wired vs placeholder, and which wireframe (`wf01`…`wf11`, `wf-pw`) drives each not-yet-wired stage. |
| `design-system/` | Shared design tokens (`tokens.css`) and the base UI primitive library (`ui-base.jsx`) — Icon, Button, Badge, KeyCap, Divider, etc. Every `.jsx` file imports from here. **Port-or-reconcile against pdomain-ui's atoms first.** |
| `wf01/`–`wf11/`, `wf-pw/` | Exploration wireframes. Most are superseded by `final/`. The exceptions (wf09 page reorder, wf05b scannos, wf-pw page workbench, wf02 validation, wf03 quality flags) hold components that haven't been wired into `final/` yet. |
| `screenshots/` | A handful of curated PNG/JPG previews. **Not exhaustive** — full screenshots of every canvas would require running the HTML locally (see below). |

## Generating full screenshots locally

The bundle ships only a few sample screenshots. To produce a full set:

1. From this folder, run `npx serve .` (or any static server).
2. Open each `<stage>/index.html` and `wf*/index.html` in the browser.
3. Use the browser's "Save full page" / DevTools full-page capture.

Alternatively, every `index.html` is fully self-contained (React + Babel via CDN) — just `open` it in a browser. No build step needed.

## About the design files

These are **design references**, not production code. They use plain JSX (untyped) loaded through Babel-standalone purely so they can run in a browser without a build step. Treat the JSX as a **specification** — port it into pdomain-ui as proper typed React+TS components following pdomain-ui's existing patterns. Don't try to use the JSX directly.

## Fidelity

**High-fidelity.** Colors, typography, spacing, density, hover states, and component variants are exact. Token names in CSS custom properties are the canonical names — alias them to pdomain-ui's existing tokens where they overlap, port the rest.

## How to use this bundle

1. Drop this folder somewhere your Claude Code session can see it (sibling to `pdomain-ui`, or symlink it in).
2. Open `pdomain-ui` in Claude Code.
3. Paste `PROMPT.md` as the opening message.
4. Let it do Pass 1 (read & catalogue) first — don't let it write code until you've reviewed its plan.
5. Iterate pass by pass.

## Pipeline stages — current wiring status

From `final/index.html` (as of this export):

**Wired in `final/`:**

- 01 Source · 02 Grayscale · 03 Crop · 15 Hyphen join · Projects landing · Pipeline template

**Placeholder (prompt-ready, port from the listed wireframe):**

- 11 Page order (new — auto-detect out-of-order scans) — `wf09/variations.jsx :: ReorderScansStage`
- 13 Text review (incl. scannos sidecar) — `wf05b/`
- 19 Validation — `wf02/validation-panel.jsx`
- Source/Pages tab (manual drag-to-reorder) — `wf09/pages-tab.jsx`
- Cross-cutting Page Workbench primitives — `wf-pw/`
- Quality-flag taxonomy — `wf03/`

The remaining placeholder stages (Dewarp, Deskew, Threshold, Denoise, Canvas map, Text zones, OCR, Spellcheck, Illustrations, Regex, Page split, Proof pack, Zip, Build package, Submit check, Archive) have no design yet — call them out in `MIGRATION_NOTES.md` so I know what's still ahead of me.
