import * as React from 'react';
import { Badge } from '../../primitives/Badge.js';
import { Button } from '../../primitives/Button.js';
import { PageThumb } from './PageThumb.js';
import type { PageRef } from './PageThumb.js';
import { REORDER_SWAP_ROW } from '../../testids/index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

export type SwapConfidence = 'high' | 'medium';
export type SwapState = 'pending' | 'accepted' | 'skipped';

export interface SwapData {
  /** Stable swap identifier. */
  id: string;
  /** 1-based display number for this swap in the list. */
  number: number;
  /** First page in the swap pair. */
  pageA: PageRef;
  /** Second page in the swap pair. */
  pageB: PageRef;
  /** Algorithm confidence for this swap. */
  confidence: SwapConfidence;
  /** Human-readable reasoning text from the detector. */
  reasoning: string;
  /** List of monospace signal keys driving the recommendation. */
  signals: string[];
}

/** Pending variant — shows Skip / Inspect / Accept action buttons. */
interface PendingProps {
  swap: SwapData;
  state: 'pending';
  onSkip: () => void;
  onInspect: () => void;
  onAccept: () => void;
  /** Override the root element's data-testid. Defaults to `REORDER_SWAP_ROW`. */
  'data-testid'?: string;
}

/** Post-decision variant — shows a static state badge; no action buttons. */
interface DecidedProps {
  swap: SwapData;
  state: 'accepted' | 'skipped';
  /** Override the root element's data-testid. Defaults to `REORDER_SWAP_ROW`. */
  'data-testid'?: string;
}

/** Discriminated-union props for SwapRow. */
export type SwapRowProps = PendingProps | DecidedProps;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceLabel(c: SwapConfidence): string {
  return c === 'high' ? 'High' : 'Medium';
}

function confidenceTone(c: SwapConfidence): 'clean' | 'review' {
  return c === 'high' ? 'clean' : 'review';
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SwapRow — per-swap decision row in the Page Reorder stage.
 *
 * Discriminated on `state`:
 *   - `pending`  — renders Skip / Inspect / Accept action buttons.
 *   - `accepted` | `skipped` — renders a static state Badge; no buttons.
 *
 * Layout (left to right):
 *   1. Number badge (swap.number)
 *   2. PageThumb pair (pageA ↔ pageB)
 *   3. Confidence badge + reasoning text + mono signal list
 *   4. Action zone (buttons or state badge)
 *
 * Design source: wf09/pages-tab.jsx lines 414-487.
 */
export function SwapRow(props: SwapRowProps): React.ReactElement {
  const { swap, state } = props;
  const testId = props['data-testid'] ?? REORDER_SWAP_ROW;

  // ── Action zone ──────────────────────────────────────────────────────────────
  let actionZone: React.ReactNode;

  if (state === 'pending') {
    const { onSkip, onInspect, onAccept } = props;
    actionZone = (
      <div className="swap-row__actions" aria-label={`Actions for swap ${swap.number}`}>
        <Button variant="ghost" size="sm" aria-label={`Skip swap ${swap.number}`} onClick={onSkip}>
          Skip
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Inspect swap ${swap.number}`}
          onClick={onInspect}
        >
          Inspect
        </Button>
        <Button
          variant="primary"
          size="sm"
          aria-label={`Accept swap ${swap.number}`}
          onClick={onAccept}
        >
          Accept
        </Button>
      </div>
    );
  } else {
    const label = state === 'accepted' ? 'Accepted' : 'Skipped';
    const tone = state === 'accepted' ? 'clean' : ('neutral' as const);
    actionZone = (
      <div className="swap-row__state">
        <Badge tone={tone} dot={state === 'accepted'}>
          {label}
        </Badge>
      </div>
    );
  }

  return (
    <div className="swap-row" data-testid={testId}>
      {/* Number badge */}
      <Badge className="swap-row__number" tone="neutral">
        {swap.number}
      </Badge>

      {/* Thumbnail pair */}
      <PageThumb pageA={swap.pageA} pageB={swap.pageB} />

      {/* Meta: confidence + reasoning + signals */}
      <div className="swap-row__meta">
        <Badge tone={confidenceTone(swap.confidence)} className="swap-row__confidence">
          {confidenceLabel(swap.confidence)}
        </Badge>
        <p className="swap-row__reasoning">{swap.reasoning}</p>
        {swap.signals.length > 0 && (
          <ul className="swap-row__signals" aria-label="signals">
            {swap.signals.map((sig) => (
              <li key={sig} className="swap-row__signal">
                {sig}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action zone */}
      {actionZone}
    </div>
  );
}

SwapRow.displayName = 'SwapRow';
