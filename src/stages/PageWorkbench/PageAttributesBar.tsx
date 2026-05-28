/**
 * PageAttributesBar — Phase 2 M2 (PageWorkbench row §6.2).
 *
 * Horizontal pill-strip of per-page attribute (key=value) chips.
 * Clicking a chip opens AttrEditorPopover for inline value editing.
 * Collapsible: when collapsed shows only "Attributes (N)" pill.
 *
 * AttrEditorPopover is an internal sub-component — NOT exported separately.
 */
import * as React from 'react';
import { Icon } from '../../icons/Icon.js';
import { AttrEditorPopover } from './AttrEditorPopover.js';

// ── Public types ──────────────────────────────────────────────────────────────

export interface PageAttribute {
  /** Stable id for React key + onChange routing. */
  id: string;
  /** Display label (e.g. "Skew", "DPI", "Lang"). */
  label: string;
  /** Current value as a string (consumers format/parse before/after). */
  value: string;
  /** Optional editor mode hint — drives the popover input type. Default: 'text'. */
  editor?: 'text' | 'number' | 'select';
  /** When editor='select', the choices to render. */
  options?: ReadonlyArray<{ value: string; label: string }>;
  /** When true, render as read-only (chip is clickable but no popover opens). */
  readOnly?: boolean;
}

export interface PageAttributesBarProps {
  attrs: ReadonlyArray<PageAttribute>;
  onChange: (id: string, nextValue: string) => void;
  /**
   * Default-collapsed? Renders only count + expand icon when collapsed.
   * Default: false.
   */
  defaultCollapsed?: boolean;
  'data-testid'?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PageAttributesBar({
  attrs,
  onChange,
  defaultCollapsed = false,
  'data-testid': testId = 'page-attributes-bar',
}: PageAttributesBarProps): React.ReactElement {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [openChipId, setOpenChipId] = React.useState<string | null>(null);
  // Unique id for aria-controls wiring between the toggle button and chip list.
  const chipListId = React.useId();

  const handleCommit = React.useCallback(
    (id: string, nextValue: string) => {
      onChange(id, nextValue);
      setOpenChipId(null);
    },
    [onChange],
  );

  const handleOpenChange = React.useCallback(
    (id: string) => (open: boolean) => {
      setOpenChipId(open ? id : null);
    },
    [],
  );

  return (
    <div className="page-attributes-bar" data-testid={testId}>
      {/* Collapse toggle */}
      <button
        className="page-attributes-bar__toggle"
        aria-expanded={!collapsed}
        aria-controls={chipListId}
        aria-label={collapsed ? 'Expand attributes' : 'Collapse attributes'}
        data-testid="page-attributes-bar-toggle"
        onClick={() => setCollapsed((c) => !c)}
      >
        <Icon name={collapsed ? 'chevR' : 'chevD'} size={14} />
        {collapsed && (
          <span className="page-attributes-bar__count">Attributes ({attrs.length})</span>
        )}
      </button>

      {/* Expanded chip strip */}
      {!collapsed && attrs.length > 0 && (
        <ul id={chipListId} className="page-attributes-bar__chips">
          {attrs.map((attr) => {
            const chipTestId = `page-attr-chip-${attr.id}`;
            const isOpen = openChipId === attr.id;
            const isReadOnly = attr.readOnly === true;

            const chip = (
              <button
                className={[
                  'page-attributes-bar__chip',
                  isReadOnly ? 'page-attributes-bar__chip--readonly' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-testid={chipTestId}
                aria-label={`${attr.label}: ${attr.value}${isReadOnly ? ' (read-only)' : ''}`}
                aria-pressed={!isReadOnly ? isOpen : undefined}
                onClick={
                  isReadOnly
                    ? undefined
                    : () => setOpenChipId((prev) => (prev === attr.id ? null : attr.id))
                }
              >
                <span className="page-attributes-bar__chip-label">{attr.label}</span>
                <span className="page-attributes-bar__chip-sep">:</span>
                <span className="page-attributes-bar__chip-value">{attr.value}</span>
              </button>
            );

            if (isReadOnly) {
              return (
                <li key={attr.id} className="page-attributes-bar__item">
                  {chip}
                </li>
              );
            }

            return (
              <li key={attr.id} className="page-attributes-bar__item">
                <AttrEditorPopover
                  attr={attr}
                  open={isOpen}
                  onOpenChange={handleOpenChange(attr.id)}
                  onCommit={(next) => handleCommit(attr.id, next)}
                >
                  {chip}
                </AttrEditorPopover>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

PageAttributesBar.displayName = 'PageAttributesBar';
