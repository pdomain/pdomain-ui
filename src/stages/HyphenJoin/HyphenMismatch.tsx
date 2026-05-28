import * as React from 'react';
import { Button } from '../../primitives/Button.js';
import { HYPHEN_MISMATCH, hyphenMismatchRowTestId } from '../../testids/index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

/** A single decision made by one source (e.g. dictionary, user, corpus). */
export interface HyphenDecision {
  /** Source that made the decision (e.g. 'dictionary', 'user', 'corpus'). */
  source: string;
  /** The choice made: typically 'join' or 'keep'. */
  choice: string;
}

/** A single mismatch record — same word with conflicting decisions. */
export interface HyphenMismatchItem {
  /** Stable unique id for this mismatch (used in testids and resolve callback). */
  id: string;
  /** The hyphenated word that has conflicting decisions. */
  word: string;
  /** All decisions made for this word, from all sources. */
  decisions: Array<HyphenDecision>;
  /** Optional human-readable explanation of why a conflict exists. */
  reason?: string | undefined;
}

export interface HyphenMismatchProps {
  /** List of mismatch records to render. Pass an empty array for the empty state. */
  mismatches: Array<HyphenMismatchItem>;
  /**
   * Optional callback to resolve a mismatch. When provided, each row renders
   * a "Resolve" button that calls `onResolve(id)` on click.
   */
  onResolve?: ((id: string) => void) | undefined;
  /** Optional testid override. Defaults to `HYPHEN_MISMATCH`. */
  'data-testid'?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface MismatchRowProps {
  item: HyphenMismatchItem;
  onResolve?: ((id: string) => void) | undefined;
}

function MismatchRow({ item, onResolve }: MismatchRowProps): React.ReactElement {
  const { id, word, decisions, reason } = item;

  return (
    <tr className="hyphen-mismatch__row" data-testid={hyphenMismatchRowTestId(id)}>
      {/* Word column */}
      <td className="hyphen-mismatch__cell hyphen-mismatch__cell--word">
        <code className="hyphen-mismatch__word-code">{word}</code>
      </td>

      {/* Decisions summary column — structured spans for each source/choice pair */}
      <td className="hyphen-mismatch__cell hyphen-mismatch__cell--decisions">
        <dl className="hyphen-mismatch__decisions-list">
          {decisions.map((d, i) => (
            <div key={i} className="hyphen-mismatch__decision-entry">
              <dt className="hyphen-mismatch__decision-source">{d.source}</dt>
              <dd className="hyphen-mismatch__decision-choice">{d.choice}</dd>
            </div>
          ))}
        </dl>
      </td>

      {/* Conflict reason column */}
      <td className="hyphen-mismatch__cell hyphen-mismatch__cell--reason">
        {reason != null ? <span className="hyphen-mismatch__reason">{reason}</span> : null}
      </td>

      {/* Resolve action column — only rendered when onResolve is provided */}
      {onResolve != null ? (
        <td className="hyphen-mismatch__cell hyphen-mismatch__cell--action">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onResolve(id);
            }}
          >
            Resolve
          </Button>
        </td>
      ) : null}
    </tr>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * HyphenMismatch — mismatch report view for the HyphenJoin pipeline stage.
 *
 * Renders a table of conflicting hyphen-join decisions. Each row shows:
 * - The word with conflicting decisions
 * - A summary of all decisions and their sources
 * - An optional conflict reason
 * - An optional "Resolve" action button (when `onResolve` is provided)
 *
 * When `mismatches` is empty, renders a small empty-state message.
 *
 * Design source: `docs/templates/design_handoff_pdomain_ui/final/hyphen_join/variations.jsx`
 * (MismatchedReportV4 / MismatchRow — §V4 Mismatched dash report).
 */
export function HyphenMismatch({
  mismatches,
  onResolve,
  'data-testid': testId = HYPHEN_MISMATCH,
}: HyphenMismatchProps): React.ReactElement {
  const hasResolve = onResolve != null;

  if (mismatches.length === 0) {
    return (
      <section className="hyphen-mismatch hyphen-mismatch--empty" data-testid={testId}>
        <p className="hyphen-mismatch__empty-state">No mismatches</p>
      </section>
    );
  }

  return (
    <section className="hyphen-mismatch" data-testid={testId}>
      <table className="hyphen-mismatch__table">
        <thead>
          <tr className="hyphen-mismatch__header-row">
            <th className="hyphen-mismatch__header hyphen-mismatch__header--word" scope="col">
              Word
            </th>
            <th className="hyphen-mismatch__header hyphen-mismatch__header--decisions" scope="col">
              Decisions
            </th>
            <th className="hyphen-mismatch__header hyphen-mismatch__header--reason" scope="col">
              Conflict reason
            </th>
            {hasResolve ? (
              <th className="hyphen-mismatch__header hyphen-mismatch__header--action" scope="col">
                Resolve
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {mismatches.map((item) => (
            <MismatchRow key={item.id} item={item} onResolve={onResolve} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

HyphenMismatch.displayName = 'HyphenMismatch';
