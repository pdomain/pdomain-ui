import * as React from 'react';
import { HJDecisionCard } from './HJDecisionCard.js';
import { HJStatusPill } from './HJStatusPill.js';
import type { HJDecisionCase, HJDecisionCardProps } from './HJDecisionCard.js';
import { HYPHEN_UNDECIDED, hyphenUndecidedItemTestId } from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Subset of HJDecisionCardProps that represent the consolidated decision handler
 * passed through to HJDecisionCard in the detail pane.
 */
export type HJDecisionHandlers = Pick<
  HJDecisionCardProps,
  'onAccept' | 'onKeep' | 'onFlag' | 'onNext' | 'onPrev'
>;

export interface HyphenUndecidedProps {
  /** Full list of undecided hyphen-join cases to show in the queue sidebar. */
  cases: HJDecisionCase[];
  /**
   * Id of the currently focused case. When undefined, the right pane shows
   * an empty-state placeholder instead of a HJDecisionCard.
   */
  selectedId?: string | undefined;
  /** Invoked with the case id when the user clicks a sidebar row. */
  onSelect: (id: string) => void;
  /**
   * Consolidated decision-handler bag passed verbatim to HJDecisionCard.
   * Omit to render the card in read-only mode (buttons still visible, no-ops).
   */
  onDecide?: HJDecisionHandlers | undefined;
  /** Optional override for the root testid. */
  'data-testid'?: string | undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Two-pane queue UI for the HyphenJoin stage's Undecided tab.
 *
 * Left sidebar — scrollable sorted list of undecided cases. Each row shows
 * the original hyphenated text and (when present) an HJStatusPill.
 *
 * Right pane — HJDecisionCard for the currently selected case, or an
 * empty-state placeholder when no case is selected.
 *
 * Keyboard navigation (J / K / Y / N / F) is handled inside HJDecisionCard.
 */
export function HyphenUndecided({
  cases,
  selectedId,
  onSelect,
  'data-testid': testId = HYPHEN_UNDECIDED,
  ...rest
}: HyphenUndecidedProps) {
  // exactOptionalPropertyTypes — pull onDecide from rest safely
  const onDecide: HJDecisionHandlers | undefined =
    'onDecide' in rest ? (rest as { onDecide?: HJDecisionHandlers }).onDecide : undefined;

  const selectedCase =
    selectedId !== undefined ? cases.find((c) => c.id === selectedId) : undefined;

  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        gap: 0,
        alignItems: 'stretch',
        minHeight: 0,
        flex: 1,
      }}
    >
      {/* ── Left sidebar — queue list ─────────────────────────────────── */}
      <aside
        aria-label="Undecided cases queue"
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid var(--border-1)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ul
          role="listbox"
          aria-label="Cases"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            flex: 1,
          }}
        >
          {cases.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <li key={c.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  data-testid={hyphenUndecidedItemTestId(c.id)}
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelect(c.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isSelected ? 'var(--bg-raised)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-1)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--ink-1)',
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {c.originalText}
                  </span>
                  {c.status !== undefined && <HJStatusPill status={c.status} />}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ── Right pane — focused case detail ──────────────────────────── */}
      <div
        style={{
          flex: 1,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minWidth: 0,
          overflowY: 'auto',
        }}
      >
        {selectedCase !== undefined ? (
          <HJDecisionCard
            decisionCase={selectedCase}
            {...(onDecide !== undefined
              ? {
                  ...(onDecide.onAccept !== undefined ? { onAccept: onDecide.onAccept } : {}),
                  ...(onDecide.onKeep !== undefined ? { onKeep: onDecide.onKeep } : {}),
                  ...(onDecide.onFlag !== undefined ? { onFlag: onDecide.onFlag } : {}),
                  ...(onDecide.onNext !== undefined ? { onNext: onDecide.onNext } : {}),
                  ...(onDecide.onPrev !== undefined ? { onPrev: onDecide.onPrev } : {}),
                }
              : {})}
          />
        ) : (
          <div
            role="status"
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'var(--ink-4)',
              fontSize: 14,
            }}
          >
            No case selected
          </div>
        )}
      </div>
    </div>
  );
}

HyphenUndecided.displayName = 'HyphenUndecided';
