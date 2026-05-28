import * as React from 'react';
import { Banner } from '../../primitives/Banner.js';
import { Button } from '../../primitives/Button.js';
import { CROP_BANNER, CROP_BANNER_RERUN } from '../../testids/index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

export type CropState = 'running' | 'review' | 'done' | 'error';

export interface CropFlagCounts {
  overCrop: number;
  underCrop: number;
  deskewFail: number;
  edgeNoise: number;
}

export interface CropBannerProps {
  /** Current crop pipeline state. */
  state: CropState;
  /** Progress 0–1 for the running state. */
  progress?: number;
  /** Flag tallies for the review state. */
  flagCounts?: CropFlagCounts;
  /** Re-run callback for review/done/error states. */
  onRerun?: () => void;
  /** Optional error detail message for the error state. */
  errorMessage?: string;
  /** Override the root element's data-testid. Defaults to `CROP_BANNER`. */
  'data-testid'?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a human-readable flag summary, e.g. "3 over-crop · 2 deskew fail". */
function buildFlagSummary(counts: CropFlagCounts): string {
  const parts: string[] = [];
  if (counts.overCrop > 0) parts.push(`${counts.overCrop} over-crop`);
  if (counts.underCrop > 0) parts.push(`${counts.underCrop} under-crop`);
  if (counts.deskewFail > 0) parts.push(`${counts.deskewFail} deskew fail`);
  if (counts.edgeNoise > 0) parts.push(`${counts.edgeNoise} edge noise`);
  if (parts.length === 0) return 'No flags.';
  return parts.join(' · ');
}

/** Render an inline progress bar for the running state. */
function ProgressBar({ value }: { value: number }): React.ReactElement {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      className="crop-banner__progress-track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Crop progress"
    >
      <div className="crop-banner__progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CropBanner — state-machine banner for the Crop pipeline stage.
 *
 * Encapsulates three states (running / review / done) and maps each to
 * the shared `Banner` primitive via tone + headline + subtext + actions slots.
 *
 * - `running`: info tone, progress percentage + inline progress bar footer.
 * - `review`:  warning tone, flag-count summary, Re-run action.
 * - `done`:    success tone, clean confirmation, optional Re-run action.
 */
export function CropBanner({
  state,
  progress = 0,
  flagCounts,
  onRerun,
  errorMessage,
  'data-testid': testId = CROP_BANNER,
}: CropBannerProps): React.ReactElement {
  const rerunButton =
    onRerun != null ? (
      <Button variant="ghost" size="sm" data-testid={CROP_BANNER_RERUN} onClick={onRerun}>
        Re-run
      </Button>
    ) : null;

  if (state === 'running') {
    const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
    return (
      <Banner
        tone="info"
        headline="Cropping pages…"
        subtext={`${pct}% complete`}
        footer={<ProgressBar value={progress} />}
        data-testid={testId}
      />
    );
  }

  if (state === 'review') {
    const summary = flagCounts != null ? buildFlagSummary(flagCounts) : 'Flags detected.';
    return (
      <Banner
        tone="warning"
        headline="Review crops"
        subtext={summary}
        actions={rerunButton}
        data-testid={testId}
      />
    );
  }

  if (state === 'error') {
    return (
      <Banner
        tone="danger"
        headline="Crop pipeline failed"
        subtext={errorMessage ?? 'An error occurred during cropping. Check logs and re-run.'}
        actions={rerunButton}
        data-testid={testId}
      />
    );
  }

  // state === 'done'
  return (
    <Banner
      tone="success"
      headline="Crops ready"
      subtext="No flags to review."
      actions={rerunButton}
      data-testid={testId}
    />
  );
}

CropBanner.displayName = 'CropBanner';
