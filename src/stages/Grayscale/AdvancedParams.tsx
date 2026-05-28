/**
 * AdvancedParams — Grayscale stage advanced parameters accordion.
 *
 * 3-slider accordion: Sampler radius / Gamma / Output range.
 * Each row has a linked range+number input pair and a reset button.
 * Output range has two number inputs (min/max) + reset.
 *
 * Design source: docs/templates/design_handoff_pdomain_ui/final/grayscale/grayscale.jsx §AdvancedParams
 */
import * as React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../primitives/Accordion.js';
import { Button } from '../../primitives/Button.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GrayscaleParams {
  /** Sampler radius in pixels (1-32). */
  samplerRadius: number;
  /** Gamma exponent (1.0-3.0). */
  gamma: number;
  /** Output value range [min, max], each 0-255. */
  outputRange: [number, number];
}

export const GRAYSCALE_PARAMS_DEFAULT: GrayscaleParams = {
  samplerRadius: 8,
  gamma: 1.8,
  outputRange: [0, 255],
};

export interface AdvancedParamsProps {
  params: GrayscaleParams;
  onChange: (next: GrayscaleParams) => void;
  /** Default-collapsed accordion? Default: true. */
  defaultOpen?: boolean;
  'data-testid'?: string;
}

// ─── AdvancedParams ───────────────────────────────────────────────────────────

export const AdvancedParams = React.forwardRef<HTMLDivElement, AdvancedParamsProps>(
  function AdvancedParams({ params, onChange, defaultOpen = false, 'data-testid': testId }, ref) {
    const handleSamplerRadiusChange = (value: number) => {
      const clamped = Math.max(1, Math.min(32, Math.round(value)));
      onChange({ ...params, samplerRadius: clamped });
    };

    const handleGammaChange = (value: number) => {
      const clamped = Math.max(1.0, Math.min(3.0, value));
      // round to 1 decimal
      const rounded = Math.round(clamped * 10) / 10;
      onChange({ ...params, gamma: rounded });
    };

    const handleOutputMinChange = (value: number) => {
      const clamped = Math.max(0, Math.min(params.outputRange[1] - 1, Math.round(value)));
      onChange({ ...params, outputRange: [clamped, params.outputRange[1]] });
    };

    const handleOutputMaxChange = (value: number) => {
      const clamped = Math.max(params.outputRange[0] + 1, Math.min(255, Math.round(value)));
      onChange({ ...params, outputRange: [params.outputRange[0], clamped] });
    };

    return (
      <div ref={ref} data-testid={testId}>
        <Accordion type="single" collapsible {...(defaultOpen ? { defaultValue: 'advanced' } : {})}>
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced · perceptual params</AccordionTrigger>
            <AccordionContent>
              <div className="adv-params-grid">
                {/* ── Sampler radius ── */}
                <div className="adv-params-row">
                  <div className="adv-params-label-group">
                    <span className="adv-params-label">Sampler radius</span>
                    <span className="adv-params-sub">
                      Size of neighbourhood (px) sampled per output pixel.
                    </span>
                  </div>
                  <div className="adv-params-controls">
                    <input
                      type="range"
                      min={1}
                      max={32}
                      step={1}
                      value={params.samplerRadius}
                      data-testid="advanced-params-slider-samplerRadius"
                      onChange={(e) => handleSamplerRadiusChange(e.target.valueAsNumber)}
                      className="adv-params-slider"
                      aria-label="Sampler radius"
                    />
                    <input
                      type="number"
                      min={1}
                      max={32}
                      step={1}
                      value={params.samplerRadius}
                      onChange={(e) => handleSamplerRadiusChange(e.target.valueAsNumber)}
                      className="adv-params-number"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="advanced-params-reset-samplerRadius"
                      onClick={() =>
                        onChange({
                          ...params,
                          samplerRadius: GRAYSCALE_PARAMS_DEFAULT.samplerRadius,
                        })
                      }
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* ── Gamma ── */}
                <div className="adv-params-row">
                  <div className="adv-params-label-group">
                    <span className="adv-params-label">Gamma</span>
                    <span className="adv-params-sub">
                      Output gamma curve. &lt;1 brightens shadows, &gt;1 deepens them.
                    </span>
                  </div>
                  <div className="adv-params-controls">
                    <input
                      type="range"
                      min={1.0}
                      max={3.0}
                      step={0.1}
                      value={params.gamma}
                      data-testid="advanced-params-slider-gamma"
                      onChange={(e) => handleGammaChange(e.target.valueAsNumber)}
                      className="adv-params-slider"
                      aria-label="Gamma"
                    />
                    <input
                      type="number"
                      min={1.0}
                      max={3.0}
                      step={0.1}
                      value={params.gamma}
                      onChange={(e) => handleGammaChange(e.target.valueAsNumber)}
                      className="adv-params-number"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="advanced-params-reset-gamma"
                      onClick={() => onChange({ ...params, gamma: GRAYSCALE_PARAMS_DEFAULT.gamma })}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* ── Output range ── */}
                <div className="adv-params-row">
                  <div className="adv-params-label-group">
                    <span className="adv-params-label">Output range</span>
                    <span className="adv-params-sub">
                      Linear stretch applied after sampling. Compress the tails for cleaner
                      thresholding.
                    </span>
                  </div>
                  <div className="adv-params-controls">
                    <input
                      type="number"
                      min={0}
                      max={254}
                      step={1}
                      value={params.outputRange[0]}
                      data-testid="advanced-params-slider-outputMin"
                      onChange={(e) => handleOutputMinChange(e.target.valueAsNumber)}
                      className="adv-params-number"
                      aria-label="Output range minimum"
                    />
                    <span className="adv-params-range-sep" aria-hidden>
                      –
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={255}
                      step={1}
                      value={params.outputRange[1]}
                      data-testid="advanced-params-slider-outputMax"
                      onChange={(e) => handleOutputMaxChange(e.target.valueAsNumber)}
                      className="adv-params-number"
                      aria-label="Output range maximum"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="advanced-params-reset-outputRange"
                      onClick={() =>
                        onChange({
                          ...params,
                          outputRange: GRAYSCALE_PARAMS_DEFAULT.outputRange,
                        })
                      }
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
);
