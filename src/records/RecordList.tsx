/* eslint-disable jsx-a11y/no-static-element-interactions -- The actions slot wrapper only stops event propagation so nested controls do not activate the row. */
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../primitives/cn.js';
import { EmptyState } from './EmptyState.js';
import type { RecordDensity, RecordSelectionState } from './types.js';

export interface RecordListProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  renderPrimary: (item: T) => ReactNode;
  renderSecondary?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
  renderStatus?: (item: T) => ReactNode;
  renderActions?: (item: T) => ReactNode;
  onActivate?: (item: T) => void;
  selection?: RecordSelectionState<T>;
  loading?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  density?: RecordDensity;
  ariaLabel?: string;
  className?: string;
}

function isActivationKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ';
}

function getAccessibleLabel(node: ReactNode) {
  return typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;
}

export function RecordList<T>({
  items,
  getKey,
  renderPrimary,
  renderSecondary,
  renderMeta,
  renderStatus,
  renderActions,
  onActivate,
  selection,
  loading = false,
  error,
  empty,
  density = 'comfortable',
  ariaLabel,
  className,
}: RecordListProps<T>) {
  const rootClassName = cn('pdui-record-list', className);

  if (loading) {
    return (
      <div className={rootClassName} role="status">
        Loading records
      </div>
    );
  }

  if (error) {
    return (
      <div className={rootClassName} role="alert">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={rootClassName} data-density={density}>
        {empty ?? <EmptyState title="No records" />}
      </div>
    );
  }

  const selectable = selection !== undefined;
  const listRole = selectable ? 'listbox' : 'list';
  const itemRole = selectable ? 'option' : 'listitem';

  return (
    <div className={rootClassName} data-density={density} role={listRole} aria-label={ariaLabel}>
      {items.map((item) => {
        const key = getKey(item);
        const primary = renderPrimary(item);
        const disabled = selection?.isItemDisabled?.(item) ?? false;
        const selected = selection?.selectedKeys.has(key) ?? false;
        const activatable = Boolean(onActivate) && !disabled;

        return (
          <div
            key={key}
            className="pdui-record-list__item"
            role={itemRole}
            aria-label={getAccessibleLabel(primary)}
            aria-selected={selectable ? selected : undefined}
            aria-disabled={disabled || undefined}
            tabIndex={activatable ? 0 : undefined}
            onClick={() => {
              if (!activatable) return;
              onActivate?.(item);
            }}
            onKeyDown={(event) => {
              if (!activatable || !isActivationKey(event)) return;
              event.preventDefault();
              onActivate?.(item);
            }}
          >
            <div className="pdui-record-list__content">
              <div className="pdui-record-list__primary">{primary}</div>
              {renderSecondary ? (
                <div className="pdui-record-list__secondary">{renderSecondary(item)}</div>
              ) : null}
              {renderMeta ? <div className="pdui-record-list__meta">{renderMeta(item)}</div> : null}
            </div>
            {renderStatus ? (
              <div className="pdui-record-list__status">{renderStatus(item)}</div>
            ) : null}
            {renderActions ? (
              <div
                className="pdui-record-list__actions"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
              >
                {renderActions(item)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
