/**
 * BboxEditor — Phase 2 M5 interactive bbox editor for the Crop stage.
 *
 * Spec §6.2: "Interactive bbox editor: 8 draggable handles + T/R/B/L margin
 * inputs (px/% unit toggle) + delta-from-default + apply-to scope (This page /
 * Selected N / All flagged). Composes ArtifactViewer for the magnified page view."
 *
 * M5 scope:
 *   - Render 4 margin inputs (Top / Right / Bottom / Left)
 *   - Unit toggle (px / %)
 *   - Delta-from-default display
 *   - Apply-to scope Segmented
 *   - Apply button
 *   - ArtifactViewer for magnified page view
 *   - 8 draggable handle dots (visual only — drag wiring is Phase 2 follow-on)
 *
 * Drag handle wiring is intentionally OUT OF SCOPE for M5.
 * Follow-on: Phase 2 interactive drag handles for BboxEditor.
 * See: ConcaveTrillion/ocr-container-meta — search "BboxEditor drag handles".
 */

import * as React from 'react';
import { ArtifactViewer } from '../PageWorkbench/ArtifactViewer.js';
import { Segmented } from '../../primitives/Segmented.js';
import type { SegmentedOption } from '../../primitives/Segmented.js';
import { Button } from '../../primitives/Button.js';
import { BBOX_EDITOR, BBOX_EDITOR_APPLY, bboxEditorMarginTestId } from '../../testids/index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BboxUnit = 'px' | 'percent';

export type BboxScope = 'thisPage' | 'selectedN' | 'allFlagged';

export interface BboxMargins {
  /** Margins in the current unit (px or %). */
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BboxEditorPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  pageWidth: number;
  pageHeight: number;
  /** Default bbox margins (for delta-from-default). */
  defaultMargins: BboxMargins;
}

export interface BboxEditorProps {
  page: BboxEditorPage;
  /** Current margins. */
  margins: BboxMargins;
  onMarginsChange: (next: BboxMargins) => void;
  /** Unit toggle. */
  unit: BboxUnit;
  onUnitChange: (next: BboxUnit) => void;
  /** Apply-to scope. */
  scope: BboxScope;
  onScopeChange: (next: BboxScope) => void;
  /** Count of selected pages (used when scope='selectedN' for label). */
  selectedCount?: number;
  /** Count of flagged pages (used when scope='allFlagged' for label). */
  flaggedCount?: number;
  onApply: () => void;
  'data-testid'?: string;
}

// ── Unit options ──────────────────────────────────────────────────────────────

const UNIT_OPTIONS: ReadonlyArray<SegmentedOption> = [
  { value: 'px', label: 'px' },
  { value: 'percent', label: '%' },
];

// ── Delta helpers ─────────────────────────────────────────────────────────────

function formatDelta(margins: BboxMargins, defaultMargins: BboxMargins, unit: BboxUnit): string {
  const suffix = unit === 'percent' ? '%' : 'px';
  const sides: Array<[keyof BboxMargins, string]> = [
    ['top', 'top'],
    ['right', 'right'],
    ['bottom', 'bottom'],
    ['left', 'left'],
  ];

  const parts = sides
    .map(([key, label]) => {
      const delta = margins[key] - defaultMargins[key];
      if (delta === 0) return null;
      const sign = delta > 0 ? '+' : '';
      return `${sign}${delta}${suffix} ${label}`;
    })
    .filter((p): p is string => p !== null);

  return parts.length === 0 ? 'No change from default' : `Δ ${parts.join(', ')}`;
}

// ── Handle positions ──────────────────────────────────────────────────────────
// 8 draggable handles at corners + edge midpoints.
// M5: render-only (visual decoration). Drag wiring is a Phase 2 follow-on.

interface HandlePos {
  key: string;
  /** Left position as fraction of container width (0–1). */
  xFrac: number;
  /** Top position as fraction of container height (0–1). */
  yFrac: number;
  /** Cursor for future drag affordance. */
  cursor: string;
}

const HANDLE_POSITIONS: ReadonlyArray<HandlePos> = [
  { key: 'tl', xFrac: 0, yFrac: 0, cursor: 'nwse-resize' },
  { key: 'tc', xFrac: 0.5, yFrac: 0, cursor: 'ns-resize' },
  { key: 'tr', xFrac: 1, yFrac: 0, cursor: 'nesw-resize' },
  { key: 'ml', xFrac: 0, yFrac: 0.5, cursor: 'ew-resize' },
  { key: 'mr', xFrac: 1, yFrac: 0.5, cursor: 'ew-resize' },
  { key: 'bl', xFrac: 0, yFrac: 1, cursor: 'nesw-resize' },
  { key: 'bc', xFrac: 0.5, yFrac: 1, cursor: 'ns-resize' },
  { key: 'br', xFrac: 1, yFrac: 1, cursor: 'nwse-resize' },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * BboxEditor
 *
 * Two-column layout:
 *   Left (center): ArtifactViewer with DOM overlay bbox rect + 8 handle dots.
 *   Right: margin inputs, unit toggle, delta display, scope toggle, apply button.
 */
export const BboxEditor = React.forwardRef<HTMLDivElement, BboxEditorProps>(function BboxEditor(
  {
    page,
    margins,
    onMarginsChange,
    unit,
    onUnitChange,
    scope,
    onScopeChange,
    selectedCount,
    flaggedCount,
    onApply,
    'data-testid': testId = BBOX_EDITOR,
  },
  ref,
) {
  // ── Scope options (built dynamically so counts appear in labels) ──────────
  const scopeOptions: ReadonlyArray<SegmentedOption> = React.useMemo(
    () => [
      { value: 'thisPage', label: 'This page' },
      {
        value: 'selectedN',
        label: selectedCount != null ? `Selected (${selectedCount})` : 'Selected',
      },
      {
        value: 'allFlagged',
        label: flaggedCount != null ? `All flagged (${flaggedCount})` : 'All flagged',
      },
    ],
    [selectedCount, flaggedCount],
  );

  // ── Margin input handler ──────────────────────────────────────────────────
  const handleMarginChange = React.useCallback(
    (side: keyof BboxMargins, value: string) => {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) return;
      onMarginsChange({ ...margins, [side]: parsed });
    },
    [margins, onMarginsChange],
  );

  // ── Bbox rect overlay (DOM, not Konva) ────────────────────────────────────
  // We render an absolutely-positioned div that represents the bbox rect
  // on top of the ArtifactViewer. In M5 the positions are approximations
  // based on the margin values relative to page dimensions.
  //
  // When unit='px': margins are in pixels relative to pageWidth/pageHeight.
  // When unit='percent': margins are % of pageWidth/pageHeight.

  const { pageWidth, pageHeight } = page;

  const topPx = unit === 'percent' ? (margins.top / 100) * pageHeight : margins.top;
  const rightPx = unit === 'percent' ? (margins.right / 100) * pageWidth : margins.right;
  const bottomPx = unit === 'percent' ? (margins.bottom / 100) * pageHeight : margins.bottom;
  const leftPx = unit === 'percent' ? (margins.left / 100) * pageWidth : margins.left;

  // Fractions for CSS positioning (percent of container)
  const topFrac = topPx / pageHeight;
  const leftFrac = leftPx / pageWidth;
  const widthFrac = Math.max(0, 1 - leftPx / pageWidth - rightPx / pageWidth);
  const heightFrac = Math.max(0, 1 - topPx / pageHeight - bottomPx / pageHeight);

  // ── Delta text ────────────────────────────────────────────────────────────
  const deltaText = formatDelta(margins, page.defaultMargins, unit);

  // ── Unit suffix for inputs ────────────────────────────────────────────────
  const unitSuffix = unit === 'percent' ? '%' : 'px';

  return (
    <div ref={ref} className="bbox-editor" data-testid={testId}>
      {/* ── Left column: ArtifactViewer + bbox overlay ── */}
      <div className="bbox-editor__canvas-col">
        <div className="bbox-editor__viewer-wrap">
          <ArtifactViewer
            imageSrc={page.imageUrl}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            overlayMode="view"
          />
          {/* DOM bbox rect overlay (not inside Konva — M5 spec) */}
          <div className="bbox-editor__overlay" aria-hidden="true">
            {/* Bbox rect */}
            <div
              className="bbox-editor__bbox-rect"
              style={{
                position: 'absolute',
                top: `${topFrac * 100}%`,
                left: `${leftFrac * 100}%`,
                width: `${widthFrac * 100}%`,
                height: `${heightFrac * 100}%`,
              }}
            >
              {/* 8 handle dots — visual only in M5 */}
              {HANDLE_POSITIONS.map((pos) => (
                <div
                  key={pos.key}
                  className="bbox-editor__handle"
                  data-handle={pos.key}
                  style={{
                    position: 'absolute',
                    left: `${pos.xFrac * 100}%`,
                    top: `${pos.yFrac * 100}%`,
                    cursor: pos.cursor,
                    transform: 'translate(-50%, -50%)',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column: controls ── */}
      <div className="bbox-editor__controls-col">
        {/* Margin inputs */}
        <fieldset className="bbox-editor__margins">
          <legend className="bbox-editor__margins-legend">Margins</legend>

          {(
            [
              ['top', 'Top'],
              ['right', 'Right'],
              ['bottom', 'Bottom'],
              ['left', 'Left'],
            ] as const
          ).map(([side, label]) => (
            <div key={side} className="bbox-editor__margin-row">
              <label className="bbox-editor__margin-label" htmlFor={`bbox-editor-margin-${side}`}>
                {label}
              </label>
              <input
                id={`bbox-editor-margin-${side}`}
                className="bbox-editor__margin-input"
                type="number"
                value={margins[side]}
                onChange={(e) => {
                  handleMarginChange(side, e.target.value);
                }}
                data-testid={bboxEditorMarginTestId(side)}
                aria-label={`${label} margin in ${unitSuffix}`}
              />
              <span className="bbox-editor__margin-suffix" aria-hidden="true">
                {unitSuffix}
              </span>
            </div>
          ))}
        </fieldset>

        {/* Unit toggle */}
        <div className="bbox-editor__unit-toggle">
          <span className="bbox-editor__control-label">Unit</span>
          <Segmented
            options={UNIT_OPTIONS as SegmentedOption[]}
            value={unit}
            onChange={(val) => {
              onUnitChange(val as BboxUnit);
            }}
            aria-label="Margin unit"
          />
        </div>

        {/* Delta-from-default display */}
        <div className="bbox-editor__delta" aria-live="polite">
          <span className="bbox-editor__delta-text">{deltaText}</span>
        </div>

        {/* Apply scope */}
        <div className="bbox-editor__scope">
          <span className="bbox-editor__control-label">Apply to</span>
          <Segmented
            options={scopeOptions as SegmentedOption[]}
            value={scope}
            onChange={(val) => {
              onScopeChange(val as BboxScope);
            }}
            aria-label="Apply scope"
          />
        </div>

        {/* Apply button */}
        <div className="bbox-editor__apply">
          <Button variant="primary" onClick={onApply} data-testid={BBOX_EDITOR_APPLY} full>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
});
