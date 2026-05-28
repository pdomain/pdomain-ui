/**
 * TypeGrid — INTERNAL sub-component of BlockTypePickerPanel.
 *
 * NOT exported from the barrel. Renders a CSS grid of block-type buttons.
 * Each button shows an optional icon + label with `aria-pressed` on the active
 * option. Arrow-key focus management via roving tabindex.
 */
import * as React from 'react';
import { Icon } from '../../icons/Icon.js';
import type { IconName } from '../../icons/Icon.js';
import type { BlockTypeOption } from './BlockTypePickerPanel.js';
import { blockTypePickerOptionTestId } from '../../testids/index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TypeGridProps {
  types: ReadonlyArray<BlockTypeOption>;
  selectedType?: string | undefined;
  onSelect: (value: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * TypeGrid — internal grid of block-type option buttons.
 *
 * Arrow-key navigation: left/right/up/down move focus within the grid.
 * Tab cycles out. Each button carries aria-pressed to signal selection.
 */
export function TypeGrid({ types, selectedType, onSelect }: TypeGridProps): React.ReactElement {
  const cellRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = React.useRef<HTMLDivElement>(null);

  /**
   * Compute the current column count from the grid's rendered layout.
   * Falls back to 3 (default CSS auto-fill minimum) when layout is unavailable.
   */
  const getColCount = React.useCallback((): number => {
    const grid = gridRef.current;
    if (!grid) return 3;
    const style = getComputedStyle(grid);
    const cols = style.gridTemplateColumns.split(' ').filter(Boolean).length;
    return cols > 0 ? cols : 3;
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      const colCount = getColCount();
      let nextIdx: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIdx = idx + 1 < types.length ? idx + 1 : null;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = idx - 1 >= 0 ? idx - 1 : null;
      } else if (e.key === 'ArrowDown') {
        nextIdx = idx + colCount < types.length ? idx + colCount : null;
      } else if (e.key === 'ArrowUp') {
        nextIdx = idx - colCount >= 0 ? idx - colCount : null;
      }

      if (nextIdx !== null) {
        e.preventDefault();
        cellRefs.current[nextIdx]?.focus();
      }
    },
    [types.length, getColCount],
  );

  return (
    <div ref={gridRef} className="type-grid" role="group">
      {types.map((t, idx) => {
        const isSelected = t.value === selectedType;
        return (
          <button
            key={t.value}
            ref={(el) => {
              cellRefs.current[idx] = el;
            }}
            type="button"
            className={`type-grid__cell${isSelected ? ' type-grid__cell--selected' : ''}`}
            aria-pressed={isSelected}
            tabIndex={isSelected || (selectedType == null && idx === 0) ? 0 : -1}
            onClick={() => {
              onSelect(t.value);
            }}
            onKeyDown={(e) => {
              handleKeyDown(e, idx);
            }}
            data-testid={blockTypePickerOptionTestId(t.value)}
            title={t.description}
          >
            {t.icon != null ? (
              <span className="type-grid__cell-icon" aria-hidden="true">
                <Icon name={t.icon as IconName} size={14} />
              </span>
            ) : null}
            <span className="type-grid__cell-label">{t.label}</span>
            {t.description != null ? (
              <span className="type-grid__cell-description">{t.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

TypeGrid.displayName = 'TypeGrid';
