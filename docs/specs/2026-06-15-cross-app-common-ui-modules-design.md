---
kind: spec
status: implemented
owner: CT
created: 2026-06-15
last_verified: 2026-07-13
---

# Cross-App Common UI Modules

- **Status:** Approved design - pending implementation plan
- **Date:** 2026-06-15
- **Repo:** `pdomain-ui`
- **Consumers:** `pdomain-ocr-simple-gui`, `pdomain-ocr-labeler-spa`, `pdomain-prep-for-pgdp`
- **Input report:** `/tmp/pdomain-ui-cross-app-common-module-review-2026-06-15.html`
- **Related docs:**
  - `docs/research/2026-06-14-pgdp-design-handoff-gap-analysis.md`
  - `docs/plans/2026-06-14-pgdp-common-component-backlog.md`

## Problem

The PGDP prep wireframes, the simple OCR GUI, and the OCR labeler SPA repeat
several UI patterns that are not first-class `pdomain-ui` exports yet.

The current library already covers tokens, shell chrome, core primitives,
stage slices, canvas pieces, and OCR-specific worklists. The remaining gap is
not a lack of atoms. The gap is reusable UI contracts for app records, source
intake, zoomable viewing, settings state, operation status, and workbench
layout.

Today each app owns parts of that presentation:

- simple GUI hand-rolls recent-project and result-page tables because the
  current `PageList` and `WordList` shapes are OCR-specific.
- simple GUI wraps `ArtifactViewer` to add high-DPI zoom and fit controls.
- simple GUI owns a source picker with dropzone, file, folder, archive, path,
  recents, errors, and selected-source summaries.
- labeler owns project search, filter chips, count display, project cards,
  shortcut search, a source-folder dialog, and blocking operation overlays.
- PGDP repeats review lists, project lists, source intake, settings rows,
  artifact trees, gate panels, workbench layouts, and status surfaces across
  its final wireframes.

These patterns should move into `pdomain-ui` as presentation modules. The apps
should keep their state machines, endpoints, OCR rules, project semantics, and
stage behavior.

## Goals

- Add a shared, typed foundation for generic records and list toolbars.
- Add source-intake modules that support files, folders, archives, typed paths,
  recents, selected-source summaries, and directory picking.
- Add zoom and fit controls for artifact viewing without moving app overlays or
  annotation behavior into the library.
- Add reusable settings rows, settings cards, sliders, async settings sections,
  guidance panels, and status/action rows.
- Add reusable operation-status panels and blocking overlays.
- Add layout-only workbench shells for repeated viewer and inspector screens.
- Keep existing OCR-specific worklist modules intact. Do not stretch them into
  generic lists.
- Export the new modules through stable package paths with tests and stories.

## Non-Goals

- Do not move PGDP stage statecharts, SSE handling, backend registry behavior,
  event logs, or route orchestration into `pdomain-ui`.
- Do not move labeler annotation mutations, word-match semantics, bulk edit
  logic, or page-save behavior into `pdomain-ui`.
- Do not move simple GUI OCR job endpoints, filesystem policy, model-cache
  policy, CUDA install content, or output-directory semantics into `pdomain-ui`.
- Do not replace `worklist/WordList` or `worklist/PageList`. The new record
  modules live beside them.
- Do not create PGDP-only full stage screens in this work.

## Architecture

This design adds seven module families:

1. Generic records and tables.
2. Rich list toolbars.
3. Source intake.
4. Zoomable artifact viewport.
5. Async settings.
6. Operation status.
7. Workbench layout.

Each module family follows the same boundary:

- `pdomain-ui` owns typed props, slots, token-based styling, accessibility,
  keyboard behavior, loading/error/empty rendering, Storybook stories, and
  Vitest coverage.
- Consumers own data loading, mutation, state machines, status meanings,
  app-specific validation, and callbacks.

The design favors small Interfaces with slots. A slot is a render position that
the app fills with its own content. Slots keep domain behavior local while
letting the library own layout and interaction.

## Export Strategy

The new modules should use public subpaths instead of crowding the root export.

Recommended subpaths:

- `@pdomain/pdomain-ui/records`
- `@pdomain/pdomain-ui/source-intake`
- `@pdomain/pdomain-ui/viewport`
- `@pdomain/pdomain-ui/settings`
- `@pdomain/pdomain-ui/status`
- `@pdomain/pdomain-ui/workbench`

Shared primitives that are already broadly useful may also be re-exported from
`@pdomain/pdomain-ui/primitives` when they fit that package shape. Stage-only
or app-specific modules should not be added to the root barrel.

Every new public subpath needs:

- a source `index.ts`;
- a Vite library entry;
- a `package.json` export;
- a package contract test;
- at least one Storybook story for each exported React module.

## 1. Generic Records And Tables

### Problem

The current worklist package is shaped around OCR page and word review. It is
not a generic app record system. Simple GUI and labeler therefore duplicate
table, row, card, empty-state, keyboard, and action-menu behavior.

### Interfaces

#### `RecordList<T>`

`RecordList` renders a vertical list of app records.

Required props:

- `items: readonly T[]`
- `getKey(item: T): string`
- `renderPrimary(item: T): ReactNode`

Optional props:

- `renderSecondary(item: T): ReactNode`
- `renderMeta(item: T): ReactNode`
- `renderStatus(item: T): ReactNode`
- `renderActions(item: T): ReactNode`
- `onActivate(item: T): void`
- `selection?: RecordSelectionState<T>`
- `loading?: boolean`
- `error?: ReactNode`
- `empty?: ReactNode`
- `density?: "compact" | "comfortable"`
- `ariaLabel?: string`

Behavior:

- rows are keyboard-activatable when `onActivate` is present;
- selected rows expose `aria-selected`;
- action slots do not trigger row activation when clicked;
- loading, error, empty, and no-results states use the same layout contract.

#### `DataTable<T>`

`DataTable` renders a column-based table for recent projects, pages, package
files, model files, and review rows.

Required props:

- `items: readonly T[]`
- `getKey(item: T): string`
- `columns: readonly DataTableColumn<T>[]`

`DataTableColumn<T>`:

- `id: string`
- `header: ReactNode`
- `cell(item: T): ReactNode`
- `align?: "start" | "center" | "end"`
- `width?: string`
- `hideBelow?: "sm" | "md" | "lg"`
- `sortKey?: string`

Optional props:

- `onActivate(item: T): void`
- `selection?: RecordSelectionState<T>`
- `sort?: DataTableSortState`
- `onSortChange?(sort: DataTableSortState): void`
- `loading?: boolean`
- `error?: ReactNode`
- `empty?: ReactNode`
- `ariaLabel?: string`

Behavior:

- sortable columns use `aria-sort`;
- rows can be activated with Enter and Space when `onActivate` exists;
- responsive columns can hide below configured breakpoints;
- row actions are slots supplied through column cells.

#### `RecordGrid<T>`

`RecordGrid` renders a card grid for projects, artifact summaries, or review
groups.

Required props:

- `items: readonly T[]`
- `getKey(item: T): string`
- `renderCard(item: T): ReactNode`

Optional props:

- `onActivate(item: T): void`
- `selection?: RecordSelectionState<T>`
- `loading?: boolean`
- `error?: ReactNode`
- `empty?: ReactNode`
- `minCardWidth?: string`
- `ariaLabel?: string`

Behavior:

- cards preserve stable dimensions where possible;
- keyboard activation matches `RecordList`;
- empty, loading, and error states match the record family.

#### `EmptyState`

`EmptyState` renders a shared empty or no-results panel.

Props:

- `title: ReactNode`
- `description?: ReactNode`
- `icon?: ReactNode`
- `action?: ReactNode`
- `tone?: "neutral" | "info" | "warning" | "danger"`

### Locality Rule

Apps provide record shapes, filtering, deletion, archive behavior, route
navigation, and status meanings. `pdomain-ui` owns the repeated list shell.

## 2. Rich List Toolbar

### Problem

The existing `FilterToolbar` is too small for common app lists. Consumers need
search fields with shortcut affordances, filter chips with counts, result
counts, sort controls, and action slots.

### Interfaces

#### `SearchField`

Props:

- `value: string`
- `onValueChange(value: string): void`
- `placeholder?: string`
- `ariaLabel: string`
- `onClear?(): void`

Behavior:

- Escape clears the field when `onClear` is provided;
- the search icon and clear button use `@pdomain/pdomain-ui/icons`.

#### `ShortcutSearchField`

Extends `SearchField` with:

- `shortcutLabel?: string`
- `onShortcutClick?(): void`
- `inputRef?: Ref<HTMLInputElement>`

Behavior:

- renders a keycap-style shortcut affordance;
- supports parent-driven focus for Mod+K style global shortcuts.

#### `CountFilterGroup`

Props:

- `filters: readonly CountFilter[]`
- `activeId: string`
- `onActiveChange(id: string): void`
- `ariaLabel: string`

`CountFilter`:

- `id: string`
- `label: ReactNode`
- `count?: number`
- `disabled?: boolean`

Behavior:

- active filters expose pressed or selected state;
- counts are optional;
- disabled filters are skipped by keyboard navigation.

#### `SortSelect`

Props:

- `value: string`
- `options: readonly SortOption[]`
- `onValueChange(value: string): void`
- `ariaLabel: string`

`SortOption`:

- `value: string`
- `label: ReactNode`

#### `ListToolbar`

Props:

- `search?: ReactNode`
- `filters?: ReactNode`
- `sort?: ReactNode`
- `resultCount?: ReactNode`
- `actions?: ReactNode`
- `density?: "compact" | "comfortable"`

`ListToolbar` is a layout shell. It does not know filter or sort semantics.

### Locality Rule

Apps own query strings, filter meanings, counts, and sorting. `pdomain-ui`
owns consistent controls and toolbar layout.

## 3. Source Intake Kit

### Problem

All three apps need users to choose source material. The details differ, but
the interaction shape repeats: drag/drop, choose files, choose folder, choose
archive, type a path, pick a recent path, show selected sources, and choose a
directory from an app-backed listing.

### Interfaces

#### `FileDropzone`

Props:

- `onFilesAccepted(files: File[]): void`
- `accept?: string`
- `multiple?: boolean`
- `disabled?: boolean`
- `label?: ReactNode`
- `description?: ReactNode`
- `actions?: ReactNode`
- `error?: ReactNode`

Behavior:

- supports drag enter, drag leave, drop, and keyboard focus;
- rejects disabled drops without calling `onFilesAccepted`;
- renders error text in a consistent position.

#### `SourceKindSelector`

Props:

- `kinds: readonly SourceKindOption[]`
- `activeKind: string`
- `onActiveKindChange(kind: string): void`
- `ariaLabel: string`

`SourceKindOption`:

- `id: string`
- `label: ReactNode`
- `description?: ReactNode`
- `icon?: ReactNode`
- `disabled?: boolean`

#### `PathInputWithRecents`

Props:

- `value: string`
- `onValueChange(value: string): void`
- `recentPaths?: readonly string[]`
- `onRecentPathSelect?(path: string): void`
- `hint?: ReactNode`
- `error?: ReactNode`
- `placeholder?: string`
- `ariaLabel: string`

#### `SelectedSourceSummary`

Props:

- `sources: readonly SelectedSource[]`
- `onRemove?(sourceId: string): void`
- `maxVisible?: number`

`SelectedSource`:

- `id: string`
- `label: ReactNode`
- `kind: "file" | "folder" | "archive" | "path" | "other"`
- `meta?: ReactNode`

#### `DirectoryPickerDialog`

Props:

- `open: boolean`
- `onOpenChange(open: boolean): void`
- `currentPath: string`
- `onCurrentPathChange(path: string): void`
- `inputPath: string`
- `onInputPathChange(path: string): void`
- `entries: readonly DirectoryEntry[]`
- `loading?: boolean`
- `error?: ReactNode`
- `onRefresh?(): void`
- `onApply(path: string): void | Promise<void>`
- `onHome?(): void`
- `onUp?(): void`

`DirectoryEntry`:

- `name: string`
- `path: string`
- `kind: "directory" | "file"`
- `disabled?: boolean`

Behavior:

- uses the existing `Dialog` primitive;
- Enter in the path input opens the typed path;
- Mod+Enter applies the path;
- directory rows can be opened by keyboard;
- app callbacks own all filesystem behavior.

### Locality Rule

Apps own upload, filesystem APIs, validation, accepted formats, source-root
preferences, and project creation. `pdomain-ui` owns the intake controls.

## 4. Zoomable Artifact Viewport

### Problem

`ArtifactViewer` supports current artifact modes, but consumers also need
consistent zoom, fit, and viewport controls. Simple GUI currently owns a local
wrapper for high-DPI scans. PGDP and labeler also need repeated viewer controls.

### Interfaces

#### `ZoomViewport`

Props:

- `children: ReactNode`
- `zoom?: number`
- `defaultZoom?: number`
- `onZoomChange?(zoom: number): void`
- `minZoom?: number`
- `maxZoom?: number`
- `step?: number`
- `fitMode?: "none" | "fit-width" | "fit-height" | "fit-page"`
- `onFitModeChange?(mode: ZoomFitMode): void`
- `contentSize?: { width: number; height: number }`
- `ariaLabel?: string`

Behavior:

- supports controlled and uncontrolled zoom;
- clamps zoom between `minZoom` and `maxZoom`;
- recomputes fit on container resize;
- exposes stable layout so toolbar changes do not resize the viewport.

#### `ViewportToolbar`

Props:

- `zoom: number`
- `minZoom?: number`
- `maxZoom?: number`
- `onZoomChange(zoom: number): void`
- `fitMode?: ZoomFitMode`
- `onFitModeChange?(mode: ZoomFitMode): void`
- `actions?: ReactNode`

Behavior:

- renders zoom in, zoom out, reset, and fit controls;
- uses icon buttons with tooltips;
- disables controls at min and max.

#### `ArtifactViewer` Extension

`ArtifactViewer` should accept optional viewport props:

- `zoom?: number`
- `defaultZoom?: number`
- `onZoomChange?(zoom: number): void`
- `fitMode?: ZoomFitMode`
- `onFitModeChange?(mode: ZoomFitMode): void`
- `showViewportToolbar?: boolean`

The extension may compose `ZoomViewport` internally or allow consumers to wrap
`ArtifactViewer` themselves.

### Locality Rule

Apps own artifact data, overlays, annotation tools, persisted view state, and
stage-specific compare behavior. `pdomain-ui` owns fit math, zoom controls, and
viewport accessibility.

## 5. Async Settings

### Problem

PGDP repeats settings rows, cards, inheritance banners, and sliders. Simple GUI
adds async preference panels for job location, model cache, compute settings,
updates, and guidance. Labeler OCR settings add async availability and save
states. These should share layout and state presentation.

### Interfaces

#### `SettingsCard`

Props:

- `title: ReactNode`
- `description?: ReactNode`
- `badge?: ReactNode`
- `children: ReactNode`
- `actions?: ReactNode`
- `tone?: "neutral" | "info" | "warning" | "danger"`

#### `SettingsRow`

Props:

- `label: ReactNode`
- `description?: ReactNode`
- `value?: ReactNode`
- `control?: ReactNode`
- `actions?: ReactNode`
- `disabled?: boolean`
- `error?: ReactNode`

#### `SettingsValue`

Props:

- `children: ReactNode`
- `tone?: "neutral" | "success" | "warning" | "danger"`
- `mono?: boolean`

#### `SettingSlider`

Props:

- `value: number`
- `onValueChange(value: number): void`
- `min: number`
- `max: number`
- `step?: number`
- `unit?: string`
- `disabled?: boolean`
- `ariaLabel: string`

Behavior:

- clamps values to the configured range;
- supports keyboard interaction;
- renders the current value with the unit when provided.

#### `SettingsAsyncSection`

Props:

- `title: ReactNode`
- `description?: ReactNode`
- `state: "idle" | "loading" | "ready" | "saving" | "error"`
- `error?: ReactNode`
- `children: ReactNode`
- `actions?: ReactNode`

Behavior:

- loading and saving states have consistent visual treatment;
- error state is visible and associated with the section.

#### `PreferencePathRow`

Props:

- `label: ReactNode`
- `path: string`
- `effectivePath?: string`
- `onPathChange(path: string): void`
- `onSave?(): void`
- `onReset?(): void`
- `saving?: boolean`
- `error?: ReactNode`

#### `StatusActionRow`

Props:

- `label: ReactNode`
- `description?: ReactNode`
- `status?: ReactNode`
- `action?: ReactNode`
- `details?: ReactNode`

#### `GuidancePanel`

Props:

- `title: ReactNode`
- `children: ReactNode`
- `actions?: ReactNode`
- `tone?: "neutral" | "info" | "warning"`

### Locality Rule

Apps own endpoint calls, preference persistence, CUDA guidance copy, model
policy, and OCR settings semantics. `pdomain-ui` owns settings layout and async
state presentation.

## 6. Operation Status

### Problem

Apps repeat status panels for running jobs, failed jobs, retries, downloads,
blocking mutations, and cancellation. `pdomain-ui` already has job chrome, but
it does not provide generic operation panels or overlays.

### Interfaces

#### `OperationStatusPanel`

Props:

- `title: ReactNode`
- `message?: ReactNode`
- `state: "idle" | "queued" | "running" | "success" | "warning" | "error"`
- `progress?: number`
- `details?: ReactNode`
- `primaryAction?: ReactNode`
- `secondaryAction?: ReactNode`

Behavior:

- progress is clamped from 0 to 100;
- state controls icon and tone;
- actions are app-provided.

#### `BlockingOperationOverlay`

Props:

- `open: boolean`
- `title?: ReactNode`
- `message?: ReactNode`
- `progress?: number`
- `cancelAction?: ReactNode`
- `bestEffortCancel?: boolean`
- `ariaLabel?: string`

Behavior:

- renders above app content;
- uses `aria-live="polite"`;
- does not own cancel behavior;
- exposes best-effort cancellation as visual help text when requested.

#### `RetryActionPanel`

Props:

- `title: ReactNode`
- `message?: ReactNode`
- `error?: ReactNode`
- `retryAction?: ReactNode`
- `detailsAction?: ReactNode`

### Locality Rule

Apps own job stores, cancellation endpoints, retry semantics, and result
downloads. `pdomain-ui` owns the repeated status presentation.

## 7. Workbench Layout

### Problem

PGDP, simple GUI, and labeler all use repeated viewer-plus-inspector layouts.
The content differs, but the shell repeats: header, toolbar, navigation/list,
main viewer, inspector/detail panel, and footer/action areas.

### Interfaces

#### `WorkbenchLayout`

Props:

- `header?: ReactNode`
- `toolbar?: ReactNode`
- `navigation?: ReactNode`
- `viewer: ReactNode`
- `inspector?: ReactNode`
- `footer?: ReactNode`
- `navigationWidth?: string`
- `inspectorWidth?: string`
- `density?: "compact" | "comfortable"`

Behavior:

- supports two-pane and three-pane layouts;
- collapses side areas at narrow widths;
- keeps viewer area stable when optional regions appear or disappear.

#### `InspectorPanel`

Props:

- `title?: ReactNode`
- `description?: ReactNode`
- `tabs?: ReactNode`
- `children: ReactNode`
- `actions?: ReactNode`
- `footer?: ReactNode`

#### `DetailPanelShell`

Props:

- `title?: ReactNode`
- `meta?: ReactNode`
- `children: ReactNode`
- `actions?: ReactNode`
- `footer?: ReactNode`

### Locality Rule

Apps own tool behavior, annotation state, stage math, page mutation, and review
state. `pdomain-ui` owns the layout shell.

## Data Flow

The common pattern is controlled from the app:

1. The app loads data and owns state.
2. The app maps domain data into `pdomain-ui` props.
3. `pdomain-ui` renders presentation and calls app callbacks.
4. The app performs mutations or navigation.
5. The app passes updated props back into the shared module.

No new module should fetch by URL, read global stores, or branch on app names.
The only exception is existing shell behavior that already has an approved
store or context contract.

## Implementation Phases

### Phase 1 - Generic Records And Toolbar

Build:

- `RecordList`
- `DataTable`
- `RecordGrid`
- `EmptyState`
- `SearchField`
- `ShortcutSearchField`
- `CountFilterGroup`
- `SortSelect`
- `ListToolbar`

This phase supports simple GUI recent projects and result pages, labeler
project lists, and PGDP project/review surfaces.

### Phase 2 - Source Intake And Viewport

Build:

- `FileDropzone`
- `SourceKindSelector`
- `PathInputWithRecents`
- `SelectedSourceSummary`
- `DirectoryPickerDialog`
- `ZoomViewport`
- `ViewportToolbar`
- optional `ArtifactViewer` zoom and fit props

This phase supports simple GUI source selection and page viewing, labeler source
folder picking, and PGDP source/workbench screens.

### Phase 3 - Settings And Operation Status

Build:

- settings cards, rows, values, and slider;
- async settings sections;
- path preference rows;
- status/action rows;
- guidance panels;
- operation status panels;
- blocking overlays;
- retry panels.

This phase supports PGDP settings screens, simple GUI settings panels, labeler
OCR settings, and repeated job/mutation status surfaces.

### Phase 4 - Workbench Layout

Build:

- `WorkbenchLayout`
- `InspectorPanel`
- `DetailPanelShell`

This phase supports repeated viewer/detail screens without moving stage tools
or annotation behavior.

## Testing

Each exported module needs focused Vitest tests and Storybook stories.

Record tests:

- row activation with Enter and Space;
- action slot clicks do not activate the row;
- selected rows expose selected state;
- sortable table columns expose sort state;
- loading, error, empty, and no-results states render correctly.

Toolbar tests:

- search change and clear;
- shortcut click focuses or calls the provided callback;
- count filters change active filter and expose active state;
- sort changes call `onValueChange`.

Source intake tests:

- dropzone accepts files and ignores drops while disabled;
- selected source summary removes a source through callback;
- recent path selection calls the provided callback;
- directory rows update the current path through callback;
- Enter and Mod+Enter in the directory picker trigger the documented actions.

Viewport tests:

- zoom clamps to min and max;
- fit mode changes call the provided callback;
- toolbar buttons change zoom;
- optional `ArtifactViewer` viewport props do not regress existing modes.

Settings tests:

- rows associate labels, controls, values, errors, and actions;
- slider keyboard changes values and clamps range;
- async sections render loading, ready, saving, and error states;
- path preference rows call save and reset callbacks.

Status tests:

- operation states render the expected tone and progress;
- blocking overlay uses live-region semantics;
- cancel and retry actions remain app-owned slots.

Workbench tests:

- layout renders two-pane and three-pane forms;
- optional side areas can be absent;
- inspector and detail panel actions render in the right regions;
- narrow layout keeps text and controls within their containers.

Package tests:

- each public subpath exports the documented modules;
- root exports do not grow unless a module is intentionally promoted there;
- type declarations are generated for every new subpath.

## Storybook Coverage

Stories must cover:

- default state;
- dense or compact state when supported;
- long text;
- empty state;
- loading state;
- error state;
- disabled state;
- narrow viewport behavior.

Use token-only styling. Do not add hex colors. Use icons from
`@pdomain/pdomain-ui/icons`.

## Migration Notes

This spec only builds the `pdomain-ui` pieces. Consumer migrations should be
planned after these modules exist.

Expected later migrations:

- simple GUI can replace `RecentProjectsList`, result-page tables,
  `SourcePicker` internals, and `PageViewerWithZoom` internals.
- labeler can replace project-list toolbar/grid chrome, `QuickSearch`,
  source-folder dialog chrome, and busy overlay chrome.
- PGDP can consume settings, gate/status, source, list, toolbar, viewport, and
  workbench modules while keeping final stage machines local.

## Risks

- A generic record system can become too abstract. Keep it limited to list,
  table, grid, selection, activation, and state presentation.
- `DirectoryPickerDialog` can accidentally encode a filesystem policy. Keep all
  path behavior behind app callbacks.
- `ArtifactViewer` changes can regress existing PageWorkbench consumers. Add
  focused regression tests before extending it.
- Operation status can overlap with shell job chrome. Keep status panels
  presentation-only and do not add job-store behavior.
- Workbench layout can become a stage framework. Keep it layout-only.

## Acceptance Criteria

- All seven module families have approved Interface contracts in this spec.
- Implementation plan tasks build the modules in the four phases above.
- Each public module has typed props, tests, stories, and package exports.
- Existing OCR worklist modules still compile and keep their current public
  contracts.
- No app-specific state machine, backend call, OCR policy, or annotation
  mutation moves into `pdomain-ui`.
