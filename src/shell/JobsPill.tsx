/**
 * JobsPill — header-anchored jobs indicator molecule.
 *
 * Ported from docs/templates/design_handoff_pdomain_ui/design-system/template.jsx
 * per OQ-5 decision: port into src/shell/ alongside AppHeader, JobsDrawer, JobRow.
 *
 * States:
 *  - idle: muted, Package icon, no count (no active jobs)
 *  - running: accent-bordered pill with pulse dot + count badge
 *  - open (hover or `open` prop): floating popover listing running jobs
 *
 * Each job shape: { id, title, phase, pct, project }
 */

import * as React from 'react';
import { Package, ArrowRight } from '../icons/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveJob {
  id: string;
  title: string;
  phase: string;
  /** Progress 0–100 */
  pct: number;
  project: string;
}

export interface JobsPillProps {
  /** Currently running jobs. Empty array = idle state. */
  activeJobs?: ActiveJob[];
  /** Force the popover open (used for Storybook artboards and testing). */
  open?: boolean;
  /** Called when the pill button is clicked. */
  onClick?: () => void;
  /** Called when "View all jobs" footer link is clicked. */
  onViewAll?: () => void;
  className?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// All colors use var(--token) only — no hex literals.

const pillButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 26,
  padding: '0 9px',
  borderRadius: 6,
  background: isActive ? 'color-mix(in oklab, var(--ocr) 12%, transparent)' : 'transparent',
  border: `1px solid ${isActive ? 'color-mix(in oklab, var(--ocr) 35%, transparent)' : 'transparent'}`,
  color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'var(--ui-font)',
});

const pulseDotStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 99,
  background: 'var(--ocr)',
  animation: 'pgd-pulse 1.4s ease-in-out infinite',
  flexShrink: 0,
};

const countBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '1px 5px',
  borderRadius: 4,
  background: 'var(--ocr)',
  color: 'var(--accent-ink)',
  fontWeight: 600,
  fontFamily: 'var(--mono-font)',
};

const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  width: 340,
  padding: 4,
  borderRadius: 10,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-1)',
  boxShadow: 'var(--shadow-overlay)',
  zIndex: 50,
};

// ─── JobsPill ─────────────────────────────────────────────────────────────────

export function JobsPill({
  activeJobs = [],
  open = false,
  onClick,
  onViewAll,
  className,
}: JobsPillProps) {
  const [hover, setHover] = React.useState(false);
  const show = open || hover;
  const isActive = activeJobs.length > 0;

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        aria-label={isActive ? `Jobs – ${activeJobs.length} active` : 'Jobs'}
        aria-expanded={show}
        aria-haspopup="true"
        style={pillButtonStyle(isActive)}
        onClick={onClick}
      >
        {isActive ? (
          <span data-testid="jobs-pill-pulse" aria-hidden="true" style={pulseDotStyle} />
        ) : (
          <Package size={13} aria-hidden="true" />
        )}
        Jobs
        {isActive ? (
          <span data-testid="jobs-pill-count" aria-hidden="true" style={countBadgeStyle}>
            {activeJobs.length}
          </span>
        ) : null}
      </button>

      {show ? (
        <div
          data-testid="jobs-pill-popover"
          role="region"
          aria-label="Active jobs"
          style={popoverStyle}
        >
          <div
            style={{
              padding: '8px 10px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                fontFamily: 'var(--mono-font)',
              }}
            >
              {isActive ? `Active jobs · ${activeJobs.length}` : 'Jobs'}
            </span>
          </div>

          {isActive ? (
            activeJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 99,
                      background: 'var(--ocr)',
                      animation: 'pgd-pulse 1.4s ease-in-out infinite',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--ink-1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {job.project}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--ocr)',
                      fontFamily: 'var(--mono-font)',
                    }}
                  >
                    {job.pct}%
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--ink-3)',
                    fontFamily: 'var(--mono-font)',
                  }}
                >
                  {job.phase}
                </div>
                <div
                  style={{
                    height: 3,
                    borderRadius: 99,
                    background: 'var(--bg-sunk)',
                  }}
                >
                  <div
                    style={{
                      width: `${job.pct}%`,
                      height: '100%',
                      background: 'var(--ocr)',
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '14px 10px',
                fontSize: 12,
                color: 'var(--ink-3)',
              }}
            >
              No active jobs. Background ingest, OCR runs, and exports will appear here.
            </div>
          )}

          <button
            type="button"
            data-testid="jobs-pill-view-all"
            onClick={onViewAll}
            style={{
              marginTop: 4,
              padding: '8px 10px',
              borderTop: '1px solid var(--border-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              width: '100%',
              background: 'transparent',
              border: 0,
              borderTopWidth: 1,
              borderTopStyle: 'solid',
              borderTopColor: 'var(--border-1)',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>View all jobs</span>
            <ArrowRight size={12} aria-hidden style={{ color: 'var(--ink-3)' }} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

JobsPill.displayName = 'JobsPill';
