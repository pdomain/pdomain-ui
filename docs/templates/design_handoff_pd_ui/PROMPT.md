# Claude Code prompt — port `pdomain-prep-for-pgdp` designs into `pdomain-ui`

Paste this prompt verbatim into Claude Code, sitting at the root of your `pdomain-ui` repo with this design-handoff folder available as a sibling or symlinked subdirectory.

---

## Mission

I have a shared React + Vite + TypeScript component library called **`pdomain-ui`** used across my apps. Alongside it, I have a folder of design explorations and a near-final design package for an app called **pdomain-prep-for-pgdp** (a Distributed Proofreaders prep pipeline). The designs are HTML prototypes written in plain JSX (untyped, inline `<script type="text/babel">`).

**Your job:** read every page and wireframe in the design bundle, extract every component, and surface them in `pdomain-ui` as **properly typed, idiomatic React+TS components** following pdomain-ui's existing patterns. The downstream goal is for the pdomain-prep-for-pgdp app to be implementable almost entirely by importing from `pdomain-ui`.

This is **not** a one-shot port. It's an iterative cataloguing exercise that ends with:

1. A new section in pdomain-ui (`src/pd-prep/` or similar — match the library's convention) housing the new components.
2. A migration of any *generic* primitives discovered in the designs (Button variants, Badge tones, KeyCap, Divider, etc.) into pdomain-ui's existing atoms layer where they don't already exist.
3. Storybook / demo entries for each new component, mirroring how pdomain-ui currently documents components.
4. A short `MIGRATION_NOTES.md` you write at the end explaining what landed where, what was deliberately *not* ported, and what's still ambiguous.

## Inputs

In the design bundle (`design_handoff_pdomain_ui/` — sibling to this prompt):

- `final/` — the near-final designs. Every `.jsx` file under `final/<stage>/` is a wired-up canvas of one pipeline stage (Source, Grayscale, Crop, Hyphen-join, plus the Pipeline shell + Projects landing). These are the **source of truth** for component design — port these first.
- `wf01/` … `wf11/`, `wf-pw/` — exploration wireframes. Some of these are now-superseded by `final/`; others contain components that haven't been promoted yet (notably wf09's reorder UI, wf05b's scannos workbench, wf-pw's Page Workbench). **Treat these as second-class.** Only port from a wireframe if (a) its content isn't superseded by a `final/` file, or (b) `final/index.html` explicitly references it as the canonical source for a stage that hasn't been wired yet.
- `design-system/` — design tokens (`tokens.css`) and the base UI primitive library (`ui-base.jsx`) used by every `.jsx` file. These define the visual language and a couple dozen atoms (Icon, Button, Badge, KeyCap, Divider, Input, etc.).
- `COMPONENT_INDEX.md` — auto-extracted inventory. Every `const Name = …` / `function Name(…)` per file plus a frequency table.
- `final/index.html` — the launcher; tells you which pipeline stages are wired vs placeholder, and which wireframe powers each stage.

## How to proceed (recommended order)

### Pass 1 · Read & catalogue (don't write code yet)

1. Open `design_handoff_pdomain_ui/final/index.html` in your head. It's the map: 22+ pipeline stages, a Projects landing page, a Template shell, and 9 wireframe references. Note which stages are wired and which are placeholders.
2. Read `design-system/ui-base.jsx` and `design-system/template.jsx` end-to-end. **This is the shared kit every `.jsx` file relies on.** Every Button, Icon, Badge, etc. comes from here. The first thing you do in pdomain-ui is reconcile this against pdomain-ui's existing atoms.
3. Read `design-system/tokens.css`. Map every CSS custom property into pdomain-ui's token system. **Do not invent new token names** if pdomain-ui already has equivalents — alias the design's `--ink-1` to pdomain-ui's existing primary text color etc.
4. Scan `COMPONENT_INDEX.md`. Identifiers that appear in ≥3 files are almost certainly already in pdomain-ui or belong there. Identifiers that appear in 1 file are likely page-scoped and stay co-located.

### Pass 2 · Reconcile atoms with existing pdomain-ui

For each design-system primitive in `design-system/ui-base.jsx`:

- **Already in pdomain-ui** → check that prop names, variants, and tones line up. If they don't, decide which side to migrate (prefer pdomain-ui's existing API unless the design's is meaningfully better). Note divergences in `MIGRATION_NOTES.md`.
- **Not in pdomain-ui** → port it as a typed component into pdomain-ui's atoms layer. Match pdomain-ui's file structure, naming, and Storybook conventions.

Atoms to look for: `Icon`, `Button`, `Badge`, `KeyCap`, `Divider`, `Tabs/TabsBand`, `Input`, `Toggle`, `Segmented` (the inset segmented control used everywhere), `Chip`/`Pill`, `Tooltip`, `Spinner`.

### Pass 3 · Port molecules & templates

Promote in this order — each layer depends only on the previous:

1. **Layout templates** (`PipelineTemplate`, `AppTemplate`, `ProjectSettingsTemplate`, `ProjectConfigureFrame`) — the page chrome.
2. **Cross-cutting molecules** — `ProjectInfoBand`, `StageStrip`, `TabsBand`, `CanvasNav`, `AttributesPanel`, `CoverPlaceholder`.
3. **Stage-specific components** — one folder per stage:
   - `Source/` → `SourceFiles`, `SourceMetadata`, `SourceOverview`, `SourceStepSettings`, `SourcePageWorkbench`, `ThumbCard`, `FakeThumb`, `InsertDialog`, `BulkBar`, `FileToolbar`, `SourceBanner`.
   - `Grayscale/` → from `final/grayscale/grayscale.jsx`.
   - `Crop/` → from `final/crop/crop.jsx`.
   - `HyphenJoin/` → from `final/hyphen_join/hyphen.jsx` + `variations.jsx`.
   - `ProjectsLanding/` → from `final/projects/projects.jsx` + `post-import.jsx`.
4. **Wireframe-only components** (not yet wired into a `final/` stage):
   - `PageReorder/` → from `wf09/pages-tab.jsx` (drag-to-reorder for Source/Pages tab) + `wf09/variations.jsx` (`ReorderScansStage` for the new `page_order` stage 11). See `final/index.html` for context on the split.
   - `Scannos/` → from `wf05b/scanno-*.jsx`.
   - `PageWorkbench/` → from `wf-pw/ui.jsx` + `wf-pw/wf-pw-variations.jsx`.
   - `PackageValidation/` → from `wf02/validation-panel.jsx`.
   - `QualityFlags/` → from `wf03/wf03-variations.jsx`.

### Pass 4 · TypeScript-ify

For every ported component:

- Define a `Props` interface. Don't use `any`. Don't widen with `Record<string, unknown>` — be explicit about every prop the design exercises.
- For "state" props that drive whole-page variants (e.g. `SourceFiles` has `state: 'generating' | 'selection'`), use string-literal unions and discriminated unions where appropriate.
- For density / tone / variant props, mirror the CSS-token system: `tone: 'clean' | 'dirty' | 'review' | 'fuzzy' | 'exact' | 'gt' | 'mismatch'` etc. — pull the canonical list from `tokens.css`.
- Preserve every `data-screen-label` / `data-comment-anchor` attribute the source places on elements; if pdomain-ui has a convention for these, use it.

### Pass 5 · Strip the prototype scaffolding

The design files use:

- `<script type="text/babel">` with Babel-standalone — drop this.
- `Object.assign(window, { … })` to share components across script tags — replace with normal ESM exports.
- A `DesignCanvas` / `DCSection` / `DCArtboard` wrapper for the visual exploration grid — **do not port this.** It's purely for showing many states side-by-side in the prototype. Each `DCArtboard` corresponds to one (component, props) pair; lift that pair into a Storybook story instead.
- A `theme` state held in `localStorage('pgd-theme')` — match pdomain-ui's existing theme handling instead.

### Pass 6 · Write MIGRATION_NOTES.md

End with a markdown file in pdomain-ui's root describing:

- Every new pdomain-ui export (atom / molecule / template / stage component) and which design file it came from.
- Tokens added or aliased.
- Conscious omissions ("did not port `FakeThumb` — pure placeholder for design canvas, replace with real thumbnail logic in the consuming app").
- Open questions for me (the human).

## Triage rules — which components to port

**Port** if it shows up in 2+ files, or appears in `final/` (not just wireframes), or implements a generic UX pattern (segmented control, banner, dialog, sticky bulk bar). The COMPONENT_INDEX frequency table is your starting heuristic.

**Co-locate, don't port** if it's:

- A page-specific layout helper (`SourceWBSubhead`, `SrcWBField`, `SrcWBInput`, `SrcWBSelect` — these are *only* useful inside the Source Page Workbench; they should live next to `SourcePageWorkbench` not in pdomain-ui's root).
- A placeholder visual (`FakeThumb`, `SkeletonThumb`, `InsertedThumb`) — these mimic real page scans for the prototype only. In production they'll be replaced with actual image components.
- A one-shot data wrapper (`InPagesTab` etc. — `wf09/app.jsx` defines this as a local closure).

**Skip entirely** if it's prototype infrastructure (`DesignCanvas`, `DCSection`, `DCArtboard`, `CanvasNav`, the theme toggle, app-level `App()` functions).

## Guardrails

- **Don't bring my visual decisions into pdomain-ui as overrides.** If pdomain-ui already has a `Button` with `variant="primary"` that looks different from the design, *flag it in MIGRATION_NOTES rather than overriding pdomain-ui*. I'll decide whether to update pdomain-ui or restyle the consuming app.
- **Don't ship `tokens.css` verbatim** if pdomain-ui has its own token file. Diff the two, port missing tokens with names that match pdomain-ui's convention, and document aliases.
- **No `!important`** in any ported CSS.
- **Match pdomain-ui's existing file layout, naming, and export conventions** — don't introduce a new convention. If you're unsure, ask me before structuring the new folder.
- **One PR per pass** (or at least one commit per pass) — atoms, then molecules, then templates, then stage components, then wireframe-only. Keep them reviewable.

## Done when

- Every component in `COMPONENT_INDEX.md` that meets the "port" rule has a typed pdomain-ui export with a Storybook entry.
- pdomain-ui builds cleanly with `pnpm build` (or whatever the existing build command is).
- A consuming app can replace any `.jsx` file in `final/` with imports from pdomain-ui + a thin glue file. Demonstrate this for at least `final/source/source.jsx` → pdomain-ui imports.
- `MIGRATION_NOTES.md` exists, is honest about gaps, and lists open questions.

Start with Pass 1. Don't write code yet. Once you've read the design system, atoms, and `final/index.html`, summarize what you found and what your plan is. Then we'll proceed pass by pass.
