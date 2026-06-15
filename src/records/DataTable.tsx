import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { cn } from '../primitives/cn.js';
import { EmptyState } from './EmptyState.js';
import type { DataTableColumn, DataTableSortState, RecordSelectionState } from './types.js';

export interface DataTableProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  columns: readonly DataTableColumn<T>[];
  onActivate?: (item: T) => void;
  selection?: RecordSelectionState<T>;
  sort?: DataTableSortState;
  onSortChange?: (sort: DataTableSortState) => void;
  loading?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

const interactiveSelector = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="radio"]',
  '[role="switch"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isActivationKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ';
}

function isEventFromInteractiveElement<T extends HTMLElement>(event: MouseEvent<T>) {
  const target = event.target;

  if (!(target instanceof Node) || !event.currentTarget.contains(target)) return true;

  const element = target instanceof Element ? target : target.parentElement;
  const interactiveElement = element?.closest(interactiveSelector);

  return interactiveElement != null && interactiveElement !== event.currentTarget;
}

function nextSort(current: DataTableSortState | undefined, key: string): DataTableSortState {
  if (current?.key === key && current.direction === 'asc') return { key, direction: 'desc' };
  return { key, direction: 'asc' };
}

export function DataTable<T>({
  items,
  getKey,
  columns,
  onActivate,
  selection,
  sort,
  onSortChange,
  loading = false,
  error,
  empty,
  ariaLabel,
  className,
}: DataTableProps<T>) {
  if (loading) return <div role="status">Loading records</div>;
  if (error) return <div role="alert">{error}</div>;
  if (items.length === 0) return <>{empty ?? <EmptyState title="No records" />}</>;

  return (
    <table className={cn('pdui-data-table', className)} aria-label={ariaLabel}>
      <thead>
        <tr>
          {columns.map((column) => {
            const sortKey = column.sortKey;
            const sorted =
              sortKey !== undefined && sort?.key === sortKey ? sort.direction : undefined;

            return (
              <th
                key={column.id}
                aria-sort={
                  sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                }
                data-align={column.align}
                data-hide-below={column.hideBelow}
                style={column.width ? { width: column.width } : undefined}
              >
                {sortKey !== undefined && onSortChange !== undefined ? (
                  <button type="button" onClick={() => onSortChange(nextSort(sort, sortKey))}>
                    Sort by {column.header}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const key = getKey(item);
          const disabled = selection?.isItemDisabled?.(item) ?? false;
          const selected = selection?.selectedKeys.has(key) ?? false;
          const activatable = Boolean(onActivate) && !disabled;

          return (
            <tr
              key={key}
              aria-disabled={disabled || undefined}
              aria-selected={selection !== undefined ? selected : undefined}
              tabIndex={activatable ? 0 : undefined}
              onClick={(event) => {
                if (!activatable || isEventFromInteractiveElement(event)) return;
                onActivate?.(item);
              }}
              onKeyDown={(event) => {
                if (
                  !activatable ||
                  event.target !== event.currentTarget ||
                  !isActivationKey(event)
                ) {
                  return;
                }

                event.preventDefault();
                onActivate?.(item);
              }}
            >
              {columns.map((column) => (
                <td key={column.id} data-align={column.align} data-hide-below={column.hideBelow}>
                  {column.cell(item)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
