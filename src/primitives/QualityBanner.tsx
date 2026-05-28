import * as React from 'react';
import { cn } from './cn.js';
import { FlagChip } from './FlagChip.js';
import type { FlagKind } from './FlagChip.js';

export interface QualityBannerFlag {
  kind: FlagKind;
  count?: number;
}

export interface QualityBannerProps {
  /** Banner headline, e.g. "Source quality issues". */
  title: string;
  /** Number of flagged pages. */
  flagged: number;
  /** Total page count (used to compute severity ratio). */
  total: number;
  /** Flag chips to render in the body. */
  flags: QualityBannerFlag[];
  /** Optional supporting text below the headline. */
  sub?: string;
  /** Force extreme (high-severity) styling regardless of ratio. */
  severe?: boolean;
  /** Label for the primary action button. */
  actionLabel?: string;
  /** Handler for the primary action button. Renders button when provided. */
  onAction?: () => void;
  /** Handler for the secondary action (tune) button. */
  onTune?: () => void;
  /** Handler for the dismiss (×) button. Renders button when provided. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * QualityBanner — flag-summary banner shown above a stage's page list.
 *
 * Severity is automatic (ratio > 0.7 or `severe` prop) — switches from
 * warning (fuzzy) to critical (mismatch) styling via CSS modifier.
 * No inline hex or color literals; all tones via token vars.
 */
export function QualityBanner({
  title,
  flagged,
  total,
  flags,
  sub,
  severe,
  actionLabel,
  onAction,
  onTune,
  onDismiss,
  className,
}: QualityBannerProps): React.ReactElement {
  const ratio = total > 0 ? flagged / total : 0;
  const extreme = (severe ?? false) || ratio > 0.7;

  return (
    <div
      // WS6: polite live region so screen readers announce flag count updates
      // without interrupting current speech.
      aria-live="polite"
      className={cn('quality-banner', extreme ? 'quality-banner--extreme' : undefined, className)}
    >
      <div className="quality-banner__stripe" aria-hidden="true" />
      <div className="quality-banner__body">
        <div className="quality-banner__icon-wrapper" aria-hidden="true">
          <span className="quality-banner__icon" />
        </div>
        <div className="quality-banner__content">
          <div className="quality-banner__headline">
            {extreme
              ? `${flagged} of ${total} pages flagged · ${title.toLowerCase()}`
              : `${flagged} pages flagged · ${title.toLowerCase()}`}
          </div>
          {sub != null ? <div className="quality-banner__sub">{sub}</div> : null}
          <div className="quality-banner__chips">
            {flags.map((f) => (
              <FlagChip
                key={f.kind}
                kind={f.kind}
                {...(f.count !== undefined ? { count: f.count } : {})}
              />
            ))}
          </div>
        </div>
        <div className="quality-banner__actions">
          {onTune != null ? (
            <button type="button" className="btn ghost sm quality-banner__action" onClick={onTune}>
              Tune thresholds
            </button>
          ) : null}
          {onAction != null ? (
            <button
              type="button"
              className="btn primary sm quality-banner__action"
              onClick={onAction}
            >
              {actionLabel ?? 'View flagged'}
            </button>
          ) : null}
        </div>
      </div>
      {onDismiss != null ? (
        <button
          type="button"
          className="quality-banner__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss quality banner"
        >
          <span className="quality-banner__dismiss-icon" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

QualityBanner.displayName = 'QualityBanner';
