import * as React from 'react';
import { Button } from '../../primitives/Button.js';
import {
  VALIDATION_PANEL_TOOLBAR,
  VALIDATION_PANEL_TOOLBAR_REVALIDATE,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanelToolbarProps {
  /** ISO string, Date object, or null/undefined = never validated. */
  lastRun?: Date | string | null;
  /** Called when the Re-validate button is clicked. */
  onRevalidate: () => void;
  'data-testid'?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a Date or ISO string as a relative label.
 * No external dep — covers the common cases well enough for Phase 2.
 */
function formatLastRun(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return 'Unknown time';

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Validation stage panel toolbar.
 *
 * Shows the last-run timestamp (or "Never validated") and a Re-validate
 * button that triggers `onRevalidate`.
 *
 * Design ref: wf02/validation-panel.jsx lines 150-168.
 */
export function PanelToolbar({
  lastRun,
  onRevalidate,
  'data-testid': testId = VALIDATION_PANEL_TOOLBAR,
}: PanelToolbarProps): React.ReactElement {
  const lastRunLabel = lastRun != null ? `Last run ${formatLastRun(lastRun)}` : 'Never validated';

  return (
    <div data-testid={testId} className="panel-toolbar">
      <span className="panel-toolbar__timestamp">{lastRunLabel}</span>
      <span className="panel-toolbar__sep" aria-hidden="true">
        ·
      </span>
      <span className="panel-toolbar__hint">Auto re-runs after fixes</span>
      <div style={{ flex: 1 }} />
      <Button
        variant="ghost"
        size="sm"
        onClick={onRevalidate}
        data-testid={VALIDATION_PANEL_TOOLBAR_REVALIDATE}
      >
        Re-validate
      </Button>
    </div>
  );
}

PanelToolbar.displayName = 'PanelToolbar';
