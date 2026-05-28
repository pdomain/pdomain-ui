import * as React from 'react';
import {
  CROP_OVERVIEW,
  CROP_OVERVIEW_DISTRIBUTION,
  CROP_OVERVIEW_ACTIVITY,
  cropOverviewActivityTestId,
} from '../../testids/index.js';
import type { CropFlagKind } from './types.js';

export type { CropFlagKind };

export interface FlagDistributionEntry {
  kind: CropFlagKind;
  count: number;
}

export interface CropActivityEntry {
  id: string;
  timestamp: string; // ISO 8601
  message: string;
  /** Optional actor name. */
  actor?: string;
}

export interface CropOverviewProps {
  flagDistribution: ReadonlyArray<FlagDistributionEntry>;
  recentActivity: ReadonlyArray<CropActivityEntry>;
  'data-testid'?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map each flag kind to a CSS token variable for its color. */
const FLAG_TOKEN: Record<CropFlagKind, string> = {
  overCrop: 'var(--fuzzy)',
  underCrop: 'var(--fuzzy)',
  deskewFail: 'var(--mismatch)',
  edgeNoise: 'var(--ocr)',
};

/** Human-readable label for each flag kind. */
const FLAG_LABEL: Record<CropFlagKind, string> = {
  overCrop: 'Over-crop',
  underCrop: 'Under-crop',
  deskewFail: 'Deskew fail',
  edgeNoise: 'Edge noise',
};

/**
 * Format an ISO 8601 timestamp as a relative time string.
 * Returns strings like "2m ago", "1h ago", "3d ago".
 * Falls back to the raw timestamp string if parsing fails.
 */
function relativeTime(isoTimestamp: string, now: number = Date.now()): string {
  let ms: number;
  try {
    ms = new Date(isoTimestamp).getTime();
  } catch {
    return isoTimestamp;
  }
  if (Number.isNaN(ms)) return isoTimestamp;

  const diffSec = Math.round((now - ms) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.round(diffHr / 24);
  return `${diffDays}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface FlagDistributionProps {
  flagDistribution: ReadonlyArray<FlagDistributionEntry>;
  'data-testid'?: string;
}

function FlagDistribution({
  flagDistribution,
  'data-testid': testId = CROP_OVERVIEW_DISTRIBUTION,
}: FlagDistributionProps): React.ReactElement {
  const total = flagDistribution.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="crop-overview__distribution" data-testid={testId}>
      <div className="crop-overview__head">Flag distribution</div>

      {flagDistribution.length === 0 ? (
        <div className="crop-overview__distribution-empty">No flags recorded.</div>
      ) : (
        <>
          {/* Stacked bar */}
          <div
            className="crop-overview__stacked-bar"
            role="img"
            aria-label="Flag distribution stacked bar"
          >
            {flagDistribution.map((entry) => {
              const pct = total > 0 ? (entry.count / total) * 100 : 0;
              return (
                <div
                  key={entry.kind}
                  className="crop-overview__bar-segment"
                  data-kind={entry.kind}
                  aria-valuenow={entry.count}
                  aria-valuemax={total}
                  aria-label={`${FLAG_LABEL[entry.kind]}: ${entry.count}`}
                  style={{ width: `${pct}%`, background: FLAG_TOKEN[entry.kind] }}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="crop-overview__legend">
            {flagDistribution.map((entry) => (
              <div key={entry.kind} className="crop-overview__legend-item">
                <span
                  className="crop-overview__legend-chip"
                  style={{ background: FLAG_TOKEN[entry.kind] }}
                />
                <span className="crop-overview__label">{FLAG_LABEL[entry.kind]}</span>
                <span className="mono crop-overview__stat">{entry.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface RecentActivityProps {
  recentActivity: ReadonlyArray<CropActivityEntry>;
  'data-testid'?: string;
}

function RecentActivity({
  recentActivity,
  'data-testid': testId = CROP_OVERVIEW_ACTIVITY,
}: RecentActivityProps): React.ReactElement {
  const now = Date.now();

  return (
    <div className="crop-overview__activity" data-testid={testId}>
      <div className="crop-overview__head">Recent activity</div>

      {recentActivity.length === 0 ? (
        <div className="crop-overview__activity-empty">No recent activity.</div>
      ) : (
        <ul className="crop-overview__activity-list">
          {recentActivity.map((entry, i) => (
            <li
              key={entry.id}
              className={`crop-overview__activity-row${i > 0 ? ' crop-overview__activity-row--bordered' : ''}`}
              data-testid={cropOverviewActivityTestId(entry.id)}
            >
              <span className="mono crop-overview__activity-time">
                {relativeTime(entry.timestamp, now)}
              </span>
              <div className="crop-overview__activity-msg">{entry.message}</div>
              {entry.actor != null && (
                <div className="mono crop-overview__activity-actor">{entry.actor}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * CropOverview — summary panel for the Crop processing stage.
 *
 * Renders two panels side by side:
 * - Left: Flag distribution — horizontal stacked bar with per-flag segments
 *   and a legend (chip + count per flag).
 * - Right: Recent activity — vertical list with relative timestamps, messages,
 *   and optional actor names.
 */
export function CropOverview({
  flagDistribution,
  recentActivity,
  'data-testid': testId = CROP_OVERVIEW,
}: CropOverviewProps): React.ReactElement {
  return (
    <section className="crop-overview" data-testid={testId} aria-label="Crop stage overview">
      <FlagDistribution flagDistribution={flagDistribution} />
      <RecentActivity recentActivity={recentActivity} />
    </section>
  );
}
