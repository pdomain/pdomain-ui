import * as React from 'react';
import { Badge } from '../../primitives/Badge.js';
import { MODE_CARD_GROUP, modeCardTestId } from '../../testids/index.js';
import type { GrayscaleMode } from './types.js';

export type { GrayscaleMode };

/** Tone of the estimate badge. `exact` = reliable (green); `fuzzy` = rough (amber). */
export type EstimateTone = 'exact' | 'fuzzy';

/** Time estimate for one grayscale mode. */
export interface ModeEstimate {
  /** Estimated processing time per page, in seconds. */
  secondsPerPage: number;
  /** How reliable this estimate is. */
  tone: EstimateTone;
}

export interface ModeCardProps {
  /** Which mode is currently selected. */
  selectedMode: GrayscaleMode;
  /** Called when the user selects a different mode. */
  onModeChange: (mode: GrayscaleMode) => void;
  /** Time estimates for each mode. */
  estimates: {
    standard: ModeEstimate;
    perceptual: ModeEstimate;
  };
  /** Forwarded to the outer radiogroup wrapper. */
  'data-testid'?: string;
}

interface ModeCardItemProps {
  mode: GrayscaleMode;
  label: string;
  description: string;
  estimate: ModeEstimate;
  isSelected: boolean;
  onSelect: (mode: GrayscaleMode) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

function ModeCardItem({
  mode,
  label,
  description,
  estimate,
  isSelected,
  onSelect,
  onKeyDown,
}: ModeCardItemProps): React.ReactElement {
  return (
    <button
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      data-testid={modeCardTestId(mode)}
      className={`mode-card${isSelected ? ' mode-card--selected' : ''}`}
      onClick={() => {
        onSelect(mode);
      }}
      onKeyDown={onKeyDown}
      type="button"
    >
      <div className="mode-card__header">
        <span className="mode-card__check" aria-hidden="true">
          {isSelected ? '✓' : ''}
        </span>
        <h3 className="mode-card__name">{label}</h3>
        <Badge tone={estimate.tone}>~{estimate.secondsPerPage}s/page</Badge>
      </div>
      <p className="mode-card__description">{description}</p>
    </button>
  );
}

const GRAYSCALE_MODES: ReadonlyArray<GrayscaleMode> = ['standard', 'perceptual'];

const MODE_META: Record<GrayscaleMode, { label: string; description: string }> = {
  standard: {
    label: 'Standard',
    description: 'Linear luminance — fastest, suitable for clean text scans.',
  },
  perceptual: {
    label: 'Perceptual',
    description: 'Tonal compression — preserves detail in halftones and illustrations.',
  },
};

/**
 * ModeCard — two-up radio-style chooser for Grayscale conversion mode.
 *
 * Renders Standard and Perceptual as large button cards inside a radiogroup.
 * Each card displays the mode name, a description, and a time-estimate badge
 * whose tone (`exact` / `fuzzy`) signals estimate reliability.
 */
export const ModeCard = React.forwardRef<HTMLDivElement, ModeCardProps>(function ModeCard(
  { selectedMode, onModeChange, estimates, 'data-testid': testId },
  ref,
) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentMode: GrayscaleMode) => {
      const currentIdx = GRAYSCALE_MODES.indexOf(currentMode);
      const last = GRAYSCALE_MODES.length - 1;
      let nextIdx = currentIdx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = currentIdx === last ? 0 : currentIdx + 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIdx = currentIdx === 0 ? last : currentIdx - 1;
      } else {
        return;
      }
      e.preventDefault();
      const nextMode = GRAYSCALE_MODES[nextIdx];
      if (nextMode !== undefined) {
        onModeChange(nextMode);
      }
    },
    [onModeChange],
  );

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="Grayscale conversion mode"
      data-testid={testId ?? MODE_CARD_GROUP}
      className="mode-card-group"
    >
      {GRAYSCALE_MODES.map((mode) => (
        <ModeCardItem
          key={mode}
          mode={mode}
          label={MODE_META[mode].label}
          description={MODE_META[mode].description}
          estimate={estimates[mode]}
          isSelected={selectedMode === mode}
          onSelect={onModeChange}
          onKeyDown={(e) => {
            handleKeyDown(e, mode);
          }}
        />
      ))}
    </div>
  );
});
