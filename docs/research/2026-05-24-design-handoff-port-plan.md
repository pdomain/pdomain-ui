# Design-handoff port-plan

**Status:** ready for CT review
**Date:** 2026-05-24
**Source bundle:** `docs/templates/design_handoff_pdomain_ui/`
**Reviewer:** CT (must sign off before any Phase 2/3 issue is started)

## How to read this document

Five verdict tables. Each row classifies one design-bundle identifier
against pdomain-ui's current state and assigns a target outcome. CT review
may move rows between classifications.

---

## Table 1 · Atom verdict

For every identifier in `docs/templates/design_handoff_pdomain_ui/design-system/ui-base.jsx`.

The design exports 11 atoms + 1 full app-frame via `Object.assign(window, …)`.

| identifier | usage count | already in pdomain-ui (path) | verdict | target path | notes |
|---|---|---|---|---|---|
| `Icon` | 10 | `src/icons/lucide.ts` + `src/icons/bespoke.tsx` | `already-in-pdomain-ui` | `src/icons/` | Design `Icon` is a single monolithic SVG dispatcher (inline paths, name-keyed). pdomain-ui exports individual named lucide components + bespoke SVG icons. API is fundamentally different — design callers write `<Icon name="check"/>`, pdomain-ui callers write `<Check size={14}/>`. See **OQ-1**. |
| `Button` | 10 | `src/primitives/Button.tsx` | `already-in-pdomain-ui` | — | API diverges: design has `icon`, `iconRight`, `full`, `variant="outline"/"brand"` aliases; pdomain-ui `Button` has no `icon` prop and no `full` prop (uses className). `variant` is close but aliases differ. See **OQ-2**. |
| `Input` | 10 | `src/primitives/Input.tsx` | `already-in-pdomain-ui` | — | API diverges: design `Input` wraps a `<div>` shell (with `suffix` and `autoFocus` focus-ring logic inline); pdomain-ui `Input` is a bare `<input>` with CSS class. Composite wrapper absent from pdomain-ui. See **OQ-3**. |
| `Badge` | 10 | `src/primitives/Badge.tsx` | `already-in-pdomain-ui` | — | API diverges significantly: design `Badge` has `tone` (neutral/brand/clean/exact/dirty/fuzzy/review/running/ocr/failed/mismatch/error/gt) + `dot` + `mono` props with inline tinted-bg/border logic. pdomain-ui `Badge` has `variant` (default/primary/danger) — much simpler, no semantic status tones. See **OQ-4**. |
| `KeyCap` | 10 | `src/primitives/KeyCap.tsx` | `already-in-pdomain-ui` | — | API diverges: design `KeyCap` accepts `children` (free text); pdomain-ui `KeyCap` accepts `keys: string \| string[]` (splits multi-key chords). Visual intent is the same; interface differs. |
| `Divider` | 10 | `src/primitives/Separator.tsx` | `already-in-pdomain-ui` | — | Functionally equivalent. Design calls it `Divider`, pdomain-ui calls it `Separator`. `vertical` prop → `orientation="vertical"`. No API conflict beyond rename. Note: `Divider` is the name used throughout all stage files; rename will require import changes in consumer code. |
| `StepDots` | 10 | — | `port` | `src/primitives/StepDots.tsx` | No equivalent in pdomain-ui. Wizard-step indicator with step label + done/active/pending states. Generic enough to live in primitives. |
| `TopNav` | 10 | `src/shell/TopNav.tsx` | `already-in-pdomain-ui` | — | API diverges: design `TopNav` is an opinionated, hard-coded chrome bar (icon, app name, search box, bell + badge, user avatar); pdomain-ui `TopNav` is a layout shell accepting `children`. The design's opinionated contents need to map to a slot pattern. `AppHeader` in `design-system/template.jsx` is the fully-slotted replacement. See **OQ-5**. |
| `ServerFooter` | 10 | — | `port` | `src/shell/ServerFooter.tsx` | No equivalent in pdomain-ui shell. Shows server address + copy button. Suite-wide chrome — belongs in `src/shell/`. |
| `PageHeader` | 10 | — | `port` | `src/primitives/PageHeader.tsx` | A title + optional subtitle + optional action slot. Distinct from pdomain-ui's `AppShell` bands. Generic, belongs in primitives. |
| `ProjectListBackdrop` | 10 | — | `skip` | — | Composite demo-scaffold that renders a hard-coded project card behind the modal overlay in the design tool. Not a standalone component — it is prototype scaffolding that demonstrates the projects list behind a drawer/dialog. |
| `AppFrame` | 10 | `src/shell/AppShell.tsx` | `already-in-pdomain-ui` | — | API diverges: design `AppFrame` composes `TopNav` + `ProjectListBackdrop` + modal/sheet overlay into a single opinionated container (theme, children, modalNode, sheetNode). pdomain-ui `AppShell` is a 5-zone CSS grid shell with proper slots. Design's `modalNode`/`sheetNode` pattern maps to a Dialog/Drawer composition. No direct API equivalence; consumers should use `AppShell` + `Dialog`/`Drawer`. |

---

## Table 2 · Token diff

Every `--*` custom property from `docs/templates/design_handoff_pdomain_ui/design-system/tokens.css`
compared against `theme/tokens.css`.

**Scope difference:** design `tokens.css` is scoped to `.pgd {}` / `.pgd[data-theme="light"]`.
pdomain-ui `theme/tokens.css` uses `:root` / `[data-theme="light"]` (global scope).
The design bundle applies tokens inside a `.pgd` class boundary rather than globally —
the same custom property names, but scoped to the `.pgd` root element.

### Dark theme (`:root`)

| token name | design value | pdomain-ui value | verdict |
|---|---|---|---|
| `--bg-page` | `#0c0c10` | `#0c0c10` | `identical` |
| `--bg-surface` | `#15151b` | `#15151b` | `identical` |
| `--bg-raised` | `#1d1d24` | `#1d1d24` | `identical` |
| `--bg-sunk` | `#08080c` | `#08080c` | `identical` |
| `--border-1` | `#222229` | `#222229` | `identical` |
| `--border-2` | `#2f2f38` | `#2f2f38` | `identical` |
| `--border-3` | `#3f3f49` | `#3f3f49` | `identical` |
| `--ink-1` | `#f0f0f2` | `#f0f0f2` | `identical` |
| `--ink-2` | `#b0b0b8` | `#b0b0b8` | `identical` |
| `--ink-3` | `#7a7a85` | `#7a7a85` | `identical` |
| `--ink-4` | `#4e4e58` | `#4e4e58` | `identical` |
| `--accent` | `#d6925a` | `#d6925a` | `identical` |
| `--accent-ink` | `#1a0f08` | `#1a0f08` | `identical` |
| `--exact` | `#5fbf6a` | `#5fbf6a` | `identical` |
| `--fuzzy` | `#e8a83a` | `#e8a83a` | `identical` |
| `--mismatch` | `#dc6555` | `#dc6555` | `identical` |
| `--ocr` | `#5d9fdf` | `#5d9fdf` | `identical` |
| `--gt` | `#a888d4` | `#a888d4` | `identical` |
| `--block` | `#a89074` | `#a89074` | `identical` |
| `--para` | `#7fb56a` | `#7fb56a` | `identical` |
| `--line` | `#d088a8` | `#d088a8` | `identical` |
| `--word` | `#6e9cdf` | `#6e9cdf` | `identical` |
| `--ui-font` | `'Inter', system-ui, sans-serif` | `'Inter', system-ui, sans-serif` | `identical` |
| `--mono-font` | `'JetBrains Mono', ui-monospace, monospace` | `'JetBrains Mono', ui-monospace, monospace` | `identical` |
| `--shadow-floating` | `0 3px 10px rgba(0,0,0,0.35)` | `0 3px 10px rgba(0,0,0,0.35)` | `identical` |
| `--overlay-scrim` | not present in design tokens.css | `rgba(0, 0, 0, 0.55)` | `missing` — token is only in pdomain-ui; design bundle uses the value inline. No action needed (pdomain-ui addition is correct). |
| `--font-sans` | `var(--ui-font)` (back-compat alias, lines 48–49 of design tokens.css) | not declared | `missing` — present in the design's tokens.css as a `:root`-level back-compat alias; pdomain-ui's `theme/tokens.css` does not declare it. See **OQ-6**. |
| `--font-mono` | `var(--mono-font)` (back-compat alias, lines 48–49 of design tokens.css) | not declared | `missing` — same as `--font-sans`. See **OQ-6**. |

### Light theme (`[data-theme="light"]`)

| token name | design value | pdomain-ui value | verdict |
|---|---|---|---|
| `--bg-page` | `#f6f4ef` | `#f6f4ef` | `identical` |
| `--bg-surface` | `#ffffff` | `#ffffff` | `identical` |
| `--bg-raised` | `#ecebe5` | `#ecebe5` | `identical` |
| `--bg-sunk` | `#f0eee7` | `#f0eee7` | `identical` |
| `--border-1` | `#d8d4c8` | `#d8d4c8` | `identical` |
| `--border-2` | `#c2bdaf` | `#c2bdaf` | `identical` |
| `--border-3` | `#a39e8d` | `#a39e8d` | `identical` |
| `--ink-1` | `#1a1810` | `#1a1810` | `identical` |
| `--ink-2` | `#4a4538` | `#4a4538` | `identical` |
| `--ink-3` | `#7c7665` | `#7c7665` | `identical` |
| `--ink-4` | `#b0aa95` | `#b0aa95` | `identical` |
| `--accent` | `#b85a2e` | `#b85a2e` | `identical` |
| `--accent-ink` | `#ffffff` | `#ffffff` | `identical` |
| `--exact` | `#2d8c3a` | `#2d8c3a` | `identical` |
| `--fuzzy` | `#b87b1f` | `#b87b1f` | `identical` |
| `--mismatch` | `#b13d32` | `#b13d32` | `identical` |
| `--ocr` | `#2d6fb5` | `#2d6fb5` | `identical` |
| `--gt` | `#6e4ea5` | `#6e4ea5` | `identical` |
| `--block` | `#7a5e3a` | `#7a5e3a` | `identical` |
| `--para` | `#4d8a3a` | `#4d8a3a` | `identical` |
| `--line` | `#a8527a` | `#a8527a` | `identical` |
| `--word` | `#3d6bb8` | `#3d6bb8` | `identical` |
| `--shadow-floating` | `0 3px 10px rgba(60,40,20,0.10)` | `0 3px 10px rgba(60,40,20,0.1)` | `identical` (trailing zero difference is insignificant) |
| `--overlay-scrim` | not present in design tokens.css | `rgba(0, 0, 0, 0.40)` | `missing` — same note as dark theme |

**Token summary:** The design's tokens.css declares 27 named tokens. Of these, 25 are
`identical` between design and pdomain-ui, 0 are `value-mismatch`, and 2 are `missing` from
pdomain-ui (`--font-sans`, `--font-mono` — back-compat aliases declared in the design bundle
but absent from `theme/tokens.css`). One additional token (`--overlay-scrim`) exists only
in pdomain-ui (an addition, not a regression) — see **OQ-6**.

---

## Table 3 · Icon mapping

Every `name` key in the design's `Icon` component switch-statement
(the `paths` object in `design-system/ui-base.jsx`).

| design name | lucide name (if any) | verdict | bespoke component name (if bespoke) | notes |
|---|---|---|---|---|
| `upload` | `Upload` | `port to lucide` | — | Not yet in pdomain-ui lucide.ts; add export |
| `folder` | `Folder` | `port to lucide` | — | Not yet exported; use `FolderOpen` already exported or add `Folder` |
| `file` | `File` | `port to lucide` | — | Not yet in pdomain-ui lucide.ts; add export |
| `image` | `Image` | `port to lucide` | — | Not yet in pdomain-ui lucide.ts; add export |
| `archive` | `Archive` | `port to lucide` | — | Not yet in pdomain-ui lucide.ts; add export |
| `link` | `Link` | `port to lucide` | — | Not yet in pdomain-ui lucide.ts; add export |
| `hardDrive` | `HardDrive` | `port to lucide` | — | Not yet in pdomain-ui lucide.ts; add export |
| `check` | `Check` | `already-in-pdomain-ui` | — | Already exported in lucide.ts |
| `checkCircle` | `CheckCircle` | `port to lucide` | — | Not yet exported; add |
| `x` | `X` | `already-in-pdomain-ui` | — | Already exported |
| `alert` | `AlertTriangle` | `port to lucide` | — | Not yet exported; lucide name is `AlertTriangle` (v0.x) or `TriangleAlert` (v1.x). See **OQ-7**. |
| `info` | `Info` | `already-in-pdomain-ui` | — | Already exported |
| `chevR` | `ChevronRight` | `already-in-pdomain-ui` | — | Already exported |
| `chevL` | `ChevronLeft` | `already-in-pdomain-ui` | — | Already exported |
| `chevD` | `ChevronDown` | `already-in-pdomain-ui` | — | Already exported |
| `arrowR` | `ArrowRight` | `port to lucide` | — | Not yet exported; add |
| `search` | `Search` | `already-in-pdomain-ui` | — | Already exported |
| `bell` | `Bell` | `port to lucide` | — | Not yet exported; add |
| `plus` | `Plus` | `already-in-pdomain-ui` | — | Already exported |
| `moon` | `Moon` | `port to lucide` | — | Not yet exported; add |
| `sun` | `Sun` | `port to lucide` | — | Not yet exported; add |
| `grip` | `GripVertical` | `port to lucide` | — | Not yet exported; lucide equivalent is `GripVertical` or `Grip` |
| `pause` | `Pause` | `port to lucide` | — | Not yet exported; add |
| `download` | `Download` | `port to lucide` | — | Not yet exported; add |
| `wrench` | `Wrench` | `port to lucide` | — | Not yet exported; add |
| `refresh` | `RefreshCw` | `port to lucide` | — | Not yet exported; add |
| `eye` | `Eye` | `already-in-pdomain-ui` | — | Already exported |
| `loader` | `Loader2` | `already-in-pdomain-ui` | — | Already exported as `Loader2` |
| `fileText` | `FileText` | `port to lucide` | — | Not yet exported; add |
| `play` | `Play` | `port to lucide` | — | Not yet exported; add |
| `package` | `Package` | `port to lucide` | — | Not yet exported; add |
| `moreH` | `MoreHorizontal` | `already-in-pdomain-ui` | — | Already exported |
| `arrowUp` | `ArrowUp` | `port to lucide` | — | Not yet exported; add |
| `arrowDown` | `ArrowDown` | `port to lucide` | — | Not yet exported; add |
| `arrowUpDown` | `ArrowUpDown` | `port to lucide` | — | Not yet exported; add |
| `scissors` | `Scissors` | `port to lucide` | — | Not yet exported; add |
| `trash` | `Trash2` | `already-in-pdomain-ui` | — | Already exported as `Trash2` |
| `sparkles` | `Sparkles` | `port to lucide` | — | Not yet exported; add |
| `swap` | `ArrowLeftRight` or `Repeat2` | `port to lucide` | — | Design SVG has two-sided arrows in a loop shape. Closest lucide is `Repeat2`. See **OQ-8**. |
| `copy` | `Copy` | `port to lucide` | — | Not yet exported; add |

**Icon summary:** 12 already exported; 28 not yet in `lucide.ts` and need to be added.
No design icon requires a bespoke component — all have lucide equivalents.
Note: `folder` should be audited against the already-exported `FolderOpen` to decide
if a plain `Folder` is also needed.

---

## Table 4 · Cross-stage molecule inventory

Every identifier with usage count ≥ 3 in `COMPONENT_INDEX.md` that is NOT
already covered in Table 1 as an atom.

Identifiers with count ≥ 3 from the frequency table (excluding `App` which is an app-root skeleton):

| identifier | file count | files | classification | target path | depends on |
|---|---|---|---|---|---|
| `STAGE_DEFS` | 9 | wf02, wf05, wf05b, wf09, wf10, wf11, pipeline-template, wf-pw/wf03-variations, wf03/wf03-variations | `stage-specific` | — | Constant array; each file copies the same pipeline stage list. Not a React component; not a pdomain-ui export. Lives in pdomain-ops or a consuming app's constants. |
| `StageContextStrip` | 8 | wf02/pipeline-shell, wf03/wf03-variations, wf05/pipeline-shell, wf05b/pipeline-shell, wf09/pipeline-shell, wf10/pipeline-shell, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/StageContextStrip.tsx` | `StageStrip` data model; `Icon`; stage status tokens |
| `ViewToggle` | 5 | wf03/wf03-variations, wf05/variations, wf05b/pipeline-shell (implied), wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/ViewToggle.tsx` | `Icon`; `Button` variants |
| `RunAllDirtyPanel` | 5 | wf02/pipeline-shell, wf05/pipeline-shell, wf05b/pipeline-shell, wf09/pipeline-shell, wf10/pipeline-shell | `cross-stage molecule` | `src/primitives/RunAllDirtyPanel.tsx` | `Button`; status tokens |
| `BuildPackagePanel` | 5 | wf02/pipeline-shell, wf05/pipeline-shell, wf05b/pipeline-shell, wf09/pipeline-shell, wf10/pipeline-shell | `cross-stage molecule` | `src/primitives/BuildPackagePanel.tsx` | `Button`; `Badge`; status tokens |
| `DiskCostBanner` | 5 | wf02/pipeline-shell, wf05/pipeline-shell, wf05b/pipeline-shell, wf09/pipeline-shell, wf10/pipeline-shell | `cross-stage molecule` | `src/primitives/DiskCostBanner.tsx` | `Icon`; `Button` |
| `Tab` | 5 | wf02/pipeline-shell, wf05/pipeline-shell, wf05b/pipeline-shell, wf09/pipeline-shell, wf10/pipeline-shell | `stage-specific` | — | Thin local tab-item helper inside each pipeline-shell file. Differs from pdomain-ui `Tabs` primitive. Co-locates with consumer. |
| `ProjectConfigureFrame` | 5 | wf02/pipeline-shell, wf05/pipeline-shell, wf05b/pipeline-shell, wf09/pipeline-shell, wf10/pipeline-shell | `cross-stage molecule` | `src/templates/ProjectConfigureFrame.tsx` | `BuildPackagePanel`; `RunAllDirtyPanel`; `DiskCostBanner`; layout grid |
| `FlagChip` | 4 | wf03/wf03-variations, wf10/crops-grid, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/FlagChip.tsx` | `Badge` tone system; flag metadata |
| `Toggle` | 4 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations, final/pipeline/project-settings | `cross-stage molecule` | `src/primitives/Toggle.tsx` | pdomain-ui has `ToggleGroup` (Radix) but no standalone Toggle switch. Design's `Toggle` is an inline boolean switch (30×18px pill). Not covered by `ToggleGroup`. See **OQ-9**. |
| `CheckRow` | 4 | wf02/validation-panel, wf05/library-variations, wf11/wf-pw-variations, wf-pw/wf-pw-variations | `stage-specific` | — | Context varies significantly across files. Not a shared molecule. |
| `PageThumb` | 4 | wf03/wf03-variations, wf09/pages-tab, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Page image thumbnail; closely coupled to page/image data model. Defer to stage-specific SPA. |
| `BulkActionBar` | 4 | wf03/wf03-variations, wf10/crops-grid, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/BulkActionBar.tsx` | `Button`; selection count; action callbacks |
| `PageRow` | 4 | wf03/wf03-variations, wf09/pages-tab, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Tightly coupled to page-list data model. |
| `StatTile` | 3 | wf01/variations, wf05/variations, final/hyphen_join/variations | `cross-stage molecule` | `src/primitives/StatTile.tsx` | Token system only |
| `ConfigureHeader` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/ConfigureHeader.tsx` | `Breadcrumb`; `Icon` |
| `ConfigureTabs` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/ConfigureTabs.tsx` | Tab items; selection state |
| `QualityBanner` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/QualityBanner.tsx` | `Badge`; `Icon`; status tokens |
| `STAGE_FLAGS` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Data constant; not a React component. |
| `STAGE_FLAG_DETAIL` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Data constant. |
| `FLAG_TONE` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Data constant. |
| `FLAG_META` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Data constant. |
| `RowFlagBadge` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/RowFlagBadge.tsx` | `FlagChip`; flag metadata |
| `STAGE_STATE_BY_INDEX` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Data constant / helper; not a React component. |
| `StageJumpPopover` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/templates/StageJumpPopover.tsx` | `Popover` (Radix); `STAGE_DEFS`; `Badge` |
| `THUMB_SIZE_CFG` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Data constant. |
| `ThumbFlagBadge` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/ThumbFlagBadge.tsx` | `FlagChip`; image overlay |
| `ThumbGrid` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/ThumbGrid.tsx` | `PageThumb`; `ThumbFlagBadge`; virtualization |
| `ThumbSizeToggle` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/ThumbSizeToggle.tsx` | `ToggleGroup` (Radix); `THUMB_SIZE_CFG` |
| `FilterToolbar` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/FilterToolbar.tsx` | `Button`; `Input`; filter state |
| `PAGE_TYPE_BADGE` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Data constant. |
| `ROWS_BASE` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Sample data constant. |
| `ROWS_FLAGGED_ONLY` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Sample data constant. |
| `ROWS_BLURRY_ONLY` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `stage-specific` | — | Sample data constant. |
| `TableHeader` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/TableHeader.tsx` | `Button`; sort state |
| `TableFooter` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/TableFooter.tsx` | `Button`; pagination |
| `SummaryStrip` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/SummaryStrip.tsx` | `SummaryCell`; status tokens |
| `SummaryCell` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `cross-stage molecule` | `src/primitives/SummaryCell.tsx` | token system |
| `VariationA` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `skip` | — | Artboard-level demo frame in the design canvas. Not a portworthy component. |
| `VariationB` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `skip` | — | Same — demo frame. |
| `ThemedFrame` | 3 | wf03/wf03-variations, wf11/wf03-variations, wf-pw/wf03-variations | `skip` | — | Design-canvas theme wrapper. Equivalent of `AppFrame` in wireframe artboards. Not portworthy. |

**Table 4 summary:** 23 cross-stage molecules identified for porting (21 in `src/primitives/`, 2 in `src/templates/`); 15 `stage-specific` data constants or tightly-coupled helpers; 3 `skip` (demo scaffolding).

---

## Table 5 · Template inventory

For each layout template in `final/`.

| template | source file | slots (props) | depends on molecules | notes |
|---|---|---|---|---|
| `PipelineTemplate` | `final/pipeline/pipeline-template.jsx` | `theme`, `trail`, `project`, `stage`, `currentTab`, `tabsSlot` (the per-stage tab band; defaults to `TabsBand`), `children` (tab body content; defaults to `PipelineEmptySlot`), `controls` | `AppTemplate`, `ProjectInfoBand`, `StageStrip`, `TabsBand`; indirectly: `AppHeader`, `Breadcrumb`, `CoverPlaceholder`, `Badge`, `Button`, `Divider`, `KeyCap`, `Icon` | The primary per-project pipeline shell. `tabsSlot` and `children` are the two slots consuming apps fill. `AppTemplate` (from `design-system/template.jsx`) serves as its outer wrapper. |
| `ProjectSettingsTemplate` | `final/pipeline/pipeline-template.jsx` | `theme`, `project`, `currentGroup` (one of 8 settings groups), `children` (right-pane content) | `AppTemplate`, `ProjectInfoBand`; sidebar nav is inline (no extracted molecule); `Icon`, `Button` | Project-scoped settings destination. Stage strip absent; left rail is an inline 8-item list. `children` is the only slot consumers fill. May want `SettingsNav` extracted to a molecule — see **OQ-10**. |
| `ProjectsPage` | `final/projects/projects.jsx` | `theme`, `defaultTab` (activity/attributes/manage), `selectedId`, `emptyState` (not wired — see note) | `AppTemplate`, `PipelineMini`, `CoverPlaceholder`, `AttributesPanel`, `ProjectsControls`, `Badge`, `Button`, `Icon` | Root projects list + detail pane. Left rail + right pane layout. `AttributesPanel` is a cross-stage molecule candidate (used in `ProjectsPage` + future attributes views). `emptyState` prop exists in the component signature but the boolean is not yet used — the `ProjectsEmpty` component is a separate component. See **OQ-11**. |
| `AppTemplate` | `final/design-system/template.jsx` | `theme`, `header` (override for `AppHeader`), `breadcrumb` (override), `trail`, `controls` (breadcrumb controls slot), `activeJobs`, `jobsOpen`, `children`, `contentPad` | `AppHeader`, `Breadcrumb`, `JobsPill`, `ControlsPlaceholder` | Full shell: header + breadcrumb + content. The outer wrapper used by all three above. Should map to pdomain-ui's `AppShell` + a new header/breadcrumb composition in Phase 3. `AppHeader`+`Breadcrumb` together form a more opinionated nav band than pdomain-ui's current `AppShell` header slot. See **OQ-5** and **OQ-12**. |

**Note on `final/template/` directory:** Contains only `app.jsx` (an `App` root wrapping `DesignCanvas`) and `design-canvas.jsx` (the design-tool scaffold — see `skip` verdict). No portworthy template lives there.

---

## Verdict glossary

- **`already-in-pdomain-ui`** — pdomain-ui already exports an equivalent at the listed path; no port needed. Note any API divergence in `notes`.
- **`port`** — port into pdomain-ui at the listed target path. Becomes a Phase 2 or Phase 3 issue.
- **`port to lucide`** — add the named export to `src/icons/lucide.ts`. Phase 2 task.
- **`rename`** — port but rename to match pdomain-ui naming.
- **`co-locate`** — page-scoped helper; do not port; lives next to its consumer in the eventual consuming app.
- **`skip`** — prototype scaffolding (`DesignCanvas`, `DCSection`, `DCArtboard`, theme toggle, app-level `App()`, demo-variation frames); do not port.
- **`cross-stage molecule`** (Table 4) — appears in 3+ files; port into pdomain-ui under this spec's Phase 3.
- **`stage-specific`** (Table 4) — used only inside one stage's body, or is a data constant, not a React component; deferred to the follow-on `pdomain-ui-design-handoff-stages` spec or the consuming app.

---

## Open questions for CT

**OQ-1 · Icon dispatcher vs. named exports.**
The design uses `<Icon name="check" size={14}/>` everywhere — a single name-dispatching component. pdomain-ui exports named lucide components + bespoke SVG components; consumers write `<Check size={14}/>`. This is an API contract divergence that affects every portworthy file (all stage bodies call `<Icon name="…"/>`). Options: (a) accept named imports, update all ported files at port time; (b) add a thin `<Icon name>` dispatcher shim to `src/icons/` that maps to named exports; (c) document the mapping and let consumers handle it. CT to decide before Phase 2 begins.

**OQ-2 · Button `icon`/`iconRight`/`full` props.**
Design `Button` composes `Icon` inline via `icon` and `iconRight` props and supports `full` (width 100%). pdomain-ui `Button` has none of these props — callers compose `<Check/>` as children and use `className` for width. Ported code will need these additions or a different composition pattern. CT to decide whether to extend pdomain-ui `Button` or update call sites.

**OQ-3 · Input composite wrapper.**
Design `Input` is a `<div>` shell with a child `<input>`, a `suffix` slot, and an inline focus-ring (`autoFocus` → blue border + box-shadow). pdomain-ui `Input` is a bare `<input>` styled via CSS. The `suffix` pattern and composite wrapper are absent. CT to decide whether to add a `<InputField>` composite or handle suffix differently.

**OQ-4 · Badge tone system.**
Design `Badge` uses a rich semantic `tone` prop (13 values) driven by status tokens. pdomain-ui `Badge` has 3 structural variants (default/primary/danger). The status-tone system (exact/fuzzy/mismatch/ocr/gt/review/running etc.) maps to the domain vocabulary that all stage UIs use. CT to decide whether to extend pdomain-ui `Badge` with a `tone` prop or introduce a separate `StatusBadge`/`TonedBadge` component.

**OQ-5 · TopNav / AppHeader split.**
Design `TopNav` (from `ui-base.jsx`) is an opinionated, hard-coded chrome bar. `AppHeader` in `template.jsx` is the final, slotted replacement that supersedes it — with `activeJobs`, `jobsOpen`, `username`, `initials`, `unread`, and a search box. pdomain-ui `TopNav` is a thin layout shell. The question is: should pdomain-ui expose an opinionated `AppHeader` molecule (app icon + search + jobs pill + bell + user avatar) as a new `src/shell/AppHeader.tsx`, or should the consuming app compose these pieces from primitives? CT to decide the portability target for `AppHeader`, `JobsPill`, `JobsDrawer`, and `JobRow`.

**OQ-6 · `--font-sans` / `--font-mono` back-compat aliases.**
The design bundle's `tokens.css` declares `--font-sans: var(--ui-font)` and `--font-mono: var(--mono-font)` as back-compat aliases (lines 48–49, inside the root token block). pdomain-ui's `theme/tokens.css` does NOT declare these aliases — only the canonical `--ui-font` and `--mono-font` are present. CT to confirm: should pdomain-ui add `--font-sans` / `--font-mono` as `:root`-level aliases for consumer back-compat, or should consumers be expected to use the canonical names (`--ui-font`, `--mono-font`) directly?

**OQ-7 · `alert` icon → lucide version.**
The `alert` icon (triangle with exclamation) is `AlertTriangle` in lucide-react v0.x but was renamed to `TriangleAlert` in v1.x. pdomain-ui uses lucide-react; the installed version determines which name to use. CT to confirm lucide-react version in `package.json` before adding the export. If the installed version is v1+, use `TriangleAlert`.

**OQ-8 · `swap` icon ambiguity.**
The design's `swap` icon SVG (two opposing arrows forming a bidirectional exchange) does not have a single perfect lucide match. Candidates: `Repeat2` (circular refresh-style), `ArrowLeftRight` (straight bidirectional), `Replace` (overwrite). CT to pick the intended semantic before the icon is exported.

**OQ-9 · Standalone `Toggle` (boolean switch) vs. `ToggleGroup`.**
Design uses a `Toggle` (30×18px pill, CSS transition, on/off) in 4 files including `project-settings.jsx`. pdomain-ui has `ToggleGroup` (Radix, for radio-style groups of labeled options) but no simple boolean switch component. These serve different use cases. CT to decide: (a) port a standalone `Toggle`/`Switch` component to `src/primitives/Toggle.tsx`; (b) use a `<input type="checkbox">` pattern with CSS; (c) use a Radix `Switch` primitive.

**OQ-10 · `ProjectSettingsTemplate` sidebar nav extraction.**
The left rail inside `ProjectSettingsTemplate` is an inline 8-item list (general / bibliographic / pgdp / format / defaults / members / storage / danger). It's not extracted as a molecule and currently not reused elsewhere. For the ported template, this could stay inline or be extracted as `SettingsNav`. CT to decide before Phase 3 issue is filed.

**OQ-11 · `ProjectsPage` `emptyState` prop not wired.**
`ProjectsPage` accepts `emptyState = false` in its signature but the boolean is never referenced in the component body — `ProjectsEmpty` is a separate component. At port time, these could be merged (single `ProjectsPage` that switches to empty-state layout when `emptyState` is true) or kept as two components. CT to confirm intended API.

**OQ-12 · `AppTemplate` → `AppShell` mapping.**
`AppTemplate` (header + breadcrumb + content slot) is the design's full shell. pdomain-ui's `AppShell` is a 5-zone CSS grid (header, rail, drawer, main, right). The design's two-zone layout (header band + content) is a subset of pdomain-ui's model. When porting `PipelineTemplate` and `ProjectSettingsTemplate`, CT should confirm: do these templates wrap `AppShell` directly, or do they compose a new `AppShellPage` layout wrapper that provides header + breadcrumb + content as a simpler interface on top of `AppShell`?

---

## CT review decisions (2026-05-24)

All 12 open questions resolved. Decisions below are authoritative for Phase 2/3 implementation; plan amendments follow in a separate commit.

| OQ | Decision | Rationale / scope |
|---|---|---|
| **OQ-1** Icon dispatcher | **Extend pdomain-ui** — add `<Icon name>` dispatcher shim in `src/icons/` that maps to named lucide/bespoke exports | Lets ported stage code use the design's API verbatim; named-export style still available |
| **OQ-2** Button icon/iconRight/full | **Extend pdomain-ui Button** with `icon`, `iconRight`, `full` optional props | Non-breaking; pdomain-ui callers can ignore the new props |
| **OQ-3** Input composite wrapper + suffix | **Extend pdomain-ui Input** (or add `InputField` composite) with wrapper + `suffix` slot + `autoFocus` ring | Same rationale; non-breaking additions |
| **OQ-4** Badge tone system | **Extend pdomain-ui Badge** with `tone` prop carrying 13 semantic values (exact / fuzzy / mismatch / ocr / gt / review / running / clean / dirty / etc. — full list per design) | Status-tone is domain vocabulary used across every stage; structural variants (default/primary/danger) stay |
| **OQ-5** AppHeader + JobsPill / JobsDrawer / JobRow | **Port all four** into `src/shell/` | Every pdomain-* SPA needs a jobs indicator + user avatar; centralizing avoids per-SPA re-implementation |
| **OQ-6** `--font-sans` / `--font-mono` aliases | **Do NOT add** | Consumers use canonical `--ui-font` / `--mono-font`; port-time rewrites at consumer side |
| **OQ-7** `alert` icon → lucide name | **`AlertTriangle`** (lucide-react ^0.400.0 confirmed in package.json) | Mechanical |
| **OQ-8** `swap` icon | **`ArrowLeftRight`** | Straight bidirectional matches design SVG |
| **OQ-9** Toggle primitive | **Radix `Switch` in `src/primitives/Toggle.tsx`** | Matches existing pattern (Radix for behavior-heavy primitives) |
| **OQ-10** SettingsNav extraction | **Extract as `src/templates/SettingsNav.tsx`** | Pattern recurs across pdomain-* SPAs with settings; cheap now, free reuse later |
| **OQ-11** ProjectsPage emptyState | **Merge into single `ProjectsLandingTemplate`** with `state: 'populated' \| 'empty'` discriminated union | Same conceptual page; shared chrome |
| **OQ-12** AppTemplate → AppShell | **Revised AppShell to 3 zones (header + rail + main)**; deprecate `drawer` / `rightPanel` props in JSDoc (kept for back-compat with `pdomain-ocr-labeler-spa` + `pdomain-prep-for-pgdp`); templates own internal sub-layouts. Add **`ProjectsDrawer`** as a suite-wide molecule (embed in templates, not a shell zone). | Cleaner separation: shell = consistent suite chrome; templates = pluggable interior layouts. Breaking removal of `drawer` / `rightPanel` from AppShell deferred to a future spec after labeler-spa + prep-for-pgdp migrate. |

### Plan-amendment implications

The OQ decisions add new tasks and amend existing ones. Plan file `docs/plans/2026-05-24-pdomain-ui-design-handoff.md` is updated separately and re-synced; new GH issues file under milestone #16.

**New tasks introduced:**
- Extend pdomain-ui Button (OQ-2)
- Extend pdomain-ui Input (OQ-3)
- Extend pdomain-ui Badge with `tone` (OQ-4)
- Port AppHeader (OQ-5)
- Port JobsPill (OQ-5)
- Port JobsDrawer (OQ-5)
- Port JobRow (OQ-5)
- Port ProjectsDrawer molecule (OQ-12)
- Port SettingsNav template (OQ-10)
- Deprecate AppShell `drawer` / `rightPanel` props (JSDoc + tests) (OQ-12)

**Existing tasks amended:**
- **Task 2 (#335) Port Icon** — also adds `<Icon name>` dispatcher shim (OQ-1)
- **Task 5 (#338) Port PageHeader** — verdict confirmed: port
- **Task 6 (#339) Reconcile token diff** — close as no-op (OQ-6 directs no aliases)
- **Task 13 (#346) ProjectsLandingTemplate** — handle merged empty state via `state` discriminated union (OQ-11)
