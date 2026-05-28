/**
 * OcrTextPanel — right-drawer OCR text review panel (Phase 2 M2).
 *
 * Spec §6.2 line 347: "Right-drawer OCR text review: LineBlockCards /
 * LineBlockRows / WordCard / WordRow with ConfPip (confidence pip)."
 *
 * Renders a scrollable list of OCR lines in either cards or rows view mode.
 * Each line shows its words with per-word confidence indicators (ConfPip).
 * Clicking a word fires `onWordEdit(wordId)` for the consumer to open their
 * own edit UI.
 */
import * as React from 'react';
import { Segmented } from '../../primitives/index.js';
import { LineBlockCard } from './LineBlockCard.js';
import { LineBlockRow } from './LineBlockRow.js';
import { OCR_TEXT_PANEL, OCR_TEXT_PANEL_VIEW_TOGGLE } from '../../testids/index.js';

// ── Public types ──────────────────────────────────────────────────────────────

export interface OcrWord {
  id: string;
  text: string;
  /** Confidence 0–1 (used by ConfPip tone). */
  confidence: number;
  /** Optional flags shown as inline indicators (e.g. 'dict-miss', 'low-conf'). */
  flags?: ReadonlyArray<string>;
}

export interface OcrLine {
  id: string;
  /** Line text (used as fallback when words are absent). */
  text: string;
  words?: ReadonlyArray<OcrWord>;
  /** Optional block-level grouping for visual separation. */
  blockId?: string;
}

export type OcrViewMode = 'cards' | 'rows';

export interface OcrTextPanelProps {
  lines: ReadonlyArray<OcrLine>;
  /** Defaults to 'cards'. */
  viewMode?: OcrViewMode;
  onViewModeChange?: (m: OcrViewMode) => void;
  onWordEdit?: (wordId: string) => void;
  /** Optional title. Defaults to "OCR text". */
  title?: string;
  'data-testid'?: string;
}

// ── Segmented options ─────────────────────────────────────────────────────────

const VIEW_OPTIONS = [
  { value: 'cards', label: 'Cards' },
  { value: 'rows', label: 'Rows' },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * OcrTextPanel — right-drawer panel for reviewing OCR output.
 *
 * @example
 *   <OcrTextPanel
 *     lines={ocrLines}
 *     viewMode={viewMode}
 *     onViewModeChange={setViewMode}
 *     onWordEdit={(id) => openWordEditor(id)}
 *   />
 */
// VIEW_OPTION values are a closed set matching OcrViewMode; narrow explicitly.
const VIEW_MODE_VALUES = new Set<OcrViewMode>(['cards', 'rows']);
function isOcrViewMode(v: string): v is OcrViewMode {
  return VIEW_MODE_VALUES.has(v as OcrViewMode);
}

export const OcrTextPanel = React.forwardRef<HTMLElement, OcrTextPanelProps>(function OcrTextPanel(
  {
    lines,
    viewMode = 'cards',
    onViewModeChange,
    onWordEdit,
    title = 'OCR text',
    'data-testid': testId,
  },
  ref,
): React.ReactElement {
  const outerTestId = testId ?? OCR_TEXT_PANEL;

  return (
    <aside
      ref={ref}
      className="ocr-text-panel"
      data-testid={outerTestId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'var(--bg-page)',
      }}
    >
      {/* Header */}
      <div
        className="ocr-text-panel__header"
        style={{
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)' }}>{title}</span>

        {onViewModeChange != null && (
          <span data-testid={OCR_TEXT_PANEL_VIEW_TOGGLE}>
            <Segmented
              options={VIEW_OPTIONS}
              value={viewMode}
              onChange={(v) => {
                if (isOcrViewMode(v)) onViewModeChange(v);
              }}
              size="sm"
            />
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div
        className="ocr-text-panel__body"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {lines.length === 0 ? (
          <div
            className="ocr-text-panel__empty"
            style={{ color: 'var(--ink-4)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}
          >
            No lines
          </div>
        ) : (
          lines.map((line) =>
            viewMode === 'cards' ? (
              <LineBlockCard
                key={line.id}
                line={line}
                {...(onWordEdit != null ? { onWordEdit } : {})}
              />
            ) : (
              <LineBlockRow
                key={line.id}
                line={line}
                {...(onWordEdit != null ? { onWordEdit } : {})}
              />
            ),
          )
        )}
      </div>
    </aside>
  );
});

OcrTextPanel.displayName = 'OcrTextPanel';
