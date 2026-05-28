import * as React from 'react';
import { Badge } from '../../primitives/Badge.js';
import type { BadgeTone } from '../../primitives/Badge.js';
import { HJ_STATUS_PILL } from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Visual status for a hyphen-join decision row.
 *
 * - `cross-page`  — hyphen spans a page boundary; routed to special handling (ocr/blue tone)
 * - `validated`   — human-confirmed join (green/exact, filled)
 * - `auto-joined` — auto-joined by rule, awaiting human check (green/exact, dashed border)
 * - `undecided`   — no rule matched; flagged for review (amber/fuzzy)
 * - `flagged`     — mismatch detected within the book (red/mismatch)
 */
export type HJStatus = 'cross-page' | 'validated' | 'auto-joined' | 'undecided' | 'flagged';

export interface HJStatusPillProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The hyphen-join decision status to visualise. */
  status: HJStatus;
  /** Optional override for the root testid. */
  'data-testid'?: string;
}

// ─── Mappings ─────────────────────────────────────────────────────────────────

const STATUS_TONE: Record<HJStatus, BadgeTone> = {
  'cross-page': 'ocr', // blue (ocr tone) — special cross-page route
  validated: 'exact', // green — human-confirmed
  'auto-joined': 'exact', // green — auto-joined (dashed via modifier)
  undecided: 'fuzzy', // amber — no rule match
  flagged: 'mismatch', // red — mismatch in book
};

const STATUS_LABEL: Record<HJStatus, string> = {
  'cross-page': 'cross-page',
  validated: 'validated',
  'auto-joined': 'auto-joined',
  undecided: 'undecided',
  flagged: 'flagged',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Status pill for a hyphen-join decision row.
 *
 * Composes on `<Badge>` using its `tone` prop. The `auto-joined` variant
 * adds a CSS modifier class for its dashed border treatment.
 */
export const HJStatusPill = React.forwardRef<HTMLSpanElement, HJStatusPillProps>(
  function HJStatusPill({ status, 'data-testid': testId = HJ_STATUS_PILL, ...rest }, ref) {
    const tone = STATUS_TONE[status];
    const label = STATUS_LABEL[status];
    const isDashed = status === 'auto-joined';

    return (
      <Badge
        ref={ref}
        tone={tone}
        dot
        mono
        className={isDashed ? 'hj-status-pill hj-status-pill--dashed' : 'hj-status-pill'}
        data-testid={testId}
        data-status={status}
        {...rest}
      >
        {label}
      </Badge>
    );
  },
);

HJStatusPill.displayName = 'HJStatusPill';
