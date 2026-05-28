import * as React from 'react';
import { Button } from '../../primitives/Button.js';
import { Input } from '../../primitives/Input.js';
import {
  SCANNO_CANDIDATE_DETAIL,
  SCANNO_CANDIDATE_DETAIL_PROMOTE,
  SCANNO_CANDIDATE_DETAIL_DISMISS,
  SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A scanno candidate to review and optionally promote. */
export interface ScannoCandidateItem {
  /** Stable identifier for this candidate. */
  id: string;
  /** The suspect token found in the text. */
  token: string;
  /** The suggested replacement string. */
  suggested: string;
  /** Optional rule identifier that generated this candidate. */
  ruleId?: string;
  /** Confidence score in [0, 1]. */
  confidence?: number;
}

/** A single evidence context where the token appears. */
export interface ScannoContext {
  /** Stable identifier for this context. */
  id: string;
  /** Page identifier (e.g. `'p.047'`). */
  pageId: string;
  /** Snippet of surrounding text (the token should appear in it). */
  snippet: string;
}

/** Props for CandidateDetail. */
export interface CandidateDetailProps {
  /** The candidate being reviewed. */
  candidate: ScannoCandidateItem;
  /** Evidence contexts — component renders first 3 and shows a "Show all N" link when length > 3. */
  contexts: Array<ScannoContext>;
  /**
   * Called with the (possibly edited) suggested value when the user clicks Promote.
   * When absent the Promote button renders disabled.
   */
  onPromote?: (suggested: string) => void;
  /**
   * Called when the user clicks Dismiss.
   * When absent the Dismiss button renders disabled.
   */
  onDismiss?: () => void;
  /** Override the root testid; defaults to `SCANNO_CANDIDATE_DETAIL`. */
  'data-testid'?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MAX_VISIBLE_CONTEXTS = 3;

/**
 * CandidateDetail — right-pane candidate detail for the Scannos stage.
 *
 * Shows:
 * - Candidate token + suggestion header
 * - Optional confidence badge
 * - Evidence contexts (first 3, plus "Show all N" link when length > 3)
 * - Promote-preview form with editable suggested-value input
 * - Promote (primary) and Dismiss (ghost) action buttons
 *
 * Design source: wf05b/scanno-promote.jsx lines 300-410.
 */
export function CandidateDetail({
  candidate,
  contexts,
  onPromote,
  onDismiss,
  'data-testid': testId = SCANNO_CANDIDATE_DETAIL,
}: CandidateDetailProps) {
  const [suggested, setSuggested] = React.useState(candidate.suggested);
  const [showAll, setShowAll] = React.useState(false);

  // Reset edited value and showAll when the candidate changes
  React.useEffect(() => {
    setSuggested(candidate.suggested);
    setShowAll(false);
  }, [candidate.id, candidate.suggested]);

  const visibleContexts = showAll ? contexts : contexts.slice(0, MAX_VISIBLE_CONTEXTS);
  const hasMore = contexts.length > MAX_VISIBLE_CONTEXTS;

  function handlePromote() {
    onPromote?.(suggested);
  }

  return (
    <section className="scanno-candidate-detail" data-testid={testId}>
      {/* ── Candidate header ──────────────────────────────────────────────── */}
      <div className="scanno-candidate-detail__header">
        <div className="scanno-candidate-detail__label">Candidate</div>
        <div className="scanno-candidate-detail__token-row">
          <span className="scanno-candidate-detail__token mono">{candidate.token}</span>
          <span className="scanno-candidate-detail__arrow" aria-hidden="true">
            →
          </span>
          <span className="scanno-candidate-detail__suggested mono">{candidate.suggested}</span>
        </div>
        <div className="scanno-candidate-detail__meta">
          {candidate.ruleId !== undefined && (
            <span className="scanno-candidate-detail__rule-id mono">{candidate.ruleId}</span>
          )}
          {candidate.confidence !== undefined && (
            <span className="scanno-candidate-detail__confidence">
              {Math.round(candidate.confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* ── Evidence contexts ─────────────────────────────────────────────── */}
      <div className="scanno-candidate-detail__evidence">
        <div className="scanno-candidate-detail__section-label">
          Evidence · {Math.min(MAX_VISIBLE_CONTEXTS, contexts.length)} of {contexts.length} contexts
        </div>
        <div className="scanno-candidate-detail__contexts">
          {visibleContexts.map((ctx) => (
            <div key={ctx.id} className="scanno-candidate-detail__context">
              <span className="scanno-candidate-detail__page-id mono">{ctx.pageId}</span>
              <span className="scanno-candidate-detail__snippet">{ctx.snippet}</span>
            </div>
          ))}
        </div>
        {hasMore && !showAll && (
          <button
            type="button"
            className="scanno-candidate-detail__show-all"
            onClick={() => setShowAll(true)}
          >
            Show all {contexts.length}
          </button>
        )}
      </div>

      {/* ── Promote-preview form ──────────────────────────────────────────── */}
      <div className="scanno-candidate-detail__promote-preview">
        <div className="scanno-candidate-detail__promote-title">Promote to global library</div>
        <div className="scanno-candidate-detail__promote-desc">
          Creates a new rule in <span className="mono">Library → Scannos</span>. This book is
          recorded as the originating evidence.
        </div>
        <div className="scanno-candidate-detail__promote-form">
          <div className="scanno-candidate-detail__form-row">
            <span className="scanno-candidate-detail__form-label">Pattern</span>
            <span className="scanno-candidate-detail__form-value mono">{candidate.token}</span>
          </div>
          <div className="scanno-candidate-detail__form-row">
            <span className="scanno-candidate-detail__form-label">Suggest</span>
            <Input
              value={suggested}
              size="sm"
              className="mono"
              data-testid={SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT}
              aria-label="Suggested replacement"
              onChange={(e) => {
                setSuggested(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="scanno-candidate-detail__actions">
        <Button
          variant="primary"
          size="md"
          full
          data-testid={SCANNO_CANDIDATE_DETAIL_PROMOTE}
          {...(onPromote !== undefined ? { onClick: handlePromote } : { disabled: true })}
        >
          Promote
        </Button>
        <Button
          variant="ghost"
          size="md"
          full
          data-testid={SCANNO_CANDIDATE_DETAIL_DISMISS}
          {...(onDismiss !== undefined ? { onClick: onDismiss } : { disabled: true })}
        >
          Dismiss
        </Button>
      </div>
    </section>
  );
}

CandidateDetail.displayName = 'CandidateDetail';
