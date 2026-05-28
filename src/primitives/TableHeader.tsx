import * as React from 'react';
import { cn } from './cn.js';

export type SortDir = 'asc' | 'desc';

export interface TableColumnDef {
  /** Unique column identifier — used as the sort key. */
  id: string;
  /** Visible column label. */
  label: string;
  /** Whether clicking this column triggers onSort. Defaults to false. */
  sortable?: boolean;
  /** Optional CSS width / flex-basis for the column cell. */
  width?: string;
}

export interface TableHeaderProps {
  /** Column definitions to render. */
  columns: TableColumnDef[];
  /** Id of the currently sorted column. */
  sortKey?: string;
  /** Current sort direction. */
  sortDir?: SortDir;
  /**
   * Called when the user clicks a sortable column.
   * Receives the column id and the next direction (toggles asc→desc→asc).
   */
  onSort?: (columnId: string, nextDir: SortDir) => void;
  className?: string;
}

/**
 * TableHeader — column label row with optional sort controls.
 *
 * Renders `<div role="row">` header cells; each sortable cell is a button
 * that calls `onSort` with the next direction.  Used in wf03/wf11/wf-pw
 * page-list table views.
 * Token-only styling; no hex literals.
 *
 * WS6: sortable cells now carry aria-sort and respond to Enter/Space keyboard
 * activation in addition to click.
 */
export function TableHeader({
  columns,
  sortKey,
  sortDir,
  onSort,
  className,
}: TableHeaderProps): React.ReactElement {
  function handleCellActivate(col: TableColumnDef): void {
    if (!col.sortable || onSort == null) return;
    const next: SortDir = sortKey === col.id && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(col.id, next);
  }

  // WS6: keyboard activation for sortable column headers (Enter / Space)
  function handleCellKeyDown(e: React.KeyboardEvent<HTMLDivElement>, col: TableColumnDef): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCellActivate(col);
    }
  }

  return (
    <div className={cn('table-header', className)} role="row">
      {columns.map((col) => {
        const isActive = sortKey === col.id;

        // WS6: compute aria-sort for sortable columns.
        // Active column: ascending/descending; sortable-but-not-active: 'none'.
        let ariaSort: React.AriaAttributes['aria-sort'] | undefined;
        if (col.sortable) {
          if (isActive && sortDir != null) {
            ariaSort = sortDir === 'asc' ? 'ascending' : 'descending';
          } else {
            ariaSort = 'none';
          }
        }

        const cellProps: React.HTMLAttributes<HTMLDivElement> & {
          onClick?: React.MouseEventHandler;
          onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
          role?: string;
          tabIndex?: number;
          'aria-sort'?: React.AriaAttributes['aria-sort'];
          'data-sort'?: string;
          style?: React.CSSProperties;
        } = {
          className: cn(
            'table-header__cell',
            col.sortable ? 'table-header__cell--sortable' : undefined,
            isActive ? 'table-header__cell--active' : undefined,
          ),
          role: 'columnheader',
          ...(ariaSort !== undefined ? { 'aria-sort': ariaSort } : {}),
          ...(col.width != null ? { style: { width: col.width } } : {}),
        };

        if (isActive && sortDir != null) {
          cellProps['data-sort'] = sortDir;
        }

        if (col.sortable && onSort != null) {
          cellProps.onClick = () => handleCellActivate(col);
          cellProps.onKeyDown = (e) => handleCellKeyDown(e, col);
          cellProps.tabIndex = 0;
        }

        return (
          <div key={col.id} {...cellProps}>
            {col.label}
            {col.sortable && isActive ? (
              <span className="table-header__sort-icon" aria-hidden="true">
                {sortDir === 'asc' ? '↑' : '↓'}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

TableHeader.displayName = 'TableHeader';
