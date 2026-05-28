import * as React from 'react';
import { CheckIcon } from '../../primitives/CheckIcon.js';
import { PageChip } from '../../primitives/PageChip.js';
import { Icon } from '../../icons/Icon.js';
import { VALIDATION_CHECK_ROW, validationCheckRowTestId } from '../../testids/index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

/** A single affected page entry. */
export interface CheckRowPage {
  id: string;
  prefix: string;
}

/** The check descriptor passed to CheckRow. */
export interface CheckRowCheck {
  id: string;
  name: string;
  state: 'pass' | 'warn' | 'error' | 'running' | 'skip';
  affectedPages?: Array<CheckRowPage>;
}

export interface CheckRowProps {
  /** The validation check to display. */
  check: CheckRowCheck;
  /** Whether the row is currently expanded (controlled). */
  expanded: boolean;
  /** Called with `check.id` when the user toggles the row. */
  onToggle: (id: string) => void;
  /** Whether this is the last row (suppresses bottom border). */
  lastRow?: boolean;
  /** Forwarded to the root element for Playwright targeting. */
  'data-testid'?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLLAPSED_MAX = 5;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CheckRow — collapsible validation check row.
 *
 * Collapsed: shows check name + CheckIcon + up to 5 PageChips (+ overflow badge).
 * Expanded: shows full affected-page list in a `<ul>`.
 *
 * The row toggle is a `<button>` — keyboard accessible (Enter / Space).
 *
 * Design ref: wf02/validation-panel.jsx lines 42-100.
 */
export function CheckRow({
  check,
  expanded,
  onToggle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lastRow: _lastRow, // kept in API; border suppression is via CSS :last-child
  'data-testid': testId,
}: CheckRowProps): React.ReactElement {
  const { id, name, state, affectedPages } = check;
  const pages = affectedPages ?? [];

  const handleToggle = React.useCallback(() => {
    onToggle(id);
  }, [id, onToggle]);

  // Collapsed chips — up to COLLAPSED_MAX, then overflow badge
  const collapsedChips = pages.slice(0, COLLAPSED_MAX);
  const overflow = pages.length - COLLAPSED_MAX;

  // Expanded full list
  const expandedPages = pages;

  const canToggle = state !== 'pass' && state !== 'running';

  return (
    <div
      data-testid={testId ?? validationCheckRowTestId(id)}
      data-check-row={VALIDATION_CHECK_ROW}
      className={['check-row', expanded ? 'check-row--expanded' : ''].filter(Boolean).join(' ')}
    >
      {/* Row header */}
      <button
        type="button"
        {...(canToggle ? { 'aria-expanded': expanded } : {})}
        onClick={handleToggle}
        className="check-row__trigger"
      >
        <CheckIcon state={state} />
        <div className="check-row__meta">
          <span className="check-row__name">{name}</span>
          {/* Collapsed page chips */}
          {!expanded && collapsedChips.length > 0 && (
            <span
              style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}
            >
              {collapsedChips.map((page) => (
                <PageChip key={page.id} prefix={page.prefix} />
              ))}
              {overflow > 0 && <span className="check-row__hint">+{overflow} more</span>}
            </span>
          )}
        </div>
        {canToggle && (
          <span
            style={{ color: 'var(--ink-4)', flexShrink: 0, display: 'inline-flex' }}
            aria-hidden="true"
          >
            <Icon name={expanded ? 'chevD' : 'chevR'} size={14} />
          </span>
        )}
      </button>

      {/* Expanded affected-pages region */}
      {expanded && expandedPages.length > 0 && (
        <div className="check-row__body">
          <div className="check-row__hint">Affected pages</div>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {expandedPages.map((page) => (
              <li key={page.id}>
                <PageChip prefix={page.prefix} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

CheckRow.displayName = 'CheckRow';
