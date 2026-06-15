# Changelog

All notable changes to `@pdomain/pdomain-ui` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.9.0] — 2026-06-15

### Breaking change

- `theme/primitives.css` no longer includes a global CSS reset. Consumers that
  imported `primitives.css` and relied on its implicit reset (`*` box-sizing,
  `html/body` margin/font, `a` color/decoration) must now also import
  `theme/reset.css` **before** `primitives.css` — or supply their own reset.

  Tailwind apps (`labeler-spa`, `simple-gui`) are **unaffected**: Tailwind
  preflight already covers the same ground and importing the old reset caused
  conflicts. Those apps should NOT add `reset.css`.

### Added

- `theme/reset.css` — new opt-in global reset export. Contains exactly the
  element/universal selectors that were previously embedded in `primitives.css`
  (`*`, `*::before`, `*::after`, `html`, `body`, `a`). Import it only when
  your app has no Tailwind preflight and no other CSS reset.
- `./theme/reset.css` subpath export in `package.json` (mirrors the existing
  `./theme/tokens.css` and `./theme/primitives.css` entries).

### Migration

```diff
  // tokens always first
  import '@pdomain/pdomain-ui/theme/tokens.css';
+ // add reset.css ONLY if you have no Tailwind preflight / CSS reset
+ import '@pdomain/pdomain-ui/theme/reset.css';
  import '@pdomain/pdomain-ui/theme/primitives.css';
```

Tailwind consumers: no change needed.

[0.9.0]: https://github.com/pdomain/pdomain-ui/releases/tag/v0.9.0

## [0.6.0] — 2026-06-04

### Added

- `onJobDelete` callback prop on `AppShell` jobs configuration. When provided, a
  trash-icon button appears on finished job rows in the jobs panel, letting consumers
  remove completed jobs from the list.

### Fixed

- Done (succeeded/failed/cancelled) job rows in the jobs panel no longer show an
  infinite shimmer animation. Only in-progress jobs animate; finished jobs render
  as static rows.
- `PageSplitView` editor slot now fills the full panel height by default
  (`flex: 1 1 0; min-height: 0`). Previously the slot shrank to content height,
  requiring consumers to add height overrides.
- Pinned utility dock no longer collapses content in the main layout area.
  Added `min-width: 0` to the main-content flex child so it reflows correctly
  when the dock occupies right-side space.

[0.6.0]: https://github.com/pdomain/pdomain-ui/releases/tag/v0.6.0

## [0.2.1] — 2026-05-25

### Fixed

- Externalized `react/jsx-dev-runtime` in Vite rollup config. The dev
  runtime was being bundled into the dist, causing a
  `TypeError: Cannot read properties of undefined (reading 'ReactCurrentDispatcher')`
  at module-load time for React 19 consumers running vitest (which uses the
  dev React bundle). React 18 consumers were unaffected. Fixes pdomain-prep-for-pgdp
  and pdomain-ocr-labeler-spa vitest runs after upgrading to pdomain-ui@0.2.0.

[0.2.1]: https://github.com/pdomain/pdomain-ui/releases/tag/v0.2.1

## [0.1.0-alpha.1] — 2026-05-21

Re-publish of the Phase 1 alpha. No source changes to library components —
this release exists solely to ship corrected registry metadata.

### Fixed

- Re-published so the `pdomain-index-npm` packument carries the full
  `dependencies` block. The earlier `0.1.0-alpha` packument dropped the
  install-relevant metadata (`scripts/rebuild-packuments.ts` bug, since
  fixed), so a fresh install of `@pdomain/pdomain-ui` failed to resolve
  transitive deps (`konva`, `react-konva`, `@radix-ui/*`, `clsx`,
  `react-virtuoso`, `@dnd-kit/*`, `@tanstack/react-virtual`, `zustand`,
  `lucide-react`). npm registry versions are immutable, so the fix ships
  as a new patch-prerelease version rather than overwriting `0.1.0-alpha`.

[0.1.0-alpha.1]: https://github.com/pdomain/pdomain-ui/releases/tag/v0.1.0-alpha.1

## [0.1.0-alpha] — 2026-05-17

Phase 1 release of the shared pd-* frontend library. Covers all milestones
M0 through M9, plus M10 (publish scaffolding).

### Added

**M0 — Repo scaffold**
- TypeScript 5 strict (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Vite 5 library mode with 9 ESM entry points
- Vitest 1 + jsdom test environment
- ESLint flat config with react-hooks, jsx-a11y, no-CVA, no-hex-literals rules
- Makefile with `install`, `lint`, `typecheck`, `test`, `build`, `ci` targets

**M1 — Design-system theme**
- `theme/tokens.css` — CSS custom property tokens (dark default, light override)
- `theme/primitives.css` — structural layout primitives
- `./theme/tokens.css` and `./theme/primitives.css` subpath exports
- `scripts/sync-design-system.mjs` — bidirectional sync with workspace `docs/design-system/`
- `make theme-check` CI gate (fails on drift)

**M2 — Primitive components**
- `src/primitives/` — `cn()` helper, pure HTML primitives (Button, Input, Label, Badge,
  Checkbox, TextArea, Select, Separator, Slot), Radix UI wrappers (Dialog, AlertDialog,
  Popover, Tooltip, DropdownMenu, Tabs, ToggleGroup)
- `@pdomain/pdomain-ui/primitives` subpath export
- No CVA — variants are CSS class modifiers

**M3 — Icons**
- `src/icons/` — curated lucide-react re-exports (25 icons) + 11 bespoke OCR-domain SVG icons
- `@pdomain/pdomain-ui/icons` subpath export
- ESLint rule blocks direct `lucide-react` imports outside `src/icons/`

**M4 — Codegen pipeline**
- `scripts/codegen-fetch.mjs` — fetches pinned `pdomain-book-tools` + `pdomain-ocr-ops` wheels
- `scripts/codegen-emit.mjs` — invokes `schemas.emit`, writes JSON Schema to `.codegen/`
- `scripts/codegen-tsgen.mjs` — wraps JSON Schema in OpenAPI stub, generates TS via
  `openapi-typescript`, writes to `src/types/generated/` (committed)
- `codegen.versions.json` — pinned wheel versions
- `make codegen-check` CI gate
- `@pdomain/pdomain-ui/types` subpath with `*Like` type reductions

**M5 — PageImageCanvas**
- `src/canvas/PageImageCanvas.tsx` — slot-based Konva stage for OCR page display
- `PageBBox` bounding box type + `bboxToRect()` utility
- `useCanvasSelection` hook — multi-select, keyboard modifiers
- `@pdomain/pdomain-ui/canvas` subpath export

**M6 — WordList**
- `src/worklist/WordList.tsx` — react-virtuoso virtualized word list
- `VirtualizedList` generic virtualization shell
- `LineCard`, `LineList`, `PageList` adapter components
- `useWorklistSort` + `useWorklistFilter` hooks
- `ConfidenceBar` + `MatchStatusChip` status row primitives
- `@pdomain/pdomain-ui/worklist` subpath export

**M7+M8 — AppShell + Zustand store factories**
- `src/shell/AppShell.tsx` — CSS grid shell with `deployMode` prop and UIPrefs context
- `LauncherSlot`, `LeftPanelSlot`, `RightPanelSlot`, `StatusBarSlot` render-prop slots
- `createUIPrefsStore()`, `createSuiteStore()`, `createJobStore()` factory functions
  (never singletons — apps instantiate per AppShell)
- `useSuiteSiblings()`, `useLongJob()` hooks
- `@pdomain/pdomain-ui/shell` and `@pdomain/pdomain-ui/stores` subpath exports

**M9 — Storybook**
- Storybook 8 with React + Vite builder
- Stories for all public components (AppShell, canvas, worklist, primitives, icons)
- `tests/storybook/` story-presence CI gate — fails if a component lacks a story

**M10 — Publish scaffolding**
- Version set to `0.1.0-alpha`
- `publishConfig.registry` pointing to self-hosted `pdomain-index-npm`
- `tests/build.contract.test.ts` — asserts all 9 dist entry JS + `.d.ts` files exist
- `tests/pack.contract.test.ts` — runs `pnpm pack --json`, asserts tarball completeness
- `tests/package.contract.test.ts` — version, exports, files, no-CVA contract assertions

### Not included in 0.1.0-alpha

- Actual publish to `pdomain-index-npm` registry (#177) — blocked on registry setup
- Hosted-mode backend adapters — Phase 2 work in each consuming app

[0.1.0-alpha]: https://github.com/pdomain/pdomain-ui/releases/tag/v0.1.0-alpha
