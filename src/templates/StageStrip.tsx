/**
 * StageStrip — cross-stage pipeline progress + nav molecule.
 *
 * Design source: `StageContextStrip` in docs/templates/design_handoff_pdomain_ui/
 * (wf02/pipeline-shell.jsx, wf03/wf03-variations.jsx, wf05/pipeline-shell.jsx,
 * wf05b/pipeline-shell.jsx, wf09/pipeline-shell.jsx, wf10/pipeline-shell.jsx,
 * wf11/wf03-variations.jsx, wf-pw/wf03-variations.jsx).
 *
 * Name reconciliation: the design source exports `StageContextStrip`; the
 * pdomain-ui plan (Task 7, docs/plans/2026-05-24-pdomain-ui-design-handoff.md) exports
 * it as `StageStrip` — a cleaner library API name. Both names refer to the
 * same molecule.
 *
 * Structure:
 *   [Stage label · current-stage pill · KeyCap] | [pipeline dot track] | [counts] [prev/next] [actions?]
 *
 * Status behavior:
 *   running=true  → dot color uses --ocr + pgd-pulse animation
 *   running=false → dot color uses --exact (default)
 *   flagged       → shows error count + disables Next button when > 0
 *   dirty         → shows warning count
 *   neither       → shows "all checks green"
 */
import * as React from 'react';
import { Icon } from '../icons/Icon.js';
import { Button } from '../primitives/Button.js';
import { KeyCap } from '../primitives/KeyCap.js';
import { Separator } from '../primitives/Separator.js';
import { cn } from '../primitives/cn.js';

// ─────────────────────────────────────────────────────────────────────────────
// Stage descriptor type
// ─────────────────────────────────────────────────────────────────────────────

export interface StageDef {
  /** Unique stage identifier (matches backend stage key). */
  id: string;
  /** Abbreviated label shown inside the expanded stage dot. */
  short: string;
  /** Group label (Source / Image / OCR / Pack). */
  group: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical 22-stage pipeline (matches design STAGE_DEFS)
// ─────────────────────────────────────────────────────────────────────────────

export const PIPELINE_STAGES: readonly StageDef[] = [
  { id: 'source', short: 'source', group: 'Source' },
  { id: 'initial_crop', short: 'init crop', group: 'Source' },
  { id: 'dewarp', short: 'dewarp', group: 'Source' },
  { id: 'deskew', short: 'deskew', group: 'Source' },
  { id: 'grayscale', short: 'grayscale', group: 'Image' },
  { id: 'threshold', short: 'threshold', group: 'Image' },
  { id: 'denoise', short: 'denoise', group: 'Image' },
  { id: 'canvas_map', short: 'canvas', group: 'Image' },
  { id: 'text_zones', short: 'zones', group: 'OCR' },
  { id: 'ocr', short: 'ocr', group: 'OCR' },
  { id: 'spellcheck', short: 'spell', group: 'OCR' },
  { id: 'text_review', short: 'review', group: 'OCR' },
  { id: 'illust', short: 'illust', group: 'Pack' },
  { id: 'hyphen_join', short: 'hyphen', group: 'Pack' },
  { id: 'regex', short: 'regex', group: 'Pack' },
  { id: 'page_split', short: 'split', group: 'Pack' },
  { id: 'proof_pack', short: 'proof', group: 'Pack' },
  { id: 'build_package', short: 'package', group: 'Pack' },
  { id: 'validation', short: 'validate', group: 'Pack' },
  { id: 'zip', short: 'zip', group: 'Pack' },
  { id: 'submit_check', short: 'submit', group: 'Pack' },
  { id: 'archive', short: 'archive', group: 'Pack' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface StageStripProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered list of pipeline stage descriptors. */
  stages: StageDef[];
  /** Id of the currently active stage. Falls back to first stage if not found. */
  current: string;
  /** When true, the current stage dot pulses with the --ocr color instead of --exact. */
  running?: boolean;
  /** Error count shown at the right edge. When > 0, disables the Next button. */
  flagged?: number;
  /** Warning count shown at the right edge. */
  dirty?: number;
  /** Called with a stage id when the user clicks a pipeline dot or the current-stage pill. */
  onStageClick?: (stageId: string) => void;
  /** Called when the Prev button is clicked. */
  onPrev?: () => void;
  /** Called when the Next button is clicked. */
  onNext?: () => void;
  /**
   * Optional slot rendered after the Prev/Next buttons.
   * Use for per-stage action buttons or supplementary controls.
   */
  actions?: React.ReactNode;
  /**
   * Context variant — non-breaking Phase 2 M10 addition.
   *
   * - `'default'` (or omitted) — standard pipeline workbench context.
   * - `'configure'` — Project Configure → Pages tab context
   *   (design source: `wf03/wf03-variations.jsx:375-451`).
   *   Applies the `stage-strip--configure` CSS modifier to the root element,
   *   enabling context-specific overrides in the consuming app's stylesheet.
   *   Visual rendering is identical to `'default'` in pdomain-ui's base theme.
   */
  variant?: 'default' | 'configure';
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const StageStrip = React.forwardRef<HTMLDivElement, StageStripProps>(function StageStrip(
  {
    className,
    stages,
    current,
    running = false,
    flagged,
    dirty,
    onStageClick,
    onPrev,
    onNext,
    actions,
    variant,
    ...props
  },
  ref,
) {
  const idx = Math.max(
    0,
    stages.findIndex((s) => s.id === current),
  );
  const cur = stages[idx];

  return (
    <div
      ref={ref}
      className={cn(
        'stage-strip',
        running ? 'stage-strip--running' : undefined,
        variant === 'configure' ? 'stage-strip--configure' : undefined,
        className,
      )}
      {...props}
    >
      {/* ── Left: stage label + current-stage pill + KeyCap ── */}
      <div className="stage-strip__label-col">
        <span className="stage-strip__label-text">Stage</span>
        <button
          type="button"
          className={cn(
            'stage-strip__pill',
            running ? 'stage-strip__pill--running' : 'stage-strip__pill--done',
          )}
          title={cur?.id}
          onClick={() => cur != null && onStageClick?.(cur.id)}
          aria-label={`Current stage: ${cur?.id ?? 'unknown'}`}
        >
          <span className="stage-strip__pill-dot" aria-hidden="true" />
          <span className="stage-strip__pill-id mono">{cur?.id}</span>
          <span className="stage-strip__pill-counter mono">
            {idx + 1}/{stages.length}
          </span>
          <Icon name="chevD" size={12} className="stage-strip__pill-chev" />
        </button>
        <KeyCap keys="⌘P" />
      </div>

      <Separator orientation="vertical" className="stage-strip__sep" />

      {/* ── Center: pipeline dot track ── */}
      <div className="stage-strip__track" role="list" aria-label="Pipeline stages">
        {stages.map((s, i) => {
          const isCur = i === idx;
          const isDone = i < idx;

          return (
            <React.Fragment key={s.id}>
              <div role="listitem" className="stage-strip__track-item">
                {isCur ? (
                  /* Expanded current-stage dot */
                  <button
                    type="button"
                    title={s.id}
                    className={cn(
                      'stage-strip__dot-cur',
                      running ? 'stage-strip__dot-cur--running' : 'stage-strip__dot-cur--done',
                    )}
                    onClick={() => onStageClick?.(s.id)}
                    aria-current="step"
                    aria-label={`Current: ${s.id}`}
                  >
                    <span className="stage-strip__dot-pip" aria-hidden="true" />
                    <span className="stage-strip__dot-label mono">{s.short}</span>
                  </button>
                ) : (
                  /* Collapsed non-current dot */
                  <button
                    type="button"
                    title={`${i + 1}. ${s.id}`}
                    className="stage-strip__dot-item"
                    onClick={() => onStageClick?.(s.id)}
                    aria-label={`${isDone ? 'Done' : 'Pending'}: ${s.id}`}
                  >
                    <span
                      className={cn(
                        'stage-strip__dot-pip',
                        isDone ? 'stage-strip__dot-pip--done' : 'stage-strip__dot-pip--pending',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
              {i < stages.length - 1 ? (
                <span className="stage-strip__connector" aria-hidden="true" />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      <Separator orientation="vertical" className="stage-strip__sep" />

      {/* ── Right: error / warning counts ── */}
      <div className="stage-strip__counts mono">
        {flagged != null ? (
          <span className="stage-strip__flagged">
            <span className="stage-strip__count">{flagged}</span> errors
          </span>
        ) : null}
        {flagged != null && dirty != null ? (
          <span className="stage-strip__dot-sep" aria-hidden="true">
            {' '}
            ·{' '}
          </span>
        ) : null}
        {dirty != null ? (
          <span className="stage-strip__dirty">
            <span className="stage-strip__count stage-strip__count--dirty">{dirty}</span> warnings
          </span>
        ) : null}
        {flagged == null && dirty == null ? (
          <span className="stage-strip__all-green">all checks green</span>
        ) : null}
      </div>

      {/* ── Nav buttons ── */}
      <div className="stage-strip__nav">
        <Button
          variant="ghost"
          size="sm"
          icon={<Icon name="chevL" size={14} />}
          onClick={onPrev}
          aria-label="Previous stage"
        >
          Prev
        </Button>
        <Button
          variant="primary"
          size="sm"
          iconRight={<Icon name="chevR" size={14} />}
          disabled={flagged != null && flagged > 0}
          onClick={onNext}
          aria-label="Next stage"
        >
          Next
        </Button>
      </div>

      {/* ── Optional actions slot ── */}
      {actions != null ? <div className="stage-strip__actions">{actions}</div> : null}
    </div>
  );
});

StageStrip.displayName = 'StageStrip';
