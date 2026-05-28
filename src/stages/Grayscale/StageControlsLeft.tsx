import * as React from 'react';
// Import StageControlsPanel directly from its source file (NOT the PageWorkbench
// barrel) to avoid pulling in LabelerCanvas → react-konva, which breaks jsdom tests.
import { StageControlsPanel } from '../PageWorkbench/StageControlsPanel.js';
import type { Inheritance } from '../PageWorkbench/StageControlsPanel.js';
import { ModeCard } from './ModeCard.js';
import type { ModeCardProps, GrayscaleMode } from './ModeCard.js';
import { AdvancedParams } from './AdvancedParams.js';
import type { GrayscaleParams } from './AdvancedParams.js';

type ModeCardEstimates = ModeCardProps['estimates'];

const DEFAULT_ESTIMATES: ModeCardEstimates = {
  standard: { secondsPerPage: 0.5, tone: 'exact' },
  perceptual: { secondsPerPage: 1.0, tone: 'exact' },
};

export interface StageControlsLeftProps {
  inheritance: Inheritance;
  presetName?: string;
  /** GPU/CPU backend; caller derives `cpuFallback` from backend state. */
  backend: 'gpu' | 'cpu' | 'auto';
  cpuFallback?: boolean;
  mode: GrayscaleMode;
  onModeChange: (mode: GrayscaleMode) => void;
  modeEstimates?: ModeCardEstimates;
  params: GrayscaleParams;
  onParamsChange: (next: GrayscaleParams) => void;
  onRevert?: () => void;
  onSave?: () => void;
  'data-testid'?: string;
}

export const StageControlsLeft = React.forwardRef<HTMLElement, StageControlsLeftProps>(
  function StageControlsLeft(
    {
      inheritance,
      presetName,
      // backend is accepted for API stability but CPU-fallback wiring is deferred.
      // See ConcaveTrillion/ocr-container-meta — "StageControlsLeft backend wiring".
      backend: _backend, // eslint-disable-line @typescript-eslint/no-unused-vars
      cpuFallback,
      mode,
      onModeChange,
      modeEstimates,
      params,
      onParamsChange,
      onRevert,
      onSave,
      'data-testid': testId,
    },
    ref,
  ) {
    const estimates = modeEstimates ?? DEFAULT_ESTIMATES;

    const controls = (
      <>
        <ModeCard selectedMode={mode} onModeChange={onModeChange} estimates={estimates} />
        <AdvancedParams params={params} onChange={onParamsChange} />
      </>
    );

    return (
      <StageControlsPanel
        ref={ref}
        inheritance={inheritance}
        {...(presetName !== undefined ? { presetName } : {})}
        {...(cpuFallback !== undefined ? { cpuFallback } : {})}
        controlsSlot={controls}
        {...(onRevert !== undefined ? { onRevert } : {})}
        {...(onSave !== undefined ? { onSave } : {})}
        {...(testId !== undefined ? { 'data-testid': testId } : {})}
      />
    );
  },
);

StageControlsLeft.displayName = 'StageControlsLeft';
