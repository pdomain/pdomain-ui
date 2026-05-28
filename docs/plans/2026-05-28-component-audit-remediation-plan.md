# pdomain-ui Component Audit — Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` to implement this plan. Each
> **Agent Lane** below is a self-contained, worktree-isolated dispatch unit.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the ~190 findings from the 2026-05-28 component audit (missing CSS,
nonexistent token refs, hardcoded literals, wrong mappings, stub functionality,
a11y gaps, API inconsistency) across `pdomain-ui`.

**Architecture:** One sequential **Foundation** lane lands the new design tokens
and root-barrel exports everything else depends on. Then **9 lanes run in
parallel**, each owning a *disjoint set of files* so there are zero write
collisions: one lane owns `theme/primitives.css` (all CSS rules), the other
eight each own one area's `.tsx` tree (matching the original review batches, so
each agent's file scope is coherent and cache-friendly). A class-name registry
(§Coordination) lets the CSS lane and the `.tsx` lanes agree on class names
without touching each other's files.

**Tech Stack:** React 18 + TypeScript + Vite (library mode), Radix UI, Konva
(`react-konva`), Zustand store factories, Vitest + Testing Library, Storybook,
hand-authored `theme/tokens.css` + `theme/primitives.css` with a one-way sync to
`docs/design-system/` gated by `theme-check` CI.

---

## Authoritative inputs

- **Findings checklist:** `docs/specs/2026-05-28-component-audit-remediation-design.md`
  (same repo). Every lane below references that spec's workstream rows by
  `file:line`. The spec is the per-finding source of truth; this plan is the
  execution structure. **Implementing agents read both.**
- This plan deliberately groups by *file ownership* (for parallel safety + cache
  coherence) rather than re-transcribing all 190 rows. Where a fix is unique,
  its concrete code is inline in §Patterns or the lane task.

## Note on format (intentional deviation)

Standard writing-plans granularity is one micro-step with full code per change.
With ~190 largely mechanical findings, and the owner's explicit requirement that
tasks be *parallelizable across cheap subagents with shared cached context*, this
plan instead defines **cache-coherent lanes**. Each lane task names exact files,
the exact findings (via spec `file:line`), the concrete pattern to apply (see
§Patterns), the verification command, and the commit. Behavioral fixes (WS5/6/7)
are TDD: write the failing Vitest test first, then fix.

---

## File-ownership map (guarantees zero write collisions)

| Files (sole writer) | Lane |
|---|---|
| `theme/tokens.css` | **L0 Foundation** |
| `src/index.ts` (root barrel) | **L0 Foundation** |
| `theme/primitives.css` | **L-CSS** |
| `src/primitives/**/*.tsx` (+ stories/tests) | **L-PRIM** |
| `src/icons/*`, `src/hooks/*`, `src/canvas/**` | **L-CANVAS** |
| `src/shell/**` | **L-SHELL** |
| `src/stores/*`, `src/templates/*`, `src/worklist/*` | **L-STW** |
| `src/stages/Crop/*`, `src/stages/Grayscale/*` | **L-CG** |
| `src/stages/HyphenJoin/*`, `src/stages/Scannos/*` | **L-HS** |
| `src/stages/{Source,PageReorder,Upload,Projects,Validation,QualityFlags}/*` | **L-SRC** |
| `src/stages/PageWorkbench/*` | **L-PW** |

L-CSS **reads** many component files but **writes only** `theme/primitives.css`.
The `.tsx` lanes never touch `primitives.css` or `tokens.css`. Therefore every
file has exactly one writer and all lanes after L0 are merge-safe.

## Dependency / scheduling order

```
L0 Foundation  (sequential, FIRST — blocks all)
      │
      ├──────────────► L-CSS    ┐
      ├──────────────► L-PRIM   │
      ├──────────────► L-CANVAS │  all 9 run in PARALLEL
      ├──────────────► L-SHELL  │  (disjoint files)
      ├──────────────► L-STW    │
      ├──────────────► L-CG     │
      ├──────────────► L-HS     │
      ├──────────────► L-SRC    │
      └──────────────► L-PW     ┘
      │
      ▼
Integration: merge all (worktree→local-merge→push), run full `make ci`,
re-run CSS sync gate, Storybook visual pass.
```

L-CSS is the long pole (single file, ~30 rule blocks). It is independent of the
`.tsx` lanes, so it overlaps them in wall-clock time. **Final CSS visual
correctness requires L-CSS + the `.tsx` className swaps to both be merged** —
verified in Integration, not per-lane.

## Coordination: class-name registry

For findings that change inline styles → class names, or rename wrong classes,
the `.tsx` lane edits the component and the **L-CSS** lane adds the rule. They
agree via these fixed names (no cross-file edits needed):

| Component (owner lane) | className the `.tsx` will emit | Rule added by L-CSS |
|---|---|---|
| `KeyCap` (L-PRIM) | `key-cap-wrapper`, `key__sep` | layout + separator |
| `AttributesPanel` (L-PRIM) | `btn ghost sm` (was `btn--ghost btn--sm`) | (existing `.btn.ghost.sm`) |
| `Source/BulkBar` (L-SRC) | `bulk-action-bar`, `__count`, `__actions` | (existing block) |
| `StepDots` (L-PRIM) | `step-dot`, `step-dot--active/done/pending`, `step-label` | new block |
| `Crop/CropOverview` (L-CG) | `crop-overview__head/row/stat/label` | new block |
| `ShortcutsCheatsheet` (L-PRIM) | `shortcuts__grid/group/title/row` | new block |
| `Validation/CheckRow,DownloadFooter,PanelToolbar` (L-SRC) | `check-row*`, `download-footer*`, `panel-toolbar*` | new blocks |
| `Projects/ProjectsEmpty` + `CoverPlaceholder` (L-STW/L-SRC) | `cover-placeholder*`, `projects-empty__stack` | new block |
| `PaperRender` (L-PW) | uses `var(--space-4-5)` inline (no class) | n/a (token only) |

Class names for the *already-emitting-but-unstyled* components (Thumbnail,
ThumbGrid, SummaryCell, TableHeader/Footer, CheckIcon, all stage panels, etc.)
need **no `.tsx` change** — L-CSS reads the component, styles the existing
classes. Those are pure L-CSS tasks.

---

## §Patterns (reusable concrete code)

### P1 — Konva token resolution (canvas can't read CSS vars at paint)

Create `src/canvas/resolveToken.ts`:

```ts
/** Resolve a CSS custom property to its computed value for Konva props.
 *  Konva renders to <canvas> and does NOT evaluate var() strings. */
export function resolveToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}
```

Usage in a Konva component:

```ts
const accent = resolveToken('--accent', '#6e9cdf');
// <Rect stroke={accent} ... />
```

For live theme switching, re-resolve inside `useEffect(() => {...}, [theme])`
(see Open Question OQ-1).

### P2 — Default `aria-hidden` on decorative icons

```tsx
// Icon.tsx / bespoke icons: default hidden, allow explicit label override
export function Icon({ 'aria-label': label, ...rest }: IconProps) {
  const a11y = label ? { 'aria-label': label } : { 'aria-hidden': true };
  return <LucideOrSvg {...a11y} {...rest} />;
}
```

### P3 — Roving-tabindex arrow-key nav for tab/segmented lists

```tsx
function onTabKeyDown(e: React.KeyboardEvent, items: HTMLElement[], i: number) {
  const last = items.length - 1;
  let next = i;
  if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
  else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = last;
  else return;
  e.preventDefault();
  items[next]?.focus();
}
// each tab: tabIndex={active ? 0 : -1}
```

### P4 — Unique ids for ARIA wiring

```tsx
const id = React.useId();
// aria-controls={`${id}-panel`} on trigger; id={`${id}-panel`} on panel
```

### P5 — CSS rule block template (added to `theme/primitives.css`)

```css
/* <Component> — added 2026-05-28 audit remediation */
.thumbnail { position: relative; display: flex; flex-direction: column; }
.thumbnail__image-wrap { position: relative; overflow: hidden;
  border-radius: var(--radius-md); background: var(--bg-sunk); }
.thumbnail__corner { position: absolute; }
/* ...one block per emitted class, using tokens only (no literals) */
```

### P6 — Vitest behavioral test skeleton (WS5/6/7)

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('calls onRotationChange when a rotation is picked', async () => {
  const onRotationChange = vi.fn();
  render(<SourcePageWorkbench {...base} onRotationChange={onRotationChange} />);
  await userEvent.click(screen.getByTestId('source-rotation-90'));
  expect(onRotationChange).toHaveBeenCalledWith(90);
});
```

---

## L0 — Foundation (sequential, FIRST)

**Owner files:** `theme/tokens.css`, `src/index.ts`. Model: sonnet.
**Spec rows:** WS0 (all), plus barrel rows in WS7 (`src/index.ts:29`,
`StepDots`/`JobStatusPip`/`useViewport`/`PopoverClose`).

- [ ] **Step 1 — Add token scales to `theme/tokens.css`** for both `:root` and
  `[data-theme="light"]`: spacing `--space-1..8` + `--space-4-5`; radius
  `--radius-sm/md/lg/pill`; type `--text-xs/sm/md/lg`; transitions
  `--transition-fast/base`; shadows `--shadow-sm/dock/overlay/card` (theme-aware);
  `--book-font: 'Georgia', serif`. Remove the duplicate `--overlay-scrim` comment
  at `tokens.css:83-84`. (Concrete values per spec §0.1.)
- [ ] **Step 2 — Add root-barrel re-exports to `src/index.ts`:** `useViewport`,
  `StepDots`, `JobStatusPip`, `PopoverClose` (export `PopoverPrimitive.Close`
  from `primitives/Popover.tsx` first if not already named — that single export
  add in Popover.tsx is L0's only `primitives/` touch; record it so L-PRIM does
  not duplicate). Also export canvas helpers if intended public (`isValidBBox`,
  `validatePageDimensions`, `makeRafThrottle`).
- [ ] **Step 3 — Verify the sync path** (spec §0.3): confirm
  `scripts/sync-design-system.mjs` and the `theme-check` gate target `theme/`
  (not `src/theme/`). Fix the script path if wrong.
- [ ] **Step 4 — Run the CSS sync + CI.** `node scripts/sync-design-system.mjs`
  (or the documented `make` target), then `make ci`. Expected: green, mirror
  updated.
- [ ] **Step 5 — Commit.** `git add theme/tokens.css src/index.ts src/primitives/Popover.tsx docs/design-system && git commit -m "feat(theme): add spacing/radius/type/shadow token scales + barrel exports (audit WS0)"`

**Acceptance:** new tokens resolve in both themes; `theme-check` green;
`import { useViewport, StepDots, JobStatusPip, PopoverClose } from '..'` typechecks.

---

## L-CSS — `theme/primitives.css` (parallel; long pole)

**Owner file:** `theme/primitives.css` only. Model: sonnet.
**Depends on:** L0 (consumes new tokens). **Spec rows:** WS1 (all), WS3-3C, plus
the registry's "new block" rows.

Reads each referenced component (cached) to learn its emitted class names, then
adds token-only rules. After ALL blocks: re-run sync gate.

- [ ] **Step 1 — Primitive blocks (no `.tsx` change needed):** add rules for
  `Thumbnail`, `ThumbGrid` (consume `--thumb-size`), `ThumbSizeToggle`,
  `AttributesPanel` `.ap*`, `SummaryCell`/`SummaryStrip`, `TableHeader`/
  `TableFooter`, `CheckIcon` (+ `__spin` reusing `pip-spin`), `ThumbFlagBadge`,
  `ToggleBadge`/`toggle--badge`. (Spec WS1-1A.) Pattern P5.
- [ ] **Step 2 — Primitive CSS bug fixes:** Accordion chevron → use
  `.acc[data-state='open'] .chev`; add `.acc-trigger`; add accordion open/close
  `@keyframes` using `--radix-accordion-content-height`. `ToggleGroup`:
  `.seg-item` + `.seg-item[data-state='on']`. `.toggle__thumb` →
  `var(--toggle-thumb, var(--bg-surface))`. Replace all `rgba(15,23,42,…)`
  box-shadows (`:840,1511,1766,1879`) with `--shadow-*`. Remove hardcoded
  `margin` from `.quality-banner` (`:897`). Add `.stat-tile--clean` tint.
  (Spec WS1-1A, WS3-3C.)
- [ ] **Step 3 — Global/cross-area CSS:** add `@keyframes pgd-shimmer` (consumed
  by L-SHELL `JobRow`), and `.dialog--sheet-right` modifier (consumed by L-SRC
  `Upload/ModalC`). (Spec WS1-1B shell + Upload rows.)
- [ ] **Step 4 — Registry "new block" classes** (names from §Coordination):
  `key-cap-wrapper`/`key__sep`, `step-dot*`/`step-label`, `crop-overview__*`,
  `shortcuts__*`, `check-row*`/`download-footer*`/`panel-toolbar*`,
  `cover-placeholder*`/`projects-empty__stack`.
- [ ] **Step 5 — Stage panel blocks (no `.tsx` change):** all classes emitted by
  Crop/Grayscale/HyphenJoin/Scannos/PageWorkbench components (Spec WS1-1B). Read
  each stage's components to enumerate class names.
- [ ] **Step 6 — Sync + CI.** Run the sync script; `make ci`. Expected green.
- [ ] **Step 7 — Commit.** `git commit -m "feat(theme): add missing primitive + stage CSS rules, fix accordion/toggle selectors (audit WS1/WS3-css)"`

**Acceptance:** grep shows every emitted class name has a rule; sync mirror
current; `theme-check` green. (Visual confirmation in Integration.)

---

## L-PRIM — primitives `.tsx`

**Owner files:** `src/primitives/**/*.tsx` (+ stories/tests). Model: sonnet.
**Depends on:** L0. **Spec rows:** WS4 (StatusPip), WS5 (ColorField, Segmented,
BaseJobConfigDialog), WS6 (Field, ConfigureTabs, ViewToggle, Tooltip, Banner,
StatusPip/JobStatusPip/RowFlagBadge dots, Icon/bespoke, TableHeader keyboard,
Progress/QualityBanner aria-live, Kanban, BulkActionBar, StageToolbar), WS7
(Input className, Accordion header forward, ToggleBadge disabled, Dialog/
AlertDialog testid, KanbanBoard type, ThumbGrid key, PageChip rename, casts,
story coverage), WS2 (primitive stories token refs), WS3 (KeyCap inline→class,
AttributesPanel btn class).

- [ ] **Step 1 (TDD WS4/WS5):** failing tests for `StatusPip` ocr/gt colors,
  `ColorField` ref forwarding, `BaseJobConfigDialog` outputDir reset on reopen,
  `Segmented` empty-options guard. (P6.) Run → fail.
- [ ] **Step 2:** implement those fixes. Run tests → pass.
- [ ] **Step 3 (TDD WS6 a11y):** add jsx-a11y/Testing-Library assertions and
  implement per spec WS6 primitive rows — apply P2 (icon aria-hidden), P3 (tab
  arrow-nav for ConfigureTabs/ViewToggle), Tooltip Portal, Banner `<div>`+role,
  decorative dot `aria-hidden`, TableHeader `aria-sort`+keyboard, Progress/
  QualityBanner `aria-live`, Kanban listbox/announcement, BulkActionBar hint,
  StageToolbar empty guard.
- [ ] **Step 4 (WS7 + WS2/WS3):** apply remaining primitive API/consistency rows
  + story token remaps (§WS0 table) + KeyCap class swap + AttributesPanel
  `btn ghost sm`. Add missing stories (Select disabled/error/preselected).
- [ ] **Step 5:** `make test` + `make lint` (or focused `vitest src/primitives`).
  Green. **Commit** in coherent chunks (one per step group).

**Acceptance:** all primitive behavioral/a11y tests pass; lint/tsc clean.

---

## L-CANVAS — icons / hooks / canvas `.tsx`

**Owner files:** `src/icons/*`, `src/hooks/*`, `src/canvas/**`. Model: sonnet.
**Spec rows:** WS3-3A (canvas Konva), WS5 (pan/hover stub, useShortcuts
unregister), WS6 (canvas keyboard, icon aria-hidden), WS7 (navigator.platform,
canvas context exports), WS2 (canvas story tokens).

- [ ] **Step 1:** create `src/canvas/resolveToken.ts` (P1). Test it.
- [ ] **Step 2 (TDD):** failing tests for `useShortcuts` unregister-before-
  register; for canvas `pan`/`hover` — decide implement vs remove from
  `SlotRenderProps` (default: **remove** the unimplemented props from the public
  type until implemented; add a tracked TODO). Implement; tests pass.
- [ ] **Step 3:** apply Konva color resolution (P1) to `BBoxLayer`,
  `MarqueeSelectLayer`, `PageImageCanvas` drag stroke; remap to `--accent`/
  `--word` per WS0. Replace `--color-text-muted`/`#888` fallback with `--ink-3`.
- [ ] **Step 4:** P2 icon `aria-hidden` defaults (`Icon.tsx`, `bespoke.tsx`);
  canvas keyboard handler or `role="region"`+label; `navigator.userAgentData`
  platform detection; export canvas context type/hook if public; fix canvas
  story tokens.
- [ ] **Step 5:** focused `vitest src/canvas src/hooks src/icons` + lint. Green.
  **Commit** per step group.

**Acceptance:** Konva layers honor theme (manual toggle check noted for
Integration); shortcut re-register has no stale bindings; icons default hidden.

---

## L-SHELL — shell `.tsx`

**Owner files:** `src/shell/**`. Model: sonnet. **Depends on:** L0; consumes
L-CSS `pgd-shimmer` (no file conflict). **Spec rows:** WS5 (UIPrefsApplicator,
AppShell rail, AppHeader defaults, JobsDrawer/Pill hover+multi+viewall,
SuiteSiblings/createApi error surfacing, AppearancePanel color input), WS6
(AppShell landmarks, SettingsModal tab pattern, JobsDrawer resize handle, slot
icons), WS3 (Jobs box-shadow→token), WS2 (AppShell story tokens), WS7
(SubShells orphan test, launcher/settings doc, Drawer/RightPanel min-width).

- [ ] **Step 1 (TDD — highest value):** failing test that
  `UIPrefsApplicator` writes the 9 color CSS vars via `setProperty` when store
  overrides differ from defaults. Implement the effects. Test passes.
- [ ] **Step 2 (TDD):** AppShell rail fallback `var(--shell-rail-w, 64px)`;
  AppHeader remove placeholder defaults (mark prop required — note: breaking,
  see OQ-3); JobsDrawer per-row hover wiring + multi-running summary; JobsPill
  `onViewAll`. Tests for each.
- [ ] **Step 3 (WS6):** AppShell landmark roles (`<main>`/`<nav>`/`<aside>`),
  SettingsModal `tablist`/`tabpanel`/`aria-controls` (P3/P4), JobsDrawer resize
  handle role/keyboard, slot icon `aria-hidden`.
- [ ] **Step 4 (WS3/WS2/WS7):** Jobs box-shadows → `--shadow-overlay/card`;
  AppShell story token remaps; SuiteSiblings/createApi error surfacing;
  Drawer/RightPanel `min-width:0`; resolve `SubShells` orphan test (create or
  delete); document launcher/settings header contract.
- [ ] **Step 5:** `vitest src/shell` + lint. Green. **Commit** per group.

**Acceptance:** AppearancePanel color change visibly updates a CSS var in a test;
shell landmarks present; settings tabs keyboard-navigable.

---

## L-STW — stores / templates / worklist `.tsx`

**Owner files:** `src/stores/*`, `src/templates/*`, `src/worklist/*`. Model:
sonnet. **Spec rows:** WS4 (getAccentColor swap), WS5 (ProjectsLanding tab-reset
+ no-op buttons + selected fallback, useLongJob SSE/ cancel, VirtualizedList
empty slot), WS6 (VirtualizedList activedescendant + roving focus, StageStrip,
TabsBand, ProjectsDrawer, ProjectsLanding detail tabs), WS7 (NAV_ITEMS dedupe,
useWorklistSort cast), WS3 (PipelineTemplate/ProjectsLanding rgba +
CoverPlaceholder dedupe), WS2 (`--font-mono`).

- [ ] **Step 1 (TDD WS4):** failing test for `getAccentColor` returning
  `{fg: accentInkColor, bg: accentColor}`. Swap. Pass.
- [ ] **Step 2 (TDD WS5):** ProjectsLanding `setTab(defaultTab)` on selectedId
  change; wire `onOpenProject`/`onPasteUrl`/`onImportArchive`/`onOpenStyleGuide`;
  empty-state when no selection; `useLongJob.cancel()` error handling;
  `VirtualizedList` `emptySlot`. Tests each.
- [ ] **Step 3 (WS6):** VirtualizedList `aria-activedescendant` + roving
  `tabIndex` (P3/P4); StageStrip listitem wrapping; TabsBand + ProjectsDrawer +
  ProjectsLanding tab ARIA (`aria-selected`/`aria-controls`, not `aria-pressed`).
- [ ] **Step 4 (WS3/WS2/WS7):** extract `CoverPlaceholder` into ONE shared
  component (used by both templates) emitting `cover-placeholder*` classes;
  remove rgba literals; `--font-mono`→`--mono-font`; replace inline `NAV_ITEMS`
  with `<SettingsNav>`; drop `any` cast in `useWorklistSort`. (Document
  SSE-deferred in `useLongJob` JSDoc.)
- [ ] **Step 5:** `vitest src/stores src/templates src/worklist` + lint. Green.
  **Commit** per group.

**Acceptance:** accent fg/bg test passes; ProjectsLanding tab reset + open work;
worklist keyboard nav announces active row.

---

## L-CG — Crop + Grayscale `.tsx`

**Owner files:** `src/stages/Crop/*`, `src/stages/Grayscale/*`. Model: sonnet.
**Spec rows:** WS2 (`--color-brand`), WS3 (CropOverview inline→`crop-overview__*`
classes), WS4/WS2 (CropCard `--color-brand`→`--accent`), WS5 (CropCard
flagChips guard, StageControlsLeft backend, BboxEditor TODO, GrayThumb,
CropBanner error), WS6 (sections aria-label, AdvancedParams range labels,
CropCard status dot, ModeCard radio nav, CropToolbar testid), WS7 (CropFlagKind
×3 dedupe, GrayscaleMode ×2 dedupe, CropStepSettings testid fallback).

- [ ] **Step 1 (WS7 first — unblocks types):** create `src/stages/Crop/types.ts`
  with single `CropFlagKind`; import everywhere; same for `GrayscaleMode`
  (single home). Update barrels.
- [ ] **Step 2 (TDD WS5):** CropCard render-flags guard
  (`page.flags.length > 0`); GrayThumb require `onClick` when interactive;
  CropBanner `error` state; StageControlsLeft backend wiring/removal;
  BboxEditor real GH-issue ref (no `#TODO`). Tests.
- [ ] **Step 3 (WS6):** section `aria-label`s, AdvancedParams range `aria-label`,
  CropCard status-dot human-readable/`aria-hidden`, ModeCard radiogroup arrow
  nav, stable CropToolbar density testid.
- [ ] **Step 4 (WS2/WS3):** `--color-brand`→`--accent`; CropOverview inline
  styles → `crop-overview__*` classNames (rules added by L-CSS); CropStepSettings
  testid fallback.
- [ ] **Step 5:** `vitest src/stages/Crop src/stages/Grayscale` + lint. Green.
  **Commit** per group.

**Acceptance:** single type decls; Crop/Grayscale behavioral + a11y tests pass.

---

## L-HS — HyphenJoin + Scannos `.tsx`

**Owner files:** `src/stages/HyphenJoin/*`, `src/stages/Scannos/*`. Model:
sonnet. **Spec rows:** WS2 (`--bg-surface-2`, `--fg-base` story), WS4
(HJStatusPill comment), WS5 (HyphenPageWorkbench J/K wiring + afterImageUrl,
CandidateDetail show-all, InlineMarkPopover anchor, HyphenStepSettings
validation, HyphenAutoJoined cast), WS6 (HJDecisionCard role=application,
HyphenMismatch decisions, HyphenUndecided aria, InlineMarkPopover disabled,
RuleDetail/NavGroup testid), WS7 (RuleDetail testid prop, NavGroup constant,
read-only/empty stories).

- [ ] **Step 1 (TDD WS5):** HyphenPageWorkbench threads + wires `onNext`/
  `onPrev` (J/K); CandidateDetail `showAll` toggle; InlineMarkPopover anchored
  to trigger via `asChild`; HyphenStepSettings NaN/min guards. Tests each.
- [ ] **Step 2 (WS6):** remove `role="application"` (keep tabIndex+keydown);
  HyphenMismatch structured decisions; HyphenUndecided `aria-current`/listbox;
  InlineMarkPopover disabled-when-no-callback.
- [ ] **Step 3 (WS2/WS4/WS7):** `--bg-surface-2`→`--bg-raised`, story
  `--fg-base`→`--ink-2`; HJStatusPill comment; RuleDetail `data-testid` prop;
  NavGroup testid constant; HyphenAutoJoined direct destructure; add read-only +
  empty-cases stories.
- [ ] **Step 4:** `vitest src/stages/HyphenJoin src/stages/Scannos` + lint.
  Green. **Commit** per group.

**Acceptance:** J/K nav works; show-all expands; popover anchors correctly.

---

## L-SRC — Source/PageReorder/Upload/Projects/Validation/QualityFlags `.tsx`

**Owner files:** those six stage dirs. Model: sonnet. **Depends on:** L0;
consumes L-CSS `.dialog--sheet-right` + `bulk-action-bar` (no file conflict).
**Spec rows:** WS1 (BulkBar class rename, ProjectsAttributesPanel btn class),
WS3 (Validation/ProjectsEmpty inline→classes, ModalB inline SVG), WS5
(SourcePageWorkbench rotation+dead branch+beforeImageUrl, InsertDialog close,
ModalC future steps, ThumbCard double-fire, PageThumb empty), WS6 (PageRow
role, CheckRow aria-expanded, ModalB/SwapRow/BulkBar/ProjectsAttributesPanel
aria), WS7 (ProjectsEmpty displayName), WS2 (PipelineMini.css refs, BulkBar
story token).

- [ ] **Step 1 (WS1/WS3 class fixes):** `Source/BulkBar` → `bulk-action-bar*`;
  `ProjectsAttributesPanel` → `btn ghost sm`; Validation CheckRow/DownloadFooter/
  PanelToolbar + ProjectsEmpty inline→registry classNames; ModalB inline SVG →
  shared `Icon`; PipelineMini.css phantom-var cleanup; BulkBar story token.
- [ ] **Step 2 (TDD WS5):** SourcePageWorkbench wire `onRotationChange` + remove
  dead branch + decide `beforeImageUrl` (wire or remove); InsertDialog
  `onOpenChange(false)` on submit; ModalC future-step guard; ThumbCard single
  select path; QualityFlags PageThumb placeholder. Tests each (P6 example covers
  rotation).
- [ ] **Step 3 (WS6/WS7):** PageRow → `listitem`/`list` (not bare `role=row`);
  CheckRow conditional `aria-expanded`; ModalB/SwapRow/BulkBar/
  ProjectsAttributesPanel `aria-label`/`aria-labelledby`; ProjectsEmpty
  `displayName`.
- [ ] **Step 4:** `vitest src/stages/{Source,PageReorder,Upload,Projects,Validation,QualityFlags}` + lint. Green. **Commit** per group.

**Acceptance:** rotation fires; no double-select; ModalC blocks forward jumps;
PageRow valid ARIA.

---

## L-PW — PageWorkbench `.tsx`

**Owner files:** `src/stages/PageWorkbench/*`. Model: sonnet. **Spec rows:** WS2
(`--space-*`, `--surface-*`, `--radius-*`, `--info`, `--brand`, `--clean`,
`--surface`), WS3/WS4 (Konva resolution for WordBboxOverlay/IllustOverlay/
LabelerCanvas; `--brand`→`--accent`, `--clean`→`--exact`; `--book-font` for
WordCard/WordRow/LineBlockCard/LineBlockRow; PaperRender `--space-4-5`), WS5
(SplitHandle scale-geometry, RotateHandle off-canvas + dragBound, LabelerCanvas
onBlocksChange no-op, AttributesPanel fields — note AttributesPanel is in
primitives/L-PRIM; PW-local panels only), WS6 (HierarchyTreePanel group+arrow
nav, TextReviewPane useId, TreeRow nested focus, WordCard/Row aria-label,
PageAttributesBar aria, TypeGrid columns), WS7 (EditMode `'words'`, scale
`??`, children `?? []`, OcrTextPanel narrow cast).

- [ ] **Step 1:** import `resolveToken` (from L-CANVAS's `src/canvas/
  resolveToken.ts`) and apply Konva resolution (P1) to WordBboxOverlay,
  IllustOverlay, LabelerCanvas; remap `--brand`/`--clean`/`--surface`/`--info`
  per WS0. Replace `--space-*`/`--radius-*` refs with the L0 tokens; WordCard/
  Row/LineBlock fonts → `var(--book-font)`; PaperRender `var(--space-4-5)`.
  *(L-CANVAS owns resolveToken.ts; L-PW only imports it — coordinate so
  L-CANVAS Step 1 merges first or both define the file identically; simplest:
  L-CANVAS creates it, L-PW imports.)*
- [ ] **Step 2 (TDD WS5):** SplitHandle uses measured stage CSS width (not
  natural `pageWidth`); RotateHandle on-canvas placement + bound clamp;
  LabelerCanvas `onBlocksChange` JSDoc no-op (or remove). Tests where testable
  (geometry via computed left offset).
- [ ] **Step 3 (WS6):** HierarchyTreePanel `role=group` + Up/Down focus (P3);
  TextReviewPane `useId` (P4); TreeRow single focus stop; WordCard/Row
  `aria-label`; PageAttributesBar `id`+`aria-controls`; TypeGrid computed column
  count.
- [ ] **Step 4 (WS7):** add `'words'` to `EditMode` (or document); `?? 1` for
  scale; `?? []` for children; narrow OcrTextPanel cast.
- [ ] **Step 5:** `vitest src/stages/PageWorkbench` + lint. Green. **Commit**
  per group.

**Acceptance:** split separator aligns at runtime scale (test); tree Up/Down
nav; canvas overlays theme-correct.

---

## Integration (after all lanes merge)

Per workspace rule: each lane returns a worktree path + branch; orchestrator does
worktree→local-merge (`--no-ff`, never squash)→push (only when authorized).

- [ ] Merge all lanes to `main` locally.
- [ ] Re-run CSS sync (`node scripts/sync-design-system.mjs`); confirm
  `docs/design-system/` mirror current.
- [ ] `make ci` (vitest + lint + typecheck + theme-check) green.
- [ ] **Storybook visual pass** — spot-check every component touched by L-CSS +
  the registry className swaps render correctly in BOTH `[data-theme]` values:
  Thumbnail/ThumbGrid/SummaryCell/TableHeader/CheckIcon/StepDots/KeyCap, each
  stage panel, accordion animation, toggle thumb in light theme, Konva overlays
  on theme toggle.
- [ ] `knip` shows no new unused exports; grep `var(--` finds no undefined token.

---

## Spec-coverage self-check (writing-plans §Self-Review)

- WS0 → L0. WS1 → L-CSS (+ registry className swaps in L-PRIM/L-CG/L-SRC/L-STW).
  WS2 → split across L-CSS (css refs) + each `.tsx` lane (component/story refs).
  WS3 → L-CSS (3C) + L-CANVAS/L-PW (3A Konva) + lanes (3B inline→class).
  WS4 → L-PRIM (StatusPip) + L-STW (getAccentColor) + L-PW (LabelerCanvas).
  WS5 → every `.tsx` lane. WS6 → every `.tsx` lane. WS7 → L0 (barrel) + every
  `.tsx` lane.
- **Gap check:** the only cross-lane file dependency is
  `src/canvas/resolveToken.ts` (created by L-CANVAS, imported by L-PW) and
  `PopoverClose` export (L0 in Popover.tsx) — both noted in the owning tasks.
- **No FastAPI+SPA milestone** required: this is a frontend *library*, not a
  FastAPI app serving an SPA; the browser-verification mandate does not apply.
  Storybook visual pass is the equivalent UI verification.

## Open questions (resolve before/within the relevant lane)

- **OQ-1 (L-CANVAS/L-PW):** Konva theme switching — resolve-once-at-mount
  (simpler, plan default) vs re-resolve on `[data-theme]` change. If live canvas
  theming is required, add the `useEffect` re-resolve.
- **OQ-2 (architecture):** all CSS centralizes in `primitives.css` because
  component-local CSS is inlined/unpublished. If the L-CSS file becomes
  unwieldy, a follow-up could set `cssCodeSplit: false` + emit a second
  published stylesheet — out of scope here.
- **OQ-3 (L-SHELL):** removing `AppHeader` placeholder defaults is a breaking
  change for downstream SPAs — coordinate, or keep empty-string defaults.
- **OQ-4:** new brand/info color *tokens* are intentionally avoided (hybrid
  policy remaps to accent/ocr). A first-class semantic-token RFC is separate.
