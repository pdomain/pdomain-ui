import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../cn.js';
import { PageChip } from './PageChip.js';
import type { KanbanColumnDef, KanbanColumnProps, KanbanItemDef } from './types.js';

const DEFAULT_ROW_HEIGHT = 40;

function KanbanColumnInner<TColumn extends KanbanColumnDef, TItem extends KanbanItemDef>(
  props: KanbanColumnProps<TColumn, TItem>,
): React.ReactElement {
  'use no memo'; // TanStack Virtual exposes mutable functions that cannot be memoized safely.

  const { column, items, renderHeader, renderChip, selectedIds, onSelect, className } = props;
  const testid = props['data-testid'];

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  // eslint-disable-next-line react-hooks/incompatible-library -- use no memo keeps TanStack Virtual outside compiler memoization.
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => DEFAULT_ROW_HEIGHT,
    overscan: 5,
  });

  const itemIds = React.useMemo(() => items.map((it) => it.id), [items]);

  const handleChipSelect = React.useCallback(
    (itemId: TItem['id'], extend: boolean) => {
      onSelect?.({ itemId, extend });
    },
    [onSelect],
  );

  return (
    <div
      ref={setNodeRef}
      data-testid={testid}
      data-over={isOver ? '' : undefined}
      className={cn('kanban-column', className)}
    >
      <div className="kanban-column__header">
        {renderHeader({ column, itemCount: items.length })}
      </div>
      <div
        ref={scrollRef}
        role="listbox"
        aria-label={column.label}
        aria-multiselectable={onSelect ? true : undefined}
        className="kanban-column__scroll"
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div
            style={{
              height: `${String(rowVirtualizer.getTotalSize())}px`,
              position: 'relative',
              width: '100%',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              if (!item) return null;
              const isSelected = selectedIds?.has(item.id) ?? false;
              return (
                <div
                  key={item.id}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${String(virtualRow.size)}px`,
                    transform: `translateY(${String(virtualRow.start)}px)`,
                  }}
                >
                  <PageChip
                    id={item.id}
                    isSelected={isSelected}
                    isPending={false}
                    isDragging={false}
                    {...(onSelect
                      ? {
                          onSelect: (extend: boolean) => {
                            handleChipSelect(item.id, extend);
                          },
                        }
                      : {})}
                  >
                    {renderChip({ item, isSelected, isPending: false })}
                  </PageChip>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export const KanbanColumn = KanbanColumnInner as <
  TColumn extends KanbanColumnDef,
  TItem extends KanbanItemDef,
>(
  props: KanbanColumnProps<TColumn, TItem>,
) => React.ReactElement;
