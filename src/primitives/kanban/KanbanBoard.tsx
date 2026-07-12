import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { cn } from '../cn.js';
import { KanbanColumn } from './KanbanColumn.js';
import type { KanbanBoardProps, KanbanColumnDef, KanbanItemDef } from './types.js';

function KanbanBoardInner<TColumn extends KanbanColumnDef, TItem extends KanbanItemDef>(
  props: KanbanBoardProps<TColumn, TItem>,
): React.ReactElement {
  const {
    columns,
    items,
    onMove,
    renderColumnHeader,
    renderChip,
    selectedIds,
    onSelect,
    className,
  } = props;

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** Index every item by id once per render so drag handlers are O(1). */
  const itemIndex = React.useMemo(() => {
    const idx = new Map<string, TItem>();
    for (const list of items.values()) {
      for (const it of list) idx.set(it.id, it);
    }
    return idx;
  }, [items]);

  const columnIds = React.useMemo(() => new Set(columns.map((c) => c.id)), [columns]);

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const draggedId = String(active.id) as TItem['id'];
      const dragged = itemIndex.get(draggedId);
      if (!dragged) return;

      const overId = String(over.id);
      const toColumnId = (columnIds.has(overId) ? overId : itemIndex.get(overId)?.columnId) as
        TColumn['id'] | undefined;
      if (toColumnId === undefined) return;

      const fromColumnId = dragged.columnId as TColumn['id'];
      if (fromColumnId === toColumnId) return;

      /* Move the whole multi-select batch when the dragged chip is part of
         the current selection; otherwise just the dragged chip. */
      const batch = selectedIds && selectedIds.has(draggedId) ? [...selectedIds] : [draggedId];

      const activatorIsKeyboard = event.activatorEvent instanceof KeyboardEvent;

      onMove({
        itemIds: batch,
        fromColumnId,
        toColumnId,
        via: activatorIsKeyboard ? 'keyboard' : 'pointer',
      });
    },
    [itemIndex, columnIds, selectedIds, onMove],
  );

  const activeItem = activeId ? itemIndex.get(activeId) : undefined;
  const activeCount = activeId && selectedIds && selectedIds.has(activeId) ? selectedIds.size : 1;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: () =>
            `Moving ${String(activeCount)} chip(s) — use Arrow keys to choose a column, Enter to drop.`,
          onDragOver: () => '',
          onDragEnd: () => 'Dropped.',
          onDragCancel: () => 'Move cancelled.',
        },
      }}
    >
      <div className={cn('kanban-board', className)}>
        {columns.map((column) => (
          <KanbanColumn<TColumn, TItem>
            key={column.id}
            column={column}
            items={items.get(column.id) ?? []}
            renderHeader={renderColumnHeader}
            renderChip={renderChip}
            {...(selectedIds !== undefined ? { selectedIds } : {})}
            {...(onSelect !== undefined ? { onSelect } : {})}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="kanban-chip kanban-chip--dragging">
            {renderChip({
              item: activeItem,
              isSelected: true,
              isPending: false,
            })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export const KanbanBoard = KanbanBoardInner as <
  TColumn extends KanbanColumnDef,
  TItem extends KanbanItemDef,
>(
  props: KanbanBoardProps<TColumn, TItem>,
) => React.ReactElement;
