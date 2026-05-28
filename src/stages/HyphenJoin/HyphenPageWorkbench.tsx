/**
 * HyphenPageWorkbench — per-page before/after workbench for the HyphenJoin stage.
 *
 * Spec §6.2: "Per-page before/after split with HJDecisionCard (Validate join /
 * Accept / Keep / Flag). Composes ArtifactViewer."
 *
 * Layout:
 *   - Top half: ArtifactViewer in split mode (before/after page image pair)
 *   - Bottom: scrollable list of HJDecisionCard (one per case on this page)
 *
 * Decision routing:
 *   - `onDecide(caseId, 'validate')` fires when the user accepts a case that
 *     already has `status === 'joined'` (human confirmation of an auto-join).
 *   - `onDecide(caseId, 'accept')` fires for undecided / other statuses.
 *   - `onDecide(caseId, 'keep')` fires for Keep.
 *   - `onDecide(caseId, 'flag')` fires for Flag.
 */

import * as React from 'react';
import { ArtifactViewer } from '../PageWorkbench/ArtifactViewer.js';
import { HJDecisionCard } from './HJDecisionCard.js';
import type { HJDecisionCase } from './HJDecisionCard.js';
import {
  HYPHEN_PAGE_WORKBENCH,
  HYPHEN_PAGE_WORKBENCH_VIEWER,
  HYPHEN_PAGE_WORKBENCH_DECISIONS,
} from '../../testids/index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Decision values that can be emitted by HyphenPageWorkbench. */
export type HJWorkbenchDecision = 'accept' | 'keep' | 'flag' | 'validate';

/** Per-page data passed to HyphenPageWorkbench. */
export interface HyphenPageWorkbenchPage {
  /** Unique page identifier. */
  id: string;
  /** URL for the "before" (pre-rule) page image. */
  imageUrl: string;
  /** URL for the "after" (post-rule) page image (optional split pane). */
  afterImageUrl?: string;
  /** Original page width in pixels (for ArtifactViewer geometry). */
  pageWidth: number;
  /** Original page height in pixels (for ArtifactViewer geometry). */
  pageHeight: number;
  /**
   * Normalized x-position of the split line (0–1).
   * Defaults to 0.5 when undefined.
   */
  splitX?: number;
}

export interface HyphenPageWorkbenchProps {
  /** Page metadata + image URLs. */
  page: HyphenPageWorkbenchPage;
  /** All hyphen-join cases on this page. */
  cases: HJDecisionCase[];
  /**
   * Fired when the user makes a decision on a case.
   * `decision='validate'` is emitted when the user confirms an auto-joined case
   * (`status === 'joined'`). Otherwise `'accept'` is emitted.
   */
  onDecide: (caseId: string, decision: HJWorkbenchDecision) => void;
  /**
   * Fired when the user navigates to the next case (keyboard: J).
   * When provided, `onNext` is threaded to each HJDecisionCard.
   */
  onNext?: (() => void) | undefined;
  /**
   * Fired when the user navigates to the previous case (keyboard: K).
   * When provided, `onPrev` is threaded to each HJDecisionCard.
   */
  onPrev?: (() => void) | undefined;
  /** Optional override for the root testid. */
  'data-testid'?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Per-page workbench for the HyphenJoin stage.
 *
 * Composes `ArtifactViewer` (split mode) for the before/after page view and
 * `HJDecisionCard` for each hyphen-join case on the page.
 */
export const HyphenPageWorkbench = React.forwardRef<HTMLDivElement, HyphenPageWorkbenchProps>(
  function HyphenPageWorkbench(
    { page, cases, onDecide, onNext, onPrev, 'data-testid': testId = HYPHEN_PAGE_WORKBENCH },
    ref,
  ) {
    // Build split proposal when afterImageUrl is present.
    // ArtifactViewer's split mode overlays the two images at the split line.
    const splitProposal =
      page.afterImageUrl !== undefined ? { splitX: page.splitX ?? 0.5 } : undefined;

    const overlayMode = splitProposal !== undefined ? 'split' : 'view';

    return (
      <div
        ref={ref}
        className="hpw"
        data-testid={testId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          flex: 1,
          gap: 12,
        }}
      >
        {/* ── Top half: ArtifactViewer (before/after split) ─────────────── */}
        <div
          className="hpw__viewer"
          data-testid={HYPHEN_PAGE_WORKBENCH_VIEWER}
          style={{ flex: 1, minHeight: 0 }}
        >
          <ArtifactViewer
            imageSrc={page.imageUrl}
            pageWidth={page.pageWidth}
            pageHeight={page.pageHeight}
            overlayMode={overlayMode}
            {...(splitProposal !== undefined ? { splitProposal } : {})}
          />
        </div>

        {/* ── Bottom: scrollable HJDecisionCard list ─────────────────────── */}
        <div
          className="hpw__decisions"
          data-testid={HYPHEN_PAGE_WORKBENCH_DECISIONS}
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            flexShrink: 0,
            maxHeight: '40%',
            padding: '2px 0',
          }}
        >
          {cases.map((c) => (
            <HJDecisionCard
              key={c.id}
              decisionCase={c}
              onAccept={() => {
                // 'auto-joined' status → user is confirming an auto-join → 'validate'
                onDecide(c.id, c.status === 'auto-joined' ? 'validate' : 'accept');
              }}
              onKeep={() => {
                onDecide(c.id, 'keep');
              }}
              onFlag={() => {
                onDecide(c.id, 'flag');
              }}
              {...(onNext !== undefined ? { onNext } : {})}
              {...(onPrev !== undefined ? { onPrev } : {})}
            />
          ))}
        </div>
      </div>
    );
  },
);

HyphenPageWorkbench.displayName = 'HyphenPageWorkbench';
