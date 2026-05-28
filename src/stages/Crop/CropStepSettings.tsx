import * as React from 'react';
import { Banner } from '../../primitives/Banner.js';
import { Button } from '../../primitives/Button.js';
import { Toggle } from '../../primitives/Toggle.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CropStrategy = 'edgeDetect' | 'mlModel' | 'manual' | 'fromSource';

export interface CropSettings {
  strategy: CropStrategy;
  /** Margin slack in % (0-20). */
  marginSlackPct: number;
  /** Symmetry guard toggle. */
  symmetryGuard: boolean;
  /** Min page area as fraction (0-1). */
  minPageArea: number;
  /** Auto-accept clean crops. */
  autoAccept: boolean;
  /** Re-deskew automatically after crop. */
  redeskewAfterCrop: boolean;
}

export interface CropStepSettingsProps {
  settings: CropSettings;
  onChange: (next: CropSettings) => void;
  /** When true, show "Settings have changed — re-run to apply" warning. */
  stale?: boolean;
  onRerun?: () => void;
  'data-testid'?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CROP_SETTINGS_DEFAULT: CropSettings = {
  strategy: 'edgeDetect',
  marginSlackPct: 5,
  symmetryGuard: true,
  minPageArea: 0.3,
  autoAccept: false,
  redeskewAfterCrop: true,
};

const STRATEGY_OPTIONS: Array<{ value: CropStrategy; label: string; sub: string }> = [
  { value: 'edgeDetect', label: 'Edge-detect', sub: 'Sobel + RANSAC fit' },
  { value: 'mlModel', label: 'ML model', sub: 'page-segment v3' },
  { value: 'manual', label: 'Manual margins', sub: 'Fixed t/r/b/l' },
  { value: 'fromSource', label: 'From source bbox', sub: 'Reuse Source stage crop' },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CropStepSettings — Settings panel for the Crop stage.
 *
 * Controls auto-crop strategy, margin slack, symmetry guard, min page area,
 * auto-accept, and re-deskew. All field changes fire `onChange` with the
 * full updated `CropSettings` (immutable spread).
 *
 * When `stale` is true, a warning banner is shown with an optional "Re-run now"
 * button that calls `onRerun`.
 */
export function CropStepSettings({
  settings,
  onChange,
  stale,
  onRerun,
  'data-testid': testid,
}: CropStepSettingsProps): React.ReactElement {
  function handleStrategy(value: CropStrategy) {
    onChange({ ...settings, strategy: value });
  }

  function handleMarginSlack(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, marginSlackPct: Number(e.target.value) });
  }

  function handleSymmetryGuard(checked: boolean) {
    onChange({ ...settings, symmetryGuard: checked });
  }

  function handleMinPageArea(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, minPageArea: Number(e.target.value) });
  }

  function handleAutoAccept(checked: boolean) {
    onChange({ ...settings, autoAccept: checked });
  }

  function handleRedeskew(checked: boolean) {
    onChange({ ...settings, redeskewAfterCrop: checked });
  }

  return (
    <div className="crop-step-settings" data-testid={testid ?? 'crop-step-settings'}>
      <div className="crop-step-settings__header">
        <h2 className="crop-step-settings__title">Stage settings · Crop</h2>
        <p className="crop-step-settings__subtitle">
          Auto-crop strategy, margin guards, and how the worker decides what to flag for review.
        </p>
      </div>

      {stale === true ? (
        <Banner
          tone="warning"
          headline="Settings have changed — re-run to apply"
          actions={
            onRerun != null ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRerun}
                data-testid="crop-step-settings-rerun"
              >
                Re-run now
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {/* Strategy */}
      <fieldset className="crop-step-settings__fieldset">
        <legend className="crop-step-settings__legend">
          <span className="crop-step-settings__field-label">Auto-crop strategy</span>
          <span className="crop-step-settings__field-sub">
            How the worker picks the bbox per page
          </span>
        </legend>
        <div className="crop-step-settings__strategy-grid">
          {STRATEGY_OPTIONS.map((opt) => {
            const active = settings.strategy === opt.value;
            return (
              <label
                key={opt.value}
                className={
                  'crop-step-settings__strategy-card' +
                  (active ? ' crop-step-settings__strategy-card--active' : '')
                }
              >
                <input
                  type="radio"
                  name="crop-strategy"
                  value={opt.value}
                  checked={active}
                  onChange={() => {
                    handleStrategy(opt.value);
                  }}
                  data-testid={`crop-strategy-${opt.value}`}
                  aria-label={opt.label}
                  className="crop-step-settings__radio"
                />
                <span className="crop-step-settings__strategy-name">{opt.label}</span>
                <span className="crop-step-settings__strategy-sub">{opt.sub}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Settings rows */}
      <div className="crop-step-settings__rows">
        {/* Margin slack */}
        <div className="crop-step-settings__row">
          <div className="crop-step-settings__row-info">
            <span className="crop-step-settings__field-label">Margin slack</span>
            <span className="crop-step-settings__field-sub">
              Extra padding the worker keeps around detected page edges
            </span>
          </div>
          <div className="crop-step-settings__slider-wrap">
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={settings.marginSlackPct}
              onChange={handleMarginSlack}
              aria-label="Margin slack"
              className="crop-step-settings__range"
            />
            <span className="crop-step-settings__value">{settings.marginSlackPct}%</span>
          </div>
        </div>

        {/* Symmetry guard */}
        <div className="crop-step-settings__row">
          <div className="crop-step-settings__row-info">
            <span className="crop-step-settings__field-label">Symmetry guard</span>
            <span className="crop-step-settings__field-sub">
              Flag pages where opposing margins differ by &gt; 12%
            </span>
          </div>
          <Toggle
            checked={settings.symmetryGuard}
            onCheckedChange={handleSymmetryGuard}
            label="Symmetry guard"
          />
        </div>

        {/* Min page area */}
        <div className="crop-step-settings__row">
          <div className="crop-step-settings__row-info">
            <span className="crop-step-settings__field-label">Min page area</span>
            <span className="crop-step-settings__field-sub">
              Pages below this trigger an overflow flag
            </span>
          </div>
          <div className="crop-step-settings__slider-wrap">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.minPageArea}
              onChange={handleMinPageArea}
              aria-label="Min page area"
              className="crop-step-settings__range"
            />
            <span className="crop-step-settings__value">
              {Math.round(settings.minPageArea * 100)}%
            </span>
          </div>
        </div>

        {/* Auto-accept */}
        <div className="crop-step-settings__row">
          <div className="crop-step-settings__row-info">
            <span className="crop-step-settings__field-label">Auto-accept on green</span>
            <span className="crop-step-settings__field-sub">
              Pages that clear every check skip the review step
            </span>
          </div>
          <Toggle
            checked={settings.autoAccept}
            onCheckedChange={handleAutoAccept}
            label="Auto-accept on green"
          />
        </div>

        {/* Re-deskew after crop */}
        <div className="crop-step-settings__row">
          <div className="crop-step-settings__row-info">
            <span className="crop-step-settings__field-label">Re-deskew after crop</span>
            <span className="crop-step-settings__field-sub">
              Tiny rotation pass so downstream stages get true rectangles
            </span>
          </div>
          <Toggle
            checked={settings.redeskewAfterCrop}
            onCheckedChange={handleRedeskew}
            label="Re-deskew after crop"
          />
        </div>
      </div>
    </div>
  );
}
