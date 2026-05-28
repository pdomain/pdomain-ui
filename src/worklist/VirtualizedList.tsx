/**
 * VirtualizedList — generic internal base for WordList, LineList, PageList.
 *
 * Shared keyboard navigation + virtuoso rendering machinery.
 * Not exported from the worklist barrel — internal use only.
 */

import * as React from 'react';
import { Virtuoso } from 'react-virtuoso';

export interface VirtualizedListProps<TItem> {
  items: TItem[];
  selectedIndex?: number | null | undefined;
  onSelect?: ((index: number) => void) | undefined;
  'aria-label'?: string | undefined;
  className?: string | undefined;
  renderItem: (item: TItem, index: number, isSelected: boolean) => React.ReactNode;
  defaultAriaLabel: string;
  /**
   * Optional slot rendered when `items` is empty.
   * Replaces the virtualized list content; the listbox wrapper is still present.
   */
  emptySlot?: React.ReactNode;
}

// Stable id prefix derived from React.useId for aria-activedescendant wiring.
const OPTION_ID_PREFIX = 'vl-opt';

function VirtualizedListInner<TItem>(
  {
    items,
    selectedIndex: controlledSelectedIndex,
    onSelect,
    'aria-label': ariaLabel,
    className,
    renderItem,
    defaultAriaLabel,
    emptySlot,
  }: VirtualizedListProps<TItem>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const uid = React.useId();
  const [internalIndex, setInternalIndex] = React.useState<number | null>(null);

  const isControlled = controlledSelectedIndex !== undefined;
  const selectedIndex = isControlled ? controlledSelectedIndex : internalIndex;

  // Clamp internal index when items shrink (e.g. after filtering).
  // Controlled callers are responsible for clamping their own selectedIndex prop.
  React.useEffect(() => {
    if (!isControlled) {
      setInternalIndex((prev) => {
        if (prev === null) return null;
        if (items.length === 0) return null;
        return prev >= items.length ? items.length - 1 : prev;
      });
    }
  }, [isControlled, items.length]);

  const handleSelect = React.useCallback(
    (idx: number) => {
      if (!isControlled) {
        setInternalIndex(idx);
      }
      onSelect?.(idx);
    },
    [isControlled, onSelect],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const current = selectedIndex ?? -1;
        if (current < items.length - 1) {
          handleSelect(current + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const current = selectedIndex ?? 0;
        if (current > 0) {
          handleSelect(current - 1);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex !== null && selectedIndex !== undefined && selectedIndex < items.length) {
          handleSelect(selectedIndex);
        }
      }
    },
    [items.length, selectedIndex, handleSelect],
  );

  /** Stable element id for a given row, used for aria-activedescendant. */
  const optionId = (index: number) => `${OPTION_ID_PREFIX}-${uid}-${index}`;

  const renderRow = React.useCallback(
    (index: number, item: TItem) => {
      const isSelected = selectedIndex === index;
      const content = renderItem(item, index, isSelected);

      return (
        <div
          key={index}
          id={optionId(index)}
          role="option"
          aria-selected={isSelected}
          // Roving tabIndex: only the active option is in the tab order.
          tabIndex={isSelected ? 0 : -1}
          onClick={() => {
            handleSelect(index);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect(index);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          {content}
        </div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIndex, renderItem, handleSelect, uid],
  );

  // Compute the active-descendant id: point at the selected option element.
  const activeDescendant =
    selectedIndex !== null && selectedIndex !== undefined && selectedIndex < items.length
      ? optionId(selectedIndex)
      : undefined;

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={ariaLabel ?? defaultAriaLabel}
      aria-activedescendant={activeDescendant}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`virtualized-list${className ? ` ${className}` : ''}`}
      style={{
        outline: 'none',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {items.length === 0 && emptySlot !== undefined ? (
        emptySlot
      ) : (
        <Virtuoso<TItem> data={items} itemContent={renderRow} style={{ flex: 1 }} />
      )}
    </div>
  );
}

// Cast forwardRef output to generic function signature
export const VirtualizedList = React.forwardRef(VirtualizedListInner) as <TItem>(
  props: VirtualizedListProps<TItem> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
