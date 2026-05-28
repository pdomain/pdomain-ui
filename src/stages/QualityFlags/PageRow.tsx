import * as React from 'react';
import { FlagChip } from '../../primitives/FlagChip.js';
import { Badge } from '../../primitives/Badge.js';
import type { BadgeTone } from '../../primitives/Badge.js';
import { cn } from '../../primitives/cn.js';
import {
  QUALITY_PAGE_ROW,
  qualityPageRowTestId,
  qualityPageRowScoreTestId,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A flag entry for a quality-flags page row.
 * Maps to the shape FlagChip consumes.
 */
export interface QualityPageFlag {
  id: string;
  label?: string;
  /**
   * Semantic tone — passed through to FlagChip as the `tone` CSS-variable
   * override.  Omit to let FlagChip derive tone from `kind`.
   */
  tone?: string;
}

/**
 * Minimal page shape for PageRow.
 * Score keys are arbitrary (e.g. "ocr", "deskew") with 0–1 float values.
 */
export interface QualityPage {
  id: string;
  number: number | string;
  thumbnailUrl?: string;
  scores?: Record<string, number>;
}

// ─── Score tone thresholds ─────────────────────────────────────────────────

const SCORE_THRESHOLDS = {
  good: 0.8,
  warn: 0.5,
} as const;

/**
 * Derive a BadgeTone from a 0–1 score value.
 *   >= 0.8  → exact (green)
 *   >= 0.5  → fuzzy (amber)
 *   <  0.5  → mismatch (red)
 */
function scoreTone(value: number): BadgeTone {
  if (value >= SCORE_THRESHOLDS.good) return 'exact';
  if (value >= SCORE_THRESHOLDS.warn) return 'fuzzy';
  return 'mismatch';
}

// ─── ScoreCell ────────────────────────────────────────────────────────────────

interface ScoreCellProps {
  pageId: string;
  scoreKey: string;
  value: number;
}

function ScoreCell({ pageId, scoreKey, value }: ScoreCellProps): React.ReactElement {
  const tone = scoreTone(value);
  const label = `${Math.round(value * 100)}%`;
  return (
    <Badge
      tone={tone}
      dot
      mono
      data-testid={qualityPageRowScoreTestId(pageId, scoreKey)}
      title={`${scoreKey}: ${label}`}
    >
      {label}
    </Badge>
  );
}

// ─── PageRow ──────────────────────────────────────────────────────────────────

export interface PageRowProps {
  /** Page data. */
  page: QualityPage;
  /** Flag pills to render in the row. */
  flags?: ReadonlyArray<QualityPageFlag>;
  /** Additional CSS class on the root element. */
  className?: string;
}

/**
 * PageRow — QualityFlags list-mode page row.
 *
 * Renders as a flex `div[role="row"]` (standalone, no table ancestor).
 * Flag pills use FlagChip; score cells use tone-colored Badge.
 *
 * Design source: wf03/wf03-variations.jsx lines 781–827.
 */
export function PageRow({ page, flags, className }: PageRowProps): React.ReactElement {
  const resolvedFlags = flags ?? [];

  return (
    <div
      className={cn('quality-page-row', className)}
      role="listitem"
      data-testid={QUALITY_PAGE_ROW}
      data-page-id={page.id}
      aria-label={`Page ${page.number}`}
    >
      {/* Page number */}
      <span className="quality-page-row__number" data-testid={qualityPageRowTestId(page.id)}>
        {page.number}
      </span>

      {/* Flag pills */}
      <span className="quality-page-row__flags">
        {resolvedFlags.length === 0 ? (
          <span className="quality-page-row__no-flags">—</span>
        ) : (
          resolvedFlags.map((flag) => {
            const chipProps = flag.tone != null ? { tone: flag.tone } : {};
            return (
              <FlagChip
                key={flag.id}
                kind={flag.id}
                {...(flag.label != null ? { label: flag.label } : {})}
                {...chipProps}
              />
            );
          })
        )}
      </span>

      {/* Score cells */}
      {page.scores != null && Object.keys(page.scores).length > 0 ? (
        <span className="quality-page-row__scores">
          {Object.entries(page.scores).map(([key, value]) => (
            <ScoreCell key={key} pageId={page.id} scoreKey={key} value={value} />
          ))}
        </span>
      ) : null}
    </div>
  );
}

PageRow.displayName = 'PageRow';
