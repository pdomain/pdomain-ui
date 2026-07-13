---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Kanban board

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** using or changing KanbanBoard, KanbanColumn, PageChip, selection, drag-and-drop, or column virtualization.
- **Search terms:** KanbanBoard, KanbanColumn, PageChip, dnd-kit, virtualization, multi-select drag.

## Current design

`KanbanBoard` composes typed columns and items while the consumer owns data,
selection, staging, and persistence. A move emits item ids, source and target
column ids, and whether pointer or keyboard input initiated it. Dragging a
selected item moves the selected batch; dragging an unselected item moves only
that item.

Each `KanbanColumn` is a droppable, virtualized listbox. It renders fixed-height
40-pixel rows with five-row overscan through `@tanstack/react-virtual`.
`PageChip` is a sortable option with selected, pending, and dragging states.
Columns and chips accept caller-provided test ids; the family defines no
application-specific built-in ids.

Pointer dragging starts after eight pixels. Keyboard dragging uses dnd-kit's
sortable coordinate getter and accessible announcements. The board does not
call an API or provide Apply and Discard controls.

## Durable decisions

- Export the component family from the primitives surface.
- Keep selection and persistence under consumer control.
- Emit batch item ids so multi-select moves do not need a second API.
- Keep staged-move presentation generic through `isPending`.
- Keep application-specific commit controls outside the shared library.

## Evidence

- Code: `src/primitives/kanban/KanbanBoard.tsx`,
  `src/primitives/kanban/KanbanColumn.tsx`,
  `src/primitives/kanban/PageChip.tsx`, `src/primitives/kanban/types.ts`
- Tests: `src/primitives/kanban/KanbanBoard.test.tsx` — column rendering and
  counts, render slots, controlled selection, Shift selection, caller test ids,
  listbox labeling, option states, and dragging class
- Commit: `84dcb62dceeb1cabe819d766990b062b7ea9f179` (component family)
- Verified: 2026-07-13 by repository code, tests, history, and docgraph migration analysis

