---
kind: spec
status: implemented
owner: CT
created: 2026-05-28
last_verified: 2026-07-13
promotes_to: docs/architecture/theme-and-component-quality.md
disposition: promote-then-retire
---

# pdomain-ui Component Audit — Remediation Design

- **Date:** 2026-05-28
- **Status:** Draft for review
- **Scope:** All `pdomain-ui` frontend components (`src/`) + theme layer (`theme/`)
- **Driver:** Full-surface component review for missing/incorrect CSS, stub
  functionality, accessibility, and API consistency.

## How this audit was produced

Ten read-only review agents ran in parallel, each over a bounded subset of the
~490-file source surface (icons/hooks/canvas; primitives in three groups; shell;
stores/templates/worklist; and the stages split across four agents incl.
PageWorkbench alone). Each agent read components alongside their `*.stories.tsx`
and judged CSS against `theme/tokens.css` + `theme/primitives.css`. ~190
findings resulted.

## Key facts that shape the plan

1. **`theme/primitives.css` and `theme/tokens.css` are hand-authored
   authoritative runtime sources.** A sync script copies them *to*
   `docs/design-system/` (one-way), and a `theme-check` CI gate fails if that
   mirror is stale. **Any CSS edit in this plan must be followed by re-running
   the sync step.** There is no external design handoff that backfills CSS.
2. **The token set is intentionally small (~25 tokens).** A prior design-handoff
   audit confirmed `tokens.css` matches the original bundle exactly. Therefore
   every reference to `--space-*`, `--radius-*`, `--brand`, `--info`,
   `--surface`, etc. is a reference to a token that **does not exist** and
   silently fails (or falls back to a literal).
3. **Konva canvas layers cannot resolve CSS custom properties at paint time.**
   Passing `var(--x)` to a Konva prop renders the literal fallback, ignoring
   theme. Canvas color fixes need resolved-token values, not `var()` strings.

## Decisions (agreed with owner)

- **Token policy — Hybrid.** Add the structural scales that are clearly missing
  (spacing, radius, typography sizes, transitions, shadows, `--book-font`) to
  `tokens.css`. Remap one-off *color* references to existing semantic tokens
  rather than inventing color tokens.
- **Scope — All findings.** Every finding (high → low) is planned; lows
  included.
- **Structure — By theme / workstream.** Seven workstreams plus a foundational
  Workstream 0. This maps cleanly onto parallel `pdomain-ui` agent dispatch.

## Workstream dependency order

```
WS0 (tokens + sync gate)  ──►  WS1 (CSS backing)  ──►  WS2 (token refs)
                          └──►  WS3 (literals→tokens) ──┘
WS4, WS5, WS6, WS7  (independent; can run after WS0 lands the token additions)
```

WS0 must land first because WS1/WS2/WS3 consume the new tokens. WS4–WS7 are
largely independent of the CSS work and can run in parallel once WS0's token
additions exist.

---

## Workstream 0 — Design-system foundation

Add the missing token scales and the canonical color-remap table, then run the
sync gate. This unblocks every CSS workstream.

### 0.1 New token scales to add to `theme/tokens.css`

| Token group | Add | Rationale (referenced-but-missing) |
|---|---|---|
| Spacing | `--space-1`…`--space-8` (e.g. 4/6/8/12/16/20/24/32px) + `--space-4-5` (18px) | `PWHeader`, `LabelerCanvas`, `LayerToggle`, primitives.css literals |
| Radius | `--radius-sm/md/lg/pill` | `LabelerCanvas`, `LayerToggle`, primitives.css literals |
| Typography | `--text-xs/sm/md/lg` (font sizes) | `Icons`/`AppShell`/`Banner` stories, inline 10–13px literals |
| Transitions | `--transition-fast/base` | accordion/animation rules currently absent |
| Shadows | `--shadow-sm`, `--shadow-dock`, `--shadow-overlay`, `--shadow-card` (theme-aware per `[data-theme]`) | replace scattered `rgba(15,23,42,…)` box-shadows |
| Font | `--book-font` (`'Georgia', serif`) | WordCard/WordRow/LineBlockCard/LineBlockRow |

### 0.2 Canonical color-remap table (used by WS1/WS2/WS3)

| Bad reference | Replace with |
|---|---|
| `--brand`, `--color-brand`, `--accent-primary` | `--accent` |
| `--info`, `--accent-info` | `--ocr` |
| `--surface` | `--bg-surface` |
| `--surface-2`, `--bg-surface-2` | `--bg-raised` |
| `--surface-3` | `--bg-sunk` |
| `--bg`, `--bg-base` | `--bg-page` |
| `--border` | `--border-1` |
| `--color-muted` | `--border-2` |
| `--color-success`, `--clean` | `--exact` |
| `--color-text-secondary`, `--color-text-muted`, `--fg-base` | `--ink-3` / `--ink-2` (per contrast need) |
| `--accent-warning` | `--fuzzy` |
| `--font-mono` | `--mono-font` |

### 0.3 Housekeeping / verification

- Remove duplicated `--overlay-scrim` comment in `tokens.css:83-84`.
- **Verify the sync-script path.** One agent (searching `src/theme/`) reported
  the CSS files "missing"; they live at `theme/` (repo root). Confirm
  `sync-design-system.mjs` reads/writes the correct `theme/` path and not
  `src/theme/`, and that the `theme-check` gate points at `theme/`.

**Acceptance:** new tokens defined for both `[data-theme]` variants; `tokens.css`
↔ `docs/design-system` sync re-run; `theme-check` CI green.

---

## Workstream 1 — Components with no CSS backing

Components emit BEM class names (or wrong class names) that have **zero matching
rule** in `primitives.css`, so they render unstyled or wrongly styled. After
adding rules, re-run the sync gate.

### 1A — Primitives

| Location | Sev | Issue | Fix |
|---|---|---|---|
| `Thumbnail.tsx:71` | high | `.thumbnail*` (image-wrap, button, overlay, corner, footer, status) have no rules | Add full `.thumbnail` block (layout, density data-attrs, corner overlays, selected state) |
| `ThumbGrid.tsx:47,55` | high | `.thumb-grid`/`--empty`/`__cell` absent; `--thumb-size` set but unused | Add grid rule consuming `--thumb-size` |
| `ThumbSizeToggle.tsx:65` | high | `.thumb-size-toggle` absent | Add sizing/passthrough rule |
| `AttributesPanel.tsx:151` + `.ap*` | high | `btn--ghost btn--sm` (wrong BEM) + all `.ap*` classes unstyled | Use `btn ghost sm`; add `.ap*` rules |
| `SummaryCell.tsx`, `SummaryStrip.tsx` | high | `.summary-cell*`, `.summary-strip`, tone modifiers absent | Add blocks incl. `--clean/--dirty/--warn` |
| `TableHeader.tsx`, `TableFooter.tsx` | high | `.table-header*`/`.table-footer*` absent | Add blocks incl. sortable/active/sort-icon |
| `CheckIcon.tsx` | med | `.check-icon*` + `__spin` absent (running spin no-op) | Add state rules; reuse `pip-spin` keyframe |
| `ThumbFlagBadge.tsx` | med | `.thumb-flag-badge` absent (overlay anchoring broken) | Add `position:relative; inline-block` block |
| `ToggleBadge.tsx` | med | `.toggle-badge` + `.toggle--badge` absent (compact mode no-op) | Add compact rules |
| `KeyCap.tsx:15,21-27` | high | Uses non-existent Tailwind utility classes; inline separator | Add `.key-cap-wrapper` + `.key__sep` rules |
| `ToggleGroup.tsx:17` | high | `.seg-item` has no rule; Radix sets `data-state="on"` not `.on` | Add `.seg-item` + `.seg-item[data-state='on']` |
| `Accordion.tsx:18,26,27` + `primitives.css:583` | high | Chevron uses stale `.open` (Radix uses `data-state`); `.acc-trigger` unstyled; body animation absent | Use `.acc[data-state='open']`; add `.acc-trigger`; add open/close keyframes using `--radix-accordion-content-height` |
| `StatTile` (`primitives.css:1547`) | med | `--clean` tone has no tint | Add `.stat-tile--clean .stat-tile__value { color: var(--exact) }` |
| `QualityBanner` (`primitives.css:897`) | med | Hardcoded `margin:20px 32px 0` leaks layout into primitive | Remove margin; let callers space it |
| `AlertDialog.tsx:63` | med | Cancel button has no ghost/danger variant — destructive dialogs look identical | Apply `btn ghost` to Cancel mapping |
| `Drawer.tsx`, `RightPanel.tsx` | low | No `min-width:0`; overflow grid cell when column collapses | Add `min-width:0`; let grid control width |
| `BboxEditor.tsx:289-294` | low | Scope `Segmented` label can overflow narrow panel | Add ellipsis truncation on `segmented__item` |

### 1B — Stages (entire modules unstyled)

| Location | Sev | Issue | Fix |
|---|---|---|---|
| Crop: `.bbox-editor`, `.crop-card`, `.crop-banner__progress-*`, `.crop-overview__*` | high | No CSS anywhere | Add `stages/Crop` rules (or `theme/stages.css`) |
| Grayscale: `.gray-thumb`, `.mode-card`, `.adv-params-*`, `.pv__*`, `.grayscale-overview__*` | high | No CSS anywhere | Add Grayscale rules |
| HyphenJoin: `.hyphen-*`, `.hj-*` (mismatch table, step-settings, overview, notes-card) | high | No CSS anywhere | Add HyphenJoin rules |
| Scannos: `.scanno-token*`, `.inline-mark-popover__*`, `.rule-detail__*`, `.scanno-nav-group__*` | high | No CSS anywhere | Add Scannos rules |
| PageWorkbench: `.stage-controls-panel*`, `.block-type-picker-panel`, `.hierarchy-tree-panel`, `.tree-row`, `.type-grid`, `.text-review-pane`, `.page-attributes-bar`, `.ocr-text-panel`, `.pw-header`, `.attr-editor-popover` | high | No CSS anywhere | Add PageWorkbench rules |
| `Source/BulkBar.tsx:31` | high | Uses `.bulk-bar*`; only `.bulk-action-bar*` exists | Rename to `.bulk-action-bar*` (+ modifier) |
| `Upload/ModalC.tsx:144` | high | `.dialog--sheet-right` undefined → renders centered, not a right sheet | Add `.dialog--sheet-right` modifier |
| `Projects/ProjectsAttributesPanel.tsx:160` | high | `btn--ghost btn--sm` wrong BEM | Use `btn ghost sm` |
| `JobRow.tsx:106` (shell) | high | `pgd-shimmer` animation referenced, keyframe missing | Add `@keyframes pgd-shimmer` |

**Acceptance:** every emitted class name has a rule; visual check in Storybook
for each listed component; sync gate re-run; `theme-check` green.

---

## Workstream 2 — References to nonexistent tokens

Apply the WS0 remap table + new scales across components and **stories** (broken
story tokens mask visual review, so they count).

| Location | Sev | Bad token → fix |
|---|---|---|
| `PageImageCanvas.tsx:263` | med | `--color-text-muted`/`#888` → `--ink-3` |
| `CropCard.tsx:77` | high | `--color-brand` → `--accent` |
| `HyphenUndecided.tsx:108` | high | `--bg-surface-2` → `--bg-raised` |
| `ProjectSettingsTemplate.tsx:107` | med | `--font-mono` → `--mono-font` |
| `IllustOverlay.tsx:45-47` | high | `--info` → `--ocr` (resolve for Konva, see WS3) |
| `LabelerCanvas.tsx:81-98,253` | high | `--brand`/`--clean`/`--surface` → `--accent`/`--exact`/`--bg-surface` (resolve for Konva) |
| `PWHeader.tsx:114-209` | med | `--space-1..8` → WS0 spacing scale |
| `LabelerCanvas.tsx:283-289`, `LayerToggle.tsx:33-36` | med | `--space-*`, `--surface-overlay`, `--text-on-dark`, `--radius-*` → WS0 scales / `--bg-raised`/`--overlay-scrim`/`--ink-1` |
| `PipelineMini.css:15-16` | low | `--color-muted/success/brand` → `--border-2`/`--exact`/`--ocr` (drop the phantom primaries) |
| Stories: `Icons.stories.tsx:97`, `PageImageCanvas.stories.tsx:72`, `Banner.stories.tsx:113,139`, `AppShell.stories.tsx:44,68,90,135`, `Thumbnail.stories.tsx` (`--accent-warning/info/primary`, `--bg-base`), `ScannoToken.stories.tsx:44` (`--fg-base`), `BulkBar.stories.tsx:66-67` (`--color-text-secondary`) | low | Remap per WS0 table; add `--text-*` where font-size tokens referenced |

**Acceptance:** grep for `var(--` across `src/` and `theme/` yields no token not
defined in `tokens.css`; stories render with intended colors.

---

## Workstream 3 — Hardcoded literals → tokens

Includes the Konva special-case (resolve token values; do not pass `var()`).

### 3A — Konva canvas (resolve tokens at render)

| Location | Sev | Issue | Fix |
|---|---|---|---|
| `PageImageCanvas.tsx:439` | high | Drag stroke `#5d9fdf` hardcoded | Resolve `--accent` via `getComputedStyle`, or `dragStrokeColor` prop |
| `BBoxLayer.tsx:42-43` | high | `--layer-word-*` (nonexistent) + hardcoded blue fallbacks | Resolve `--word` token; define layer tokens if needed |
| `MarqueeSelectLayer.tsx:45-46` | high | `rgba(37,99,235,.2)`/`#1d4ed8` hardcoded | Resolve `--accent` |
| `WordBboxOverlay.tsx:47-52` | high | `rgba(239,68,68)`/`rgba(34,197,94)` hardcoded | Resolve tokens (selected/unselected) via palette map |
| `IllustOverlay.tsx:45-47`, `LabelerCanvas.tsx:81-98,253` | high | `var()` strings ignored by Konva | Resolve token values at module/mount init |

### 3B — Inline-styled components → CSS classes

| Location | Sev | Issue | Fix |
|---|---|---|---|
| `StepDots.tsx:58-92` | high | Entirely inline (sizes/weights) | Extract `.step-dot*`/`.step-label` to primitives.css |
| `CropOverview.tsx:94-296` | high | All layout/typography inline literals | Extract `.crop-overview__*` |
| `ShortcutsCheatsheet.tsx:67-109` | med | Inline px literals throughout dialog | Extract `.shortcuts-*` block |
| `Validation/CheckRow.tsx:88-100`, `DownloadFooter.tsx:74-155`, `PanelToolbar.tsx:60-83` | med/low | Inline-styled; raw `12.5`/`11.5` font sizes | Extract `.check-row`/`.download-footer`/`.panel-toolbar`; use `--text-*` |
| `Projects/ProjectsEmpty.tsx:57-89` | med | Inline + `rgba(0,0,0,.04)` shadow | Extract class; use `--shadow-sm` |
| `PipelineTemplate.tsx:149,157`, `ProjectsLandingTemplate.tsx:181,189,878` | high | `rgba(255,255,255,…)`/`rgba(0,0,0,…)` in CoverPlaceholder (duplicated) | Tokenize via `--shadow-*`/new cover tokens; **dedupe CoverPlaceholder into one shared component** (also WS7) |
| `PaperRender.tsx:29` | med | `padding:18` literal | Use `--space-4-5` |
| `WordCard.tsx:70`, `WordRow.tsx:52`, `LineBlockCard.tsx:96`, `LineBlockRow.tsx:89` | med | `fontFamily:'Georgia, serif'` ×4 | Use `--book-font` (WS0) |
| `KeyCap.tsx:21-27` | high | Inline separator style | `.key__sep` (also WS1) |
| `ModalB.tsx:141-156` | low | Inline SVG with `width/height=32` literals | Use shared `Icon` component |

### 3C — Box-shadow / color literals in `primitives.css`

| Location | Sev | Issue | Fix |
|---|---|---|---|
| `primitives.css:840,1511,1766,1767,1879` | med | `rgba(15,23,42,…)` shadows; `.toggle__thumb: white` (invisible in light theme) | Replace shadows with `--shadow-sm/dock`; `--toggle-thumb` or `--bg-surface` for thumb |
| `JobsDrawer.tsx:99,223`, `JobsPill.tsx:86` | med | Inline `rgba(15,23,42,…)` shadows (not theme-aware) | Use `--shadow-overlay/card` |

**Acceptance:** no color/size literals in component styles except where a token
genuinely doesn't apply; Konva layers honor theme switch; sync gate re-run.

---

## Workstream 4 — Wrong token mappings & semantic bugs

| Location | Sev | Issue | Fix |
|---|---|---|---|
| `StatusPip.tsx:18-19` | high | `ocr`→`--fuzzy` (amber) and `gt`→`--accent` (orange) — both wrong | `ocr`→`--ocr`, `gt`→`--gt` |
| `createUIPrefsStore.ts:280-284` | med | `getAccentColor` returns `{fg:accentColor, bg:accentInkColor}` — inverted vs JSDoc | Swap: `fg:accentInkColor`, `bg:accentColor`; update call sites |
| `LabelerCanvas.tsx:81-98` | high | `--brand`/`--clean` map to nonexistent tokens | Map to `--accent`/`--exact` (see WS2/WS3) |
| `HJStatusPill.tsx:29` | low | Comment says "purple/ocr" but `ocr` is blue | Fix comment or switch tone to `gt` if purple intended |

**Acceptance:** pip/accent colors visually correct in both themes; unit test for
`getAccentColor` fg/bg.

---

## Workstream 5 — Stub / unwired functionality

Functional defects (not cosmetic). Highest user-visible impact after WS1.

| Location | Sev | Issue | Fix |
|---|---|---|---|
| `UIPrefsApplicator.tsx` | high | Color overrides persisted but never applied as CSS vars → **entire AppearancePanel color UI is dead** | Add effects writing `setProperty` for all 9 color tokens |
| `PageImageCanvas.tsx:129,168` | high | `pan` and `hover` state never updated; `SlotRenderProps` promise behavior that never fires | Implement, or remove from the public render-prop API until implemented |
| `ColorField.tsx:77` | high | `ref={null}` discards forwarded ref | Forward ref to the `<input type="color">` |
| `ProjectsLandingTemplate.tsx:250-254` | high | `selectedId`-change tab reset never calls `setTab(defaultTab)` | Call `setTab`; update ref unconditionally |
| `ProjectsLandingTemplate.tsx:441-448,939,971,986` | high/med | Open-project + paste-URL/import/style-guide buttons have no `onClick`/props | Add `onOpenProject`/`onPasteUrl`/`onImportArchive`/`onOpenStyleGuide` |
| `HyphenPageWorkbench.tsx:130-145` | high | `HJDecisionCard` rendered without `onNext`/`onPrev` → J/K nav inert | Thread + wire handlers |
| `CandidateDetail.tsx:132` | high | "Show all N" button is a stub (no state/handler) | Add `showAll` state + toggle |
| `InlineMarkPopover.tsx:87` | high | `PopoverAnchor` detached/zero-size → popover floats at origin | Anchor to trigger via `asChild`/ref |
| `SplitHandle.tsx:157` / `ArtifactViewer.tsx:157` | high | Passes natural `pageWidth` not rendered CSS width → DOM separator mispositioned at runtime scale | Pass measured stage CSS width |
| `RotateHandle.tsx:28,34,86` | med | Handle placed off-canvas (`-24` y, clipped); `dragBoundFunc` no-op | Place inside stage; clamp bounds |
| `SourcePageWorkbench.tsx:123-131,183-184` | high | Dead identical rotation branch; rotation `Segmented` has no `onChange` | Collapse branch; add `onRotationChange` |
| `SourcePageWorkbench.tsx:96-98` | med | `beforeImageUrl` accepted but unused (eslint-disabled) | Wire split-view or remove from API |
| `BaseJobConfigDialog.tsx:55` | high | `outputDir` not reset on reopen | Reset on `open` change |
| `JobsDrawer.tsx:428` / `JobRow.tsx:36` | med | Per-row hover never wired → Pause/Resume/Discard permanently hidden | Add `hoveredId` + mouse handlers |
| `JobsDrawer.tsx:190` | med | Multi-running collapsed state shows empty spacer | Aggregate progress / "N jobs" label |
| `JobsPill.tsx:258` | low | "View all jobs" footer has no handler | Add `onViewAll` prop |
| `AppShell.tsx:170` | med | Rail grid fallback `0px` contradicts `64px` doc → rail collapses | Use `var(--shell-rail-w, 64px)` |
| `AppHeader.tsx:54-60` | med | Ships placeholder defaults (`pgdp-prep`/`jsmith`/`JS`) | Remove defaults; make required/empty |
| `AppearancePanel.tsx:196-202` | low | Color input shows `#000000` when value is a CSS var | Disabled/empty state for var values |
| `SuiteSiblingsProvider.tsx` / `LauncherSlot.tsx` | low | Fetch errors swallowed; no error state | Add `error` to context; surface in slot |
| `createApiUIPrefsConfig.ts:54-73` | low | Persist errors swallowed; `onPersistError` never called | Call `onPersistError` in catch |
| `useShortcuts.ts:112-121` | med | Update effect calls `register` without `unregister` → stale bindings | Unregister before re-register |
| `Segmented.tsx:65` | low | Empty `options` yields no active item, no guard | Guard empty/loading |
| `CropCard.tsx:173,198` | high | `flagChipsNode !== null` always true (renders element even when empty) | Guard on `page.flags.length > 0` |
| `StageControlsLeft.tsx:39` | med | `backend` prop discarded (no CPU-fallback wiring) | Wire fallback or drop prop |
| `BboxEditor.tsx:15-16` | med | Drag handles deferred with broken `#TODO` placeholder | File real GH issue; remove placeholder |
| `GrayThumb.tsx:76-89` | med | `interactive=true` + `onClick=undefined` renders dead div | Require `onClick` when interactive |
| `CropBanner.tsx` | low | No `error` state for pipeline failure | Add `error` state (danger Banner) |
| `HyphenStepSettings.tsx:141-160` | med | Number inputs forward `NaN`/`0` with no validation | Add NaN/min guards |
| `InsertDialog.tsx:163-173` | med | Never calls `onOpenChange(false)` after insert | Close on submit or document |
| `Upload/ModalC.tsx:80-103` | med | Future steps clickable (no guard) | `aria-disabled` + suppress click (also WS6) |
| `Source/ThumbCard.tsx:68-80` | med | Card click + checkbox both fire `onSelect` (double-fire) | Single handler path |
| `QualityFlags/PageThumb.tsx:98` | low | Empty `imageUrl=""` → broken `<img>` | Placeholder/skeleton state |
| `LabelerCanvas.tsx:62-169` | med | `onBlocksChange` declared but never called (M2 rendering-only) | JSDoc no-op warning or remove prop |
| `useLongJob.ts:4-13,110-112` | med/low | SSE documented but only polling; `cancel()` sets `cancelled` even on reject | Implement/doc SSE; `.catch`→`error` |
| `VirtualizedList.tsx` | low | No empty-state slot | Add `emptySlot` prop |
| `ProjectsLandingTemplate.tsx:257` | low | Falls back to `projects[0]` instead of empty state | Render "select a project" prompt |
| `AttributesPanel.tsx:106-146` | med | Hardcoded fixture field strings leak into public API | Extend model or expose as slots |

**Acceptance:** each item has a behavioral test or Storybook interaction proving
the wired behavior; AppearancePanel color changes visibly affect the page.

---

## Workstream 6 — Accessibility

| Location | Sev | Issue | Fix |
|---|---|---|---|
| `ConfigureTabs.tsx:38,44` | high | `tablist` with no arrow-key nav / roving tabIndex | Add Arrow/Home/End handler; `tabIndex={active?0:-1}` |
| `SettingsModal.tsx:100-103` | high | `role=tab` without `tablist`/`tabpanel`/`aria-controls` | Complete the tab pattern |
| `HierarchyTreePanel.tsx:121-159` | high | `tree` children lack `role=group`; no Up/Down focus move | Wrap groups; add arrow nav |
| `TextReviewPane.tsx:76,85` | high | Hardcoded duplicate `id`/`aria-controls` | Use `React.useId()` |
| `VirtualizedList.tsx:95-119` | high | `listbox` without `aria-activedescendant`; every row `tabIndex=0` | Add activedescendant; roving focus |
| `TableHeader.tsx:77-79` | high/med | Sortable cell missing `aria-sort`; no Enter/Space handler | Add `aria-sort`; `onKeyDown` |
| `AppShell.tsx:182-235` | high | Zone divs have no landmark roles | `<main>`/`<nav>`/`<aside>` or roles |
| `PageImageCanvas.tsx:82-99` | med | `tabIndex=0`/`role=img` but no keyboard handler | Add key handlers or `role=region`+label |
| `QualityFlags/PageRow.tsx:104` | med | `role=row` without grid/rowgroup (invalid) | `role=listitem` in `role=list`, or real grid |
| `HJDecisionCard.tsx:151` | med | `role=application` overreach (mutes AT) | Remove; keep tabIndex+onKeyDown |
| `TreeRow.tsx:92-101` | med | Nested focusable button inside treeitem (2 tab stops) | Inner button `tabIndex=-1`; drive via row keydown |
| `WordCard.tsx:33`, `WordRow.tsx:32` | med | `role=button` with no accessible name | `aria-label={'Edit word: '+word.text}` |
| `Field.tsx:42` | med | `role=alert` announces on every render incl. mount | `role=status` (rely on aria-describedby/invalid) |
| `ViewToggle.tsx:37-59` | med | `group`+`aria-pressed`, no arrow nav | Add arrow nav or `radiogroup`/`radio` |
| `Tooltip.tsx:14-21` | med | No `Portal` (clips in scroll/overflow parents) | Wrap content in `TooltipPrimitive.Portal` |
| `KanbanColumn.tsx:47-50` | med | Virtual spacer breaks `listbox`→`option` parent-child | Move role down or `aria-owns` |
| `KanbanBoard.tsx:104` | med | `onDragOver` announcement returns `''` | Return meaningful target string |
| `QualityBanner.tsx:58-113`, `Progress.tsx:20-35`, `PageAttributesBar.tsx:85` | med | Missing `aria-live`/`role=status`; progress no label | Add live region / `aria-label` |
| `Banner.tsx:65` | med | `<section>` makes every banner a landmark | Use `<div>` + explicit `role` |
| `StatusPip.tsx:40`, `JobStatusPip.tsx:40`, `RowFlagBadge.tsx:17` | med | Decorative dots not `aria-hidden` | Add `aria-hidden` to dots |
| `Icon.tsx:163`, `bespoke.tsx` (all), `SettingsSlot.tsx:40`, `ShortcutsHelpButton.tsx:42` | med | Icons lack default `aria-hidden` | Default `aria-hidden`, optional `aria-label` |
| `HyphenMismatch.tsx:55-79` | med | Decisions blob as one string | Structured spans / `<dl>` |
| `HyphenUndecided.tsx:99`, `ProjectsDrawer.tsx:211` | med | `aria-pressed` for selection (wrong) | `aria-current`/`aria-selected` + `role` |
| `StageStrip.tsx:176`, `TabsBand.tsx:83`, `ProjectsLandingTemplate.tsx:563` | med | `role=list` with bare buttons; tabs missing `aria-controls`/label | Add `listitem`/`aria-label`/`aria-controls` |
| `ProjectsAttributesPanel.tsx:126` | med | Accordion header no `id`/`aria-labelledby` | Wire ids or `<button>`+`hidden` |
| `AdvancedParams.tsx:88-138`, `BulkBar.tsx:39`, `ModalB.tsx:104`, `SwapRow.tsx:90`, `GrayscaleOverview.tsx:64`, `CropOverview.tsx:323`, `CropCard.tsx:167` | med/low | Range inputs / action groups / sections / status dots missing `aria-label` (or raw enum exposed) | Add descriptive labels; map enums |
| `ModeCard.tsx:57-75` | med | `role=radio` buttons without arrow-key nav | Implement radiogroup nav or native radios |
| `CheckRow.tsx:85-138` | med | `aria-expanded` set even when not expandable | Conditionally spread when `canToggle` |
| `InlineMarkPopover.tsx:119-141` | low | Buttons not `disabled` when callback absent | Disable when handler missing |
| `JobsDrawer.tsx:229-237` | med | Resize handle has label but no role/keyboard | `role=separator` or real slider |
| `BulkActionBar.tsx:101` | low | Keyboard-hint prose unannotated | `role=note`/`aria-label` |
| `CropToolbar.tsx:165` | low | testid changes per density (fragile e2e) | Stable testid |
| `TypeGrid.tsx:35` | low | Hardcoded 3-column arrow nav vs `auto-fill` grid | Compute column count |

**Acceptance:** keyboard walkthrough of tabs/tree/lists/dialogs; axe (or
jsx-a11y) passes on the touched components.

---

## Workstream 7 — API / prop consistency

| Location | Sev | Issue | Fix |
|---|---|---|---|
| Crop: `CropFlagKind` in `CropCard`/`CropToolbar`/`CropOverview` | high | Declared ×3; barrel exports only one → structural drift | Single shared `types.ts` |
| Grayscale: `GrayscaleMode` in `AutoDetectBanner`/`ModeCard` | high | Declared ×2 | Single declaration |
| `src/index.ts` | med | `useViewport`, `StepDots`, `JobStatusPip` not re-exported | Add to root barrel |
| `Popover.tsx` | low | `PopoverClose` not exported | Export it |
| `Dialog.tsx`, `AlertDialog.tsx`, `RuleDetail.tsx` | med | No `data-testid` prop | Add + forward |
| `Input.tsx:51` | med | `className` lands on inner input (composite mode) | Apply to outer wrapper |
| `Accordion.tsx:26` | low | Header `className` not forwarded | Forward |
| `PageSplitView.tsx:9,11` | med | Hardcoded `1fr 1fr`, no ratio prop | Add `canvasFlex`/`editorFlex` |
| `EditModeSelector.tsx:9` vs `ArtifactViewer.tsx:40` | med | `EditMode` lacks `'words'` (mismatch with `OverlayMode`) | Add `'words'` or document |
| `KanbanBoard.tsx:73` | med | `fromColumnId: TColumnId | null` never null | Drop `| null` or guard |
| `KanbanColumn.tsx` | low | `DEFAULT_ROW_HEIGHT` can diverge from `--kanban-chip-height` | Single source of truth |
| `ThumbGrid.tsx:56` | low | `key={i}` index keys | `keyExtractor` |
| `PageChip` (primitives vs kanban) | low | Two `PageChip.tsx`; type alias collision | Rename kanban to `KanbanChip` |
| `StageToolbar.tsx:41` | low | Empty toolbar when no slots (invalid ARIA) | Return null / require a slot |
| `ProjectSettingsTemplate.tsx:70-79` | low | Inline `NAV_ITEMS` duplicates `PROJECT_SETTINGS_GROUPS` | Use `<SettingsNav>` |
| `useWorklistSort.ts:33` | low | `[a,b]: any` cast unnecessary | Remove cast |
| `HyphenAutoJoined.tsx:183` | low | `onValidate` via unsafe cast | Destructure directly |
| `OcrTextPanel.tsx:118`, `SplitOverlay.tsx:44`, `RotateHandle.tsx:46`, `HierarchyTreePanel.tsx:61` | low | Unsafe `as` cast; `|| 1` instead of `?? 1`; `children!` | Narrow explicitly; use `??`; `?? []` |
| `useShortcuts.ts:47` | low | Deprecated `navigator.platform` | Prefer `userAgentData?.platform` |
| `canvas/index.ts` | low | Context type/hook not exported (if public) | Export or mark internal |
| `shell/index.ts` | low | `SubShells.test.tsx` orphan (no component) | Create or remove |
| `ProjectsEmpty.tsx` | low | No `displayName` | Add |
| `NavGroup.tsx:67`, `CropStepSettings.tsx:95` | low | Hardcoded testid string; missing testid fallback | Use constant; add fallback |
| `ToggleBadge.tsx:37` | low | Over-cautious `disabled` conditional spread | Pass `disabled` directly |
| `tokens.css:83-84` | low | Duplicate comment (also WS0) | Remove |
| Stories: `Select` (missing Disabled/Error/PreSelected), `HJDecisionCard` (no read-only), `HyphenPageWorkbench` (no empty-cases) | low | Coverage gaps | Add stories |

**Acceptance:** `tsc`/`basedpyright`-equivalent TS check clean; barrel exports
complete; knip reports no new unused; tests added for new props.

---

## Cross-cutting verification (every workstream)

1. After any `theme/*.css` edit, **re-run the design-system sync** so
   `docs/design-system/` mirrors; confirm `theme-check` CI is green.
2. `make ci` (vitest + lint + typecheck + theme-check) green.
3. Storybook visual spot-check for components touched in WS1/WS2/WS3.
4. New behavioral tests for WS5; jsx-a11y/axe for WS6.

## Out of scope / open questions

- **Konva theming approach:** resolve-once-at-mount vs. a re-resolve on theme
  toggle. WS3 assumes resolve-at-mount; if live theme switching of the canvas is
  required, a `useEffect` re-resolve on `[data-theme]` change is needed. *Decide
  before WS3.*
- **New color tokens:** the hybrid policy deliberately avoids new color tokens.
  If design wants brand/info as first-class semantic tokens (not aliases to
  accent/ocr), that's a separate token-set RFC.
- **CoverPlaceholder dedupe** (WS3/WS7) is a small refactor; confirm it's wanted
  vs. leaving two copies.
- **`AppHeader` defaults removal** (WS5) is a breaking change for any consumer
  relying on them — coordinate with downstream SPAs.

## Suggested execution mapping

One `pdomain-ui` agent (worktree-isolated) per workstream, dispatched after WS0
merges. WS1/WS2/WS3 touch `theme/*.css` so should be serialized or carefully
coordinated to avoid sync-gate churn; WS4–WS7 are largely file-local and
parallel-safe.

## Adversarial Review

**Stage / sources:** Post-implementation review against the audit plan,
workstream-labeled code/tests, May 28 history, and current source. **Accepted
findings / residual risk:** most remediation shipped, but the claimed all-findings
scope materially overstates conformance. CropCard still uses an always-true
empty-overlay guard, PipelineTemplate retains inline RGBA values, and
SourcePageWorkbench retains an unused `beforeImageUrl`. Promote durable token,
canvas, accessibility, and test policy to
`docs/architecture/theme-and-component-quality.md`; keep surviving defects and
the live-canvas theme question as explicit residual intent.
