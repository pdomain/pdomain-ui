---
kind: spec
status: implemented
owner: CT
created: 2026-05-21
last_verified: 2026-07-13
promotes_to: docs/architecture/kanban-board.md
disposition: promote-then-retire
---

# KanbanBoard / KanbanColumn / PageChip — component-API spec

**Date:** 2026-05-21
**Status:** Implemented (issue #10) — `src/primitives/kanban/`
**Subpath:** `@concavetrillion/pdomain-ui/primitives`
**Required by:** `pdomain-ocr-trainer-spa` DatasetsPage (dual kanban — detection + recognition)
**Spec source:** `pdomain-ocr-trainer-spa/specs/03-frontend.md §6.3`

---

## 1. Purpose

A drag-and-drop, per-column-virtualized kanban board whose columns can hold
thousands of items (page chips). pdomain-ui owns the `dnd-kit` integration and
virtualization. The consumer supplies data, render-prop functions for chip
content and column headers, and a move-event callback. The board never
assumes immediate persistence — the consumer owns commit/staging
(e.g. trainer-spa stages moves client-side until an explicit "Apply").

---

## 2. Component tree

```
<KanbanBoard>
  <KanbanColumn>        (one per logical column)
    <PageChip>          (one per item in the column; virtualized)
```

All three are exported from `@concavetrillion/pdomain-ui/primitives`.

---

## 3. Props

### `KanbanBoard`

```ts
interface KanbanBoardProps<TColumn extends KanbanColumnDef, TItem extends KanbanItemDef> {
  /**
   * Column definitions — order is the visual order left-to-right.
   * Columns are identified by their `id` field.
   */
  columns: TColumn[];

  /**
   * All items in the board, partitioned by their current `columnId`.
   * Must be a stable Map (or equivalent). Items within each column are
   * ordered as provided; the board renders that order.
   */
  items: Map<TColumn['id'], TItem[]>;

  /**
   * Called when the user drops one or more items into a target column.
   * The board does NOT mutate `items` — the consumer responds to this
   * event by updating its own state (e.g. a staging store) and re-rendering
   * with the new `items` map.
   *
   * `fromColumnId` is null when the item was already in `toColumnId`
   * (shouldn't happen in normal flows; included for completeness).
   */
  onMove: (event: KanbanMoveEvent<TColumn['id'], TItem['id']>) => void;

  /**
   * Render-prop for column header content.
   * Receives the column def plus the item count for that column.
   */
  renderColumnHeader: (props: KanbanColumnHeaderProps<TColumn>) => React.ReactNode;

  /**
   * Render-prop for chip content.
   * Receives the item def, whether the chip is selected, and whether
   * a move is pending for this item (staged but not committed).
   */
  renderChip: (props: KanbanChipRenderProps<TItem>) => React.ReactNode;

  /**
   * Set of selected item IDs. The board renders selection state but
   * does not own selection — the consumer manages the set.
   */
  selectedIds?: ReadonlySet<TItem['id']>;

  /**
   * Called when the user clicks a chip (single-select or shift-range).
   * The consumer updates `selectedIds` in response.
   */
  onSelect?: (event: KanbanSelectEvent<TItem['id']>) => void;

  /** Additional class names for the board root element. */
  className?: string;
}
```

### `KanbanColumn`

`KanbanColumn` is not composed directly by consumers — it is rendered
internally by `KanbanBoard`. However it is exported so consumers can use it
standalone (e.g. a single-column virtualized drop target).

```ts
interface KanbanColumnProps<TColumn extends KanbanColumnDef, TItem extends KanbanItemDef> {
  column: TColumn;
  items: TItem[];
  renderHeader: (props: KanbanColumnHeaderProps<TColumn>) => React.ReactNode;
  renderChip: (props: KanbanChipRenderProps<TItem>) => React.ReactNode;
  selectedIds?: ReadonlySet<TItem['id']>;
  onSelect?: (event: KanbanSelectEvent<TItem['id']>) => void;
  /**
   * Forwarded to the column's root `<div>` for Playwright targeting.
   * Required testid contract for trainer-spa:
   *   kanban-detection-column
   *   kanban-recognition-column
   */
  'data-testid'?: string;
  className?: string;
}
```

### `PageChip`

`PageChip` is the built-in chip shell rendered inside each virtualized row.
It supplies the `dnd-kit` drag handle, selection highlight, and pending-move
affordance. The consumer fills in content via `renderChip`.

```ts
interface PageChipProps {
  id: string;              // dnd-kit draggable id (same as item id)
  isSelected: boolean;
  isPending: boolean;      // staged move not yet committed
  isDragging: boolean;     // true while being dragged (injected by dnd-kit)
  children: React.ReactNode;
  /** Forwarded to the chip root element. */
  'data-testid'?: string;
  className?: string;
}
```

---

## 4. Shared type contracts

```ts
/** Minimum shape any column definition must satisfy. */
interface KanbanColumnDef {
  id: string;
  label: string;
}

/** Minimum shape any item must satisfy. */
interface KanbanItemDef {
  id: string;
  columnId: string;   // current column assignment
}

/** Emitted by onMove. */
interface KanbanMoveEvent<TColumnId extends string, TItemId extends string> {
  /** Items being moved. Includes multi-select batch. */
  itemIds: TItemId[];
  fromColumnId: TColumnId | null;
  toColumnId: TColumnId;
  /**
   * Keyboard vs pointer — consumers may want to animate or log differently.
   * null before the move type is determined.
   */
  via: 'pointer' | 'keyboard';
}

/** Emitted by onSelect on chip click. */
interface KanbanSelectEvent<TItemId extends string> {
  itemId: TItemId;
  /**
   * true when Shift is held — consumer should range-select from anchor.
   * false for plain toggle.
   */
  extend: boolean;
}

/** Passed to renderColumnHeader. */
interface KanbanColumnHeaderProps<TColumn extends KanbanColumnDef> {
  column: TColumn;
  itemCount: number;
}

/** Passed to renderChip. */
interface KanbanChipRenderProps<TItem extends KanbanItemDef> {
  item: TItem;
  isSelected: boolean;
  isPending: boolean;   // staged move not yet committed
}
```

---

## 5. dnd-kit sensor configuration

```ts
// internal — pdomain-ui configures this; consumers do not need to touch it
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
);
```

- `PointerSensor` activates on pointer down + 8px drag distance
  (avoids conflicting with click-to-select).
- `KeyboardSensor` with `sortableKeyboardCoordinates` covers Tab/Space/Arrow
  for a11y — emits `via: 'keyboard'` in `KanbanMoveEvent`.

---

## 6. Virtualization

Each `KanbanColumn` uses `@tanstack/react-virtual` (already in peerDeps via
existing worklist code) to virtualize its item list. Only visible rows are
rendered. Row height is fixed at 40px (one chip line); consumers can override
via `--kanban-chip-height` CSS custom property.

```ts
// internal per-column virtualization
const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => columnScrollRef.current,
  estimateSize: () => 40,
  overscan: 5,
});
```

When `@dnd-kit/sortable` is active, the virtualized item at the drag source
is replaced with a placeholder so the column height is stable during drag.

---

## 7. Styling

CSS classes (no inline styles except design-token color vars):

| Class | Element |
|---|---|
| `.kanban-board` | `KanbanBoard` root |
| `.kanban-column` | `KanbanColumn` root |
| `.kanban-column__header` | column header region |
| `.kanban-column__scroll` | virtualized scroll container |
| `.kanban-chip` | `PageChip` root |
| `.kanban-chip--selected` | selected state |
| `.kanban-chip--pending` | staged-but-not-committed state |
| `.kanban-chip--dragging` | active drag overlay clone |

All colors from design-system tokens. No hex literals.

---

## 8. Accessibility

- Each column's scroll region has `role="listbox"` and an `aria-label`
  derived from `column.label`; `aria-multiselectable` is set when an
  `onSelect` handler is wired. (This matches the established
  `role="listbox"`/`role="option"` convention used by `<WordList>` —
  `listbox`/`option` support selectable, focusable children, which
  `list`/`listitem` do not.)
- Each chip has `role="option"` with `aria-selected`.
- `KeyboardSensor` activates Space/Enter on a selected chip to start a
  keyboard drag; Arrow keys move to adjacent columns.
- Drag overlay (dnd-kit `<DragOverlay>`) renders an accessible description
  "Moving {count} chip(s) — use Arrow keys to choose a column, Enter to drop."

---

## 9. data-testid contract (trainer-spa)

The trainer-spa sets these on the two `KanbanColumn` instances:

| `data-testid` | Element |
|---|---|
| `kanban-detection-column` | Detection dataset `KanbanColumn` |
| `kanban-recognition-column` | Recognition dataset `KanbanColumn` |

The board does not emit any built-in testids — `KanbanColumn` and `PageChip`
accept `data-testid` pass-through only.

---

## 10. Trainer-spa wiring pattern

```tsx
// DatasetsPage.tsx (trainer-spa — illustrative, not normative)
import { KanbanBoard } from '@concavetrillion/pdomain-ui/primitives';
import { useKanbanStore } from '../stores/kanban-staging.js';
import type { DatasetPage, DatasetColumn } from '../api/types.js';

const columns: DatasetColumn[] = [
  { id: 'train', label: 'Train' },
  { id: 'val',   label: 'Validation' },
  { id: 'unassigned', label: 'Unassigned' },
];

export function DatasetsPage() {
  const { items, selectedIds, move, toggle, setAnchor } = useKanbanStore();

  return (
    <KanbanBoard
      columns={columns}
      items={items}
      selectedIds={selectedIds}
      onMove={({ itemIds, toColumnId }) => move(itemIds, toColumnId)}
      onSelect={({ itemId, extend }) => extend ? setAnchor(itemId) : toggle(itemId)}
      renderColumnHeader={({ column, itemCount }) => (
        <span>{column.label} <Badge>{itemCount}</Badge></span>
      )}
      renderChip={({ item, isPending }) => (
        <span className={isPending ? 'pending' : ''}>{item.id}</span>
      )}
    />
  );
}
```

The board does **not** call any API — commits go through the staging store's
`Apply` action.

---

## 11. Dependencies to add

```jsonc
// package.json — to be added
"@dnd-kit/core": "^6.0.0",
"@dnd-kit/sortable": "^7.0.0",
"@dnd-kit/utilities": "^3.0.0",
"@tanstack/react-virtual": "^3.0.0"
```

Note: `react-virtuoso` (already in `package.json`) is the existing worklist
virtualizer. The kanban columns use `@tanstack/react-virtual` because it
supports the absolute-positioned row layout that dnd-kit requires during drag.
Both packages can coexist.

---

## 12. Decisions

- **D-K1** The board is in `/primitives` subpath, not a new `/kanban` subpath.
  The component family is small; adding a subpath for three components would
  fragment the import surface unnecessarily.
- **D-K2** `onMove` receives a batch of `itemIds` to support multi-select drags.
  Single-item drags pass an array of length 1.
- **D-K3** The board does not manage selection state — it accepts `selectedIds`
  and emits `onSelect`. This follows the same inversion-of-control pattern as
  `PageImageCanvas`'s selection API.
- **D-K4** `PageChip` is exported for consumers that want to render a draggable
  chip outside a board context, but it depends on a dnd-kit `DndContext`
  ancestor being present.
- **D-K5** `isPending` is the board's way of rendering staged moves without
  knowing the staging semantics. The trainer-spa passes `isPending` in
  `renderChip` by checking its staging store.
- **D-K6** No built-in "Apply / Discard" affordance in pdomain-ui — that's SPA-level
  UX. The board is stateless with respect to commits.

## Adversarial Review

- **Stage:** Post-implementation retirement review.
- **Sources:** Repository implementation and tests, commit
  `84dcb62dceeb1cabe819d766990b062b7ea9f179`, git history, and the 2026-07-13
  docgraph migration analyzer.
- **Accepted findings:** Implementation is proven. Durable current behavior
  belongs in `docs/architecture/kanban-board.md` before this spec retires. The
  LogViewer prose reference must point to that architecture document.
- **Residual risks:** The unit suite mocks the virtualizer and does not exercise
  pointer or keyboard drag gestures end to end. Consumer verification remains
  important for large columns, multi-select dragging, and announcements.
