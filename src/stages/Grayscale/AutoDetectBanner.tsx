import * as React from 'react';
import { Sparkles } from '../../icons/lucide.js';
import { Button } from '../../primitives/Button.js';
import { AUTO_DETECT_BANNER, AUTO_DETECT_BANNER_REDETECT } from '../../testids/index.js';
import type { GrayscaleMode } from './types.js';

export type { GrayscaleMode };

export interface AutoDetectBannerProps {
  /** Auto-detected grayscale conversion mode. */
  mode: GrayscaleMode;
  /**
   * Detected content profile string, e.g. "text-heavy", "art-heavy", "mixed".
   * When provided, a chip is rendered next to the headline.
   */
  profile?: string;
  /** Estimated seconds per page from the detection run. */
  estimatedSecondsPerPage: number;
  /**
   * Called when the "Re-detect" button is clicked.
   * When omitted the button is not rendered.
   */
  onRedetect?: () => void;
  /** Override the root element's data-testid. Defaults to `AUTO_DETECT_BANNER`. */
  'data-testid'?: string;
}

/**
 * AutoDetectBanner — rationale banner for the Grayscale conversion stage.
 *
 * Displays the auto-detected conversion mode, an optional content-profile
 * chip, an estimated time-per-page, and (when `onRedetect` is provided) a
 * right-aligned "Re-detect" action button.
 *
 * Layout: two-column grid — left: icon + text block; right: time + button.
 */
export const AutoDetectBanner = React.forwardRef<HTMLElement, AutoDetectBannerProps>(
  function AutoDetectBanner(
    {
      mode,
      profile,
      estimatedSecondsPerPage,
      onRedetect,
      'data-testid': testId = AUTO_DETECT_BANNER,
    },
    ref,
  ) {
    return (
      <aside
        ref={ref}
        className="auto-detect-banner"
        data-testid={testId}
        aria-label="Auto-detect results banner"
      >
        {/* ── Left: icon + copy ─────────────────────────────────────────── */}
        <div className="auto-detect-banner__left">
          <div className="auto-detect-banner__icon" aria-hidden>
            <Sparkles size={15} />
          </div>
          <div className="auto-detect-banner__copy">
            <div className="auto-detect-banner__headline">
              <span className="auto-detect-banner__headline-text">
                Auto-detected: <strong>{mode}</strong>
              </span>
              {profile != null ? (
                <span
                  className="auto-detect-banner__profile-chip"
                  data-testid="auto-detect-banner-profile"
                >
                  {profile}
                </span>
              ) : null}
            </div>
            <div className="auto-detect-banner__subtext">~{estimatedSecondsPerPage}s/page</div>
          </div>
        </div>

        {/* ── Right: re-detect button ───────────────────────────────────── */}
        {onRedetect != null ? (
          <div className="auto-detect-banner__actions">
            <Button
              variant="ghost"
              size="sm"
              data-testid={AUTO_DETECT_BANNER_REDETECT}
              onClick={onRedetect}
            >
              Re-detect
            </Button>
          </div>
        ) : null}
      </aside>
    );
  },
);

AutoDetectBanner.displayName = 'AutoDetectBanner';
