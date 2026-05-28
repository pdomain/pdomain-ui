/**
 * SourcePageWorkbench — per-page detail view for the Source stage.
 *
 * Spec §6.2: "Per-page detail view: 5-button role segment, page number,
 * rotation, tone hint, before/after image viewer (uses ArtifactViewer),
 * prev/next/apply navigation."
 *
 * Layout:
 *   - Top toolbar: title + Prev / Next / Apply navigation
 *   - Body (2-column grid):
 *     - Left panel: role segment + page metadata fields
 *     - Right panel: ArtifactViewer image viewer
 *
 * Composes ArtifactViewer for the image pane.
 * overlayMode='view' is used for M3; split before/after requires
 * additional 2-image plumbing deferred as a follow-on.
 */

import * as React from 'react';
import type { SourcePage, SourcePageRole } from './ThumbCard.js';
import { ArtifactViewer } from '../PageWorkbench/ArtifactViewer.js';
import { Segmented } from '../../primitives/Segmented.js';
import type { SegmentedOption } from '../../primitives/Segmented.js';
import { Button } from '../../primitives/Button.js';
import {
  SOURCE_PAGE_WORKBENCH,
  SOURCE_PAGE_WORKBENCH_APPLY,
  SOURCE_PAGE_WORKBENCH_PREV,
  SOURCE_PAGE_WORKBENCH_NEXT,
  sourcePageWorkbenchRoleTestId,
} from '../../testids/index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SourcePageWorkbenchProps {
  /** Page id + pageNumber + thumbnailUrl + status + role. */
  page: SourcePage;
  /**
   * Original (before-processing) page image URL.
   * Kept in the API for future split-view; currently unused in the single-image
   * ArtifactViewer. Pass `''` or omit when unavailable — will be wired when
   * 2-image plumbing is added in a follow-on.
   */
  beforeImageUrl: string;
  /** Processed (after) page image URL. */
  afterImageUrl: string;
  /** Page geometry for ArtifactViewer. */
  pageWidth: number;
  pageHeight: number;
  /** Rotation in degrees (0/90/180/270 in practice). */
  rotationDeg?: number;
  /** Tone hint summary (e.g. "Mostly text", "Heavy art"); display-only. */
  toneHint?: string;
  onRoleChange?: (role: SourcePageRole) => void;
  /** Called when the user changes the rotation segment. Value is 0/90/180/270. */
  onRotationChange?: (deg: number) => void;
  onApply?: () => void;
  onNavigate?: (dir: 'prev' | 'next') => void;
  /** Disable Prev when at first page. */
  hasPrev?: boolean;
  /** Disable Next when at last page. */
  hasNext?: boolean;
  'data-testid'?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Role options shown in the Segmented selector.
 * 'removed' is a bulk action, not a per-page role option.
 */
const ROLE_OPTIONS: SegmentedOption[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'page', label: 'Body' },
  { value: 'back', label: 'Back' },
  { value: 'blank', label: 'Blank' },
  { value: 'duplicate', label: 'Dupe' },
];

/** Rotation degree options for the rotation selector. */
const ROTATION_OPTIONS: SegmentedOption[] = [
  { value: '0', label: '0°' },
  { value: '90', label: '90°' },
  { value: '180', label: '180°' },
  { value: '270', label: '270°' },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Per-page detail view used in the Source stage when a single page is in focus.
 *
 * Shows page metadata (number, rotation, tone hint), a 5-button role selector,
 * an image preview via ArtifactViewer, and Prev / Apply / Next navigation.
 *
 * The image viewer uses overlayMode='view' and displays the afterImageUrl
 * (processed scan). True side-by-side before/after split is deferred as a
 * follow-on requiring 2-image plumbing.
 */
export const SourcePageWorkbench = React.forwardRef<HTMLDivElement, SourcePageWorkbenchProps>(
  function SourcePageWorkbench(
    {
      page,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      beforeImageUrl: _beforeImageUrl, // kept for API; split mode is a follow-on
      afterImageUrl,
      pageWidth,
      pageHeight,
      rotationDeg,
      toneHint,
      onRoleChange,
      onRotationChange,
      onApply,
      onNavigate,
      hasPrev = true,
      hasNext = true,
      'data-testid': testId = SOURCE_PAGE_WORKBENCH,
    },
    ref,
  ) {
    const rotationValue = rotationDeg !== undefined ? String(rotationDeg) : '0';

    return (
      <div ref={ref} className="spw" data-testid={testId}>
        {/* ── Top toolbar ─────────────────────────────────────────────────── */}
        <div className="spw__toolbar">
          <div className="spw__toolbar-meta">
            <span className="spw__page-number" data-testid={`${testId}-page-number`}>
              p.{page.pageNumber}
            </span>
            {rotationDeg !== undefined && (
              <span className="spw__rotation" data-testid={`${testId}-rotation`}>
                {rotationDeg}°
              </span>
            )}
            {toneHint !== undefined && (
              <span className="spw__tone-hint" data-testid={`${testId}-tone-hint`}>
                {toneHint}
              </span>
            )}
          </div>

          <div className="spw__toolbar-actions">
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasPrev}
              data-testid={SOURCE_PAGE_WORKBENCH_PREV}
              onClick={() => onNavigate?.('prev')}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasNext}
              data-testid={SOURCE_PAGE_WORKBENCH_NEXT}
              onClick={() => onNavigate?.('next')}
            >
              Next
            </Button>
            <Button
              variant="primary"
              size="sm"
              data-testid={SOURCE_PAGE_WORKBENCH_APPLY}
              onClick={onApply}
            >
              Apply &amp; Continue
            </Button>
          </div>
        </div>

        {/* ── Body grid ───────────────────────────────────────────────────── */}
        <div className="spw__body">
          {/* Left panel — metadata + role selector */}
          <div className="spw__left-panel">
            {/* Page number field */}
            <div className="spw__field">
              <span className="spw__field-label">Page number</span>
              <div className="spw__field-value spw__field-value--mono">{page.pageNumber}</div>
            </div>

            {/* Rotation field */}
            <div className="spw__field">
              <span className="spw__field-label">Rotation</span>
              <div data-testid={`${testId}-rotation-segment`}>
                <Segmented
                  options={ROTATION_OPTIONS}
                  value={rotationValue}
                  onChange={(v) => onRotationChange?.(Number(v))}
                  size="sm"
                  full
                />
              </div>
              {/* Hidden per-rotation testid anchors for Playwright drivers */}
              <div aria-hidden="true" style={{ display: 'none' }}>
                {ROTATION_OPTIONS.map((opt) => (
                  <span
                    key={opt.value}
                    data-testid={`${testId}-rotation-${opt.value}`}
                    data-rotation={opt.value}
                    data-active={rotationValue === opt.value ? 'true' : 'false'}
                  />
                ))}
              </div>
            </div>

            {/* Tone hint field */}
            {toneHint !== undefined && (
              <div className="spw__field">
                <span className="spw__field-label">Tone hint</span>
                <div className="spw__field-value">{toneHint}</div>
              </div>
            )}

            {/* Role segment */}
            <div className="spw__field">
              <span className="spw__field-label">Role</span>
              <div data-testid={`${testId}-role-segment`}>
                <Segmented
                  options={ROLE_OPTIONS.map((opt) => ({
                    ...opt,
                    value: opt.value,
                  }))}
                  value={page.role === 'removed' ? 'page' : page.role}
                  onChange={(v) => {
                    onRoleChange?.(v as SourcePageRole);
                    // set data-testid per-role for driver targeting
                  }}
                  size="sm"
                  full
                />
              </div>
              {/* Hidden per-role testid anchors for Playwright drivers */}
              <div aria-hidden="true" style={{ display: 'none' }}>
                {ROLE_OPTIONS.map((opt) => (
                  <span
                    key={opt.value}
                    data-testid={sourcePageWorkbenchRoleTestId(opt.value)}
                    data-role={opt.value}
                    data-active={
                      (page.role === 'removed' ? 'page' : page.role) === opt.value
                        ? 'true'
                        : 'false'
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right panel — image viewer */}
          <div className="spw__right-panel">
            {/*
             * overlayMode='view' — display the processed (after) image.
             * True before/after split mode requires 2-image plumbing
             * (ArtifactViewer currently takes a single imageSrc);
             * that is deferred as a follow-on.
             */}
            <ArtifactViewer
              imageSrc={afterImageUrl}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              overlayMode="view"
            />
          </div>
        </div>

        {/* ── Bottom navigation ───────────────────────────────────────────── */}
        <div className="spw__bottom">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasPrev}
            data-testid={`${testId}-bottom-prev`}
            onClick={() => onNavigate?.('prev')}
          >
            Prev
          </Button>
          <Button
            variant="primary"
            size="sm"
            data-testid={`${testId}-bottom-apply`}
            onClick={onApply}
          >
            Apply &amp; Continue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            data-testid={`${testId}-bottom-next`}
            onClick={() => onNavigate?.('next')}
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
);

SourcePageWorkbench.displayName = 'SourcePageWorkbench';
