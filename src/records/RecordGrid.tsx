import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { cn } from '../primitives/cn.js';
import { EmptyState } from './EmptyState.js';
import type { RecordSelectionState } from './types.js';

export interface RecordGridProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  onActivate?: (item: T) => void;
  selection?: RecordSelectionState<T>;
  loading?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  minCardWidth?: string;
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

function getAccessibleLabel(node: ReactNode) {
  return typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;
}

function isEventFromInteractiveElement<T extends HTMLElement>(event: MouseEvent<T>) {
  const target = event.target;

  if (!(target instanceof Node) || !event.currentTarget.contains(target)) return true;

  const element = target instanceof Element ? target : target.parentElement;
  const interactiveElement = element?.closest(interactiveSelector);

  return interactiveElement != null && interactiveElement !== event.currentTarget;
}

export function RecordGrid<T>({
  items,
  getKey,
  renderCard,
  onActivate,
  selection,
  loading = false,
  error,
  empty,
  minCardWidth = '14rem',
  ariaLabel,
  className,
}: RecordGridProps<T>) {
  const rootClassName = cn('pdui-record-grid', className);
  const gridStyle = { '--pdui-record-grid-min': minCardWidth } as CSSProperties;

  if (loading) {
    return (
      <div className={rootClassName} role="status" style={gridStyle}>
        Loading records
      </div>
    );
  }

  if (error) {
    return (
      <div className={rootClassName} role="alert" style={gridStyle}>
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={rootClassName} style={gridStyle}>
        {empty ?? <EmptyState title="No records" />}
      </div>
    );
  }

  const selectable = selection !== undefined;
  const rootRole = selectable ? 'grid' : 'list';
  const itemRole = selectable ? 'row' : 'listitem';

  return (
    <div
      className={rootClassName}
      role={rootRole}
      aria-label={ariaLabel}
      data-layout="grid"
      style={gridStyle}
    >
      {items.map((item) => {
        const key = getKey(item);
        const card = renderCard(item);
        const disabled = selection?.isItemDisabled?.(item) ?? false;
        const selected = selection?.selectedKeys.has(key) ?? false;
        const activatable = Boolean(onActivate) && !disabled;

        return (
          <div
            key={key}
            className="pdui-record-grid__item"
            role={itemRole}
            aria-label={getAccessibleLabel(card)}
            aria-disabled={disabled || undefined}
            aria-selected={selectable ? selected : undefined}
            tabIndex={activatable ? 0 : undefined}
            onClick={(event) => {
              if (!activatable || isEventFromInteractiveElement(event)) return;
              onActivate?.(item);
            }}
            onKeyDown={(event) => {
              if (!activatable || event.target !== event.currentTarget || !isActivationKey(event)) {
                return;
              }

              event.preventDefault();
              onActivate?.(item);
            }}
          >
            {selectable ? (
              <div className="pdui-record-grid__cell" role="gridcell">
                {card}
              </div>
            ) : (
              card
            )}
          </div>
        );
      })}
    </div>
  );
}
