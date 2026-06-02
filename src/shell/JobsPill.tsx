/**
 * JobsPill — header-anchored jobs indicator molecule.
 *
 * Ported from docs/templates/design_handoff_pdomain_ui/design-system/template.jsx
 * per OQ-5 decision: port into src/shell/ alongside AppHeader, JobsDrawer, JobRow.
 *
 * After M5: the inline hover popover has been removed. Clicking the pill calls
 * `onClick` (the consumer wires this to `useUtilityDock().toggle('jobs')`).
 * The props `open`, `onViewAll`, and `hoverPopover` are @deprecated and ignored
 * (retained one release for back-compat compilation).
 *
 * States:
 *  - idle: muted, Package icon, no count (no active jobs)
 *  - running: accent-bordered pill with pulse dot + count badge
 */

import * as React from 'react';
import { Package } from '../icons/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveJob {
  id: string;
  title: string;
  phase: string;
  /** Progress 0–100 */
  pct: number;
  project: string;
}

export interface JobsPillProps {
  /** Currently running jobs. Empty array = idle state. */
  activeJobs?: ActiveJob[];
  /**
   * @deprecated Retained one release; ignored. The inline popover was removed
   * in M5 — the jobs dock surface replaced it.
   */
  open?: boolean;
  /** Called when the pill button is clicked. */
  onClick?: () => void;
  /**
   * @deprecated Retained one release; ignored. The "View all" action now lives
   * inside JobsPanelBody.
   */
  onViewAll?: () => void;
  /**
   * @deprecated Retained one release; ignored. Hover popover was removed in M5.
   * The jobs dock surface replaced it.
   */
  hoverPopover?: boolean;
  className?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// All colors use var(--token) only — no hex literals.

const pillButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 26,
  padding: '0 9px',
  borderRadius: 6,
  background: isActive ? 'color-mix(in oklab, var(--ocr) 12%, transparent)' : 'transparent',
  border: `1px solid ${isActive ? 'color-mix(in oklab, var(--ocr) 35%, transparent)' : 'transparent'}`,
  color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'var(--ui-font)',
});

const pulseDotStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 99,
  background: 'var(--ocr)',
  animation: 'pgd-pulse 1.4s ease-in-out infinite',
  flexShrink: 0,
};

const countBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '1px 5px',
  borderRadius: 4,
  background: 'var(--ocr)',
  color: 'var(--accent-ink)',
  fontWeight: 600,
  fontFamily: 'var(--mono-font)',
};

// ─── JobsPill ─────────────────────────────────────────────────────────────────

export function JobsPill({
  activeJobs = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  open: _open = false, // @deprecated — ignored; retained one release
  onClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onViewAll: _onViewAll, // @deprecated — ignored; retained one release
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hoverPopover: _hoverPopover = false, // @deprecated — ignored; retained one release
  className,
}: JobsPillProps) {
  const isActive = activeJobs.length > 0;
  return (
    <button
      type="button"
      className={className}
      aria-label={isActive ? `Jobs – ${activeJobs.length} active` : 'Jobs'}
      style={pillButtonStyle(isActive)}
      onClick={onClick}
    >
      {isActive ? (
        <span data-testid="jobs-pill-pulse" aria-hidden="true" style={pulseDotStyle} />
      ) : (
        <Package size={13} aria-hidden="true" />
      )}
      Jobs
      {isActive ? (
        <span data-testid="jobs-pill-count" aria-hidden="true" style={countBadgeStyle}>
          {activeJobs.length}
        </span>
      ) : null}
    </button>
  );
}

JobsPill.displayName = 'JobsPill';
