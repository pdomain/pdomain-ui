import * as React from 'react';
import { Icon } from '../../icons/Icon.js';
import { SCANNO_NAV_GROUP, SCANNO_NAV_GROUP_COUNT } from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Props for the NavGroup component. */
export interface NavGroupProps {
  /** Category label displayed in the group header. */
  label: string;
  /**
   * Optional count shown as a small badge to the right of the label.
   * Omit or pass `undefined` to hide the badge.
   */
  count?: number;
  /** Whether the group is currently expanded (showing children). */
  expanded: boolean;
  /** Callback fired when the header button is clicked. */
  onToggle: () => void;
  /** Child nav items to render inside the group (visible only when expanded). */
  children?: React.ReactNode;
  /** Override the root testid; defaults to `SCANNO_NAV_GROUP`. */
  'data-testid'?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * NavGroup — side-nav category group header with expand/collapse.
 *
 * Used in the Scannos rule-library left nav.  Renders a `<button>` header
 * with `aria-expanded` and an optional count badge.  Children appear inside a
 * `<ul>` only when the group is expanded.
 *
 * Design source: wf05b/scanno-configure.jsx lines 236-263.
 */
export function NavGroup({
  label,
  count,
  expanded,
  onToggle,
  children,
  'data-testid': testId = SCANNO_NAV_GROUP,
}: NavGroupProps) {
  return (
    <div className="scanno-nav-group" data-testid={testId}>
      {/* ── Group header button ─────────────────────────────────────────── */}
      <button
        type="button"
        className="scanno-nav-group__header"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {/* Chevron icon: right = collapsed, down = expanded */}
        <Icon
          name={expanded ? 'chevD' : 'chevR'}
          size={12}
          className="scanno-nav-group__chevron"
          aria-hidden
        />

        {/* Label */}
        <span className="scanno-nav-group__label">{label}</span>

        {/* Count badge — rendered only when count is provided */}
        {count !== undefined && (
          <span className="scanno-nav-group__count" data-testid={SCANNO_NAV_GROUP_COUNT}>
            {count}
          </span>
        )}
      </button>

      {/* ── Children — visible only when expanded ───────────────────────── */}
      {expanded && <ul className="scanno-nav-group__list">{children}</ul>}
    </div>
  );
}

NavGroup.displayName = 'NavGroup';
