import * as React from 'react';
import { Button } from '../../primitives/Button.js';
import { KeyCap } from '../../primitives/KeyCap.js';
import { HJStatusPill } from './HJStatusPill.js';
import type { HJStatus } from './HJStatusPill.js';
import {
  HJ_DECISION_CARD,
  HJ_DECISION_CARD_ACCEPT,
  HJ_DECISION_CARD_KEEP,
  HJ_DECISION_CARD_FLAG,
  HJ_DECISION_CARD_NEXT,
  HJ_DECISION_CARD_PREV,
  HJ_DECISION_CARD_SPARKLINE,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Shape of a single hyphen-join decision case shown in the detail card.
 * Named `decisionCase` on the prop (avoids the reserved word `case`).
 */
export interface HJDecisionCase {
  /** Unique identifier for this case. */
  id: string;
  /** Original hyphenated text as it appears in the source. */
  originalText: string;
  /** Proposed joined form without hyphen. */
  joinProposal: string;
  /**
   * N-gram frequency series (arbitrary units) rendered as a sparkline.
   * Omit to hide the sparkline entirely.
   */
  ngrams?: number[];
  /** Current decision status — drives the status pill colour. */
  status?: HJStatus;
}

export interface HJDecisionCardProps {
  /** The case being reviewed. Renamed from `case` to avoid reserved word. */
  decisionCase: HJDecisionCase;
  /** Accept the join proposal (keyboard: Y). */
  onAccept?: (() => void) | undefined;
  /** Keep the original hyphen (keyboard: N). */
  onKeep?: (() => void) | undefined;
  /** Flag this case for post-book review (keyboard: F). */
  onFlag?: (() => void) | undefined;
  /** Navigate to the next case (keyboard: J). */
  onNext?: (() => void) | undefined;
  /** Navigate to the previous case (keyboard: K). */
  onPrev?: (() => void) | undefined;
  /** Optional override for the root testid. */
  'data-testid'?: string;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

const SPARKLINE_W = 80;
const SPARKLINE_H = 24;

function NgramSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = SPARKLINE_W / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = SPARKLINE_H - ((v - min) / range) * SPARKLINE_H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={SPARKLINE_W}
      height={SPARKLINE_H}
      viewBox={`0 0 ${SPARKLINE_W} ${SPARKLINE_H}`}
      aria-hidden="true"
      data-testid={HJ_DECISION_CARD_SPARKLINE}
      style={{ flexShrink: 0, overflow: 'visible' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--ink-3)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Case detail block for the HyphenJoin stage.
 *
 * Shows the original hyphenated text, the join proposal, an optional n-gram
 * sparkline, status pill, and five action buttons (Accept / Keep / Flag /
 * Next / Prev) with keyboard-shortcut hints (Y / N / F / J / K).
 *
 * Keyboard shortcuts are handled via onKeyDown on the focusable wrapper div.
 * The wrapper has `tabIndex={0}` so consumers can focus it programmatically.
 */
export const HJDecisionCard = React.forwardRef<HTMLDivElement, HJDecisionCardProps>(
  function HJDecisionCard(
    {
      decisionCase,
      'data-testid': testId = HJ_DECISION_CARD,
      ...rest
    }: HJDecisionCardProps & { 'data-testid'?: string },
    ref,
  ) {
    // Destructure optional callbacks — exactOptionalPropertyTypes compliant
    const onAccept: (() => void) | undefined = 'onAccept' in rest ? rest.onAccept : undefined;
    const onKeep: (() => void) | undefined = 'onKeep' in rest ? rest.onKeep : undefined;
    const onFlag: (() => void) | undefined = 'onFlag' in rest ? rest.onFlag : undefined;
    const onNext: (() => void) | undefined = 'onNext' in rest ? rest.onNext : undefined;
    const onPrev: (() => void) | undefined = 'onPrev' in rest ? rest.onPrev : undefined;

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key.toLowerCase()) {
          case 'y':
            onAccept?.();
            break;
          case 'n':
            onKeep?.();
            break;
          case 'f':
            onFlag?.();
            break;
          case 'j':
            onNext?.();
            break;
          case 'k':
            onPrev?.();
            break;
          default:
            break;
        }
      },
      [onAccept, onKeep, onFlag, onNext, onPrev],
    );

    return (
      /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
      /* role="group" provides AT-readable structure; tabIndex+onKeyDown enable Y/N/F/J/K shortcuts.
         role="application" was removed because it mutes the AT virtual cursor. */
      <div
        ref={ref}
        role="group"
        tabIndex={0}
        aria-label={`Hyphen-join decision: ${decisionCase.originalText}`}
        data-testid={testId}
        onKeyDown={handleKeyDown}
        className="hj-decision-card"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-1)',
          borderRadius: 8,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          outline: 'none',
        }}
      >
        {/* ── Text block: original + proposal ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            original
          </span>
          <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-1)' }}>
            {decisionCase.originalText}
          </span>
        </div>

        <div aria-hidden="true" style={{ color: 'var(--ink-4)', fontSize: 14 }}>
          →
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            proposal
          </span>
          <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-1)' }}>
            {decisionCase.joinProposal}
          </span>
        </div>

        {/* ── Status pill ──────────────────────────────────────────────── */}
        {decisionCase.status !== undefined && <HJStatusPill status={decisionCase.status} />}

        {/* ── Ngrams sparkline ─────────────────────────────────────────── */}
        {decisionCase.ngrams !== undefined && decisionCase.ngrams.length >= 2 && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}
          >
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-4)',
              }}
            >
              n-grams
            </span>
            <NgramSparkline values={decisionCase.ngrams} />
          </div>
        )}
        {/* Render testid placeholder even for single-point arrays so testid is still findable */}
        {decisionCase.ngrams !== undefined && decisionCase.ngrams.length === 1 && (
          <svg width={0} height={0} aria-hidden="true" data-testid={HJ_DECISION_CARD_SPARKLINE} />
        )}

        <span style={{ flex: 1 }} />

        {/* ── Navigation buttons (Prev / Next) ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            size="sm"
            data-testid={HJ_DECISION_CARD_PREV}
            {...(onPrev !== undefined ? { onClick: onPrev } : {})}
            aria-label="Previous case"
          >
            <KeyCap keys="K" />
            <span style={{ marginLeft: 4 }}>Prev</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-testid={HJ_DECISION_CARD_NEXT}
            {...(onNext !== undefined ? { onClick: onNext } : {})}
            aria-label="Next case"
          >
            <KeyCap keys="J" />
            <span style={{ marginLeft: 4 }}>Next</span>
          </Button>
        </div>

        {/* ── Action buttons (Accept / Keep / Flag) ────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="sm"
            data-testid={HJ_DECISION_CARD_ACCEPT}
            {...(onAccept !== undefined ? { onClick: onAccept } : {})}
          >
            <KeyCap keys="Y" />
            <span style={{ marginLeft: 4 }}>Accept join</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-testid={HJ_DECISION_CARD_KEEP}
            {...(onKeep !== undefined ? { onClick: onKeep } : {})}
          >
            <KeyCap keys="N" />
            <span style={{ marginLeft: 4 }}>Keep hyphen</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-testid={HJ_DECISION_CARD_FLAG}
            {...(onFlag !== undefined ? { onClick: onFlag } : {})}
            style={{ color: 'var(--fuzzy)' }}
          >
            <KeyCap keys="F" />
            <span style={{ marginLeft: 4 }}>Flag</span>
          </Button>
        </div>
      </div>
      /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
    );
  },
);

HJDecisionCard.displayName = 'HJDecisionCard';
