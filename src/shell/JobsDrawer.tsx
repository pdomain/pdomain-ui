/**
 * JobsDrawer — bottom-right floating jobs surface.
 *
 * Three modes:
 *   - 'expanded'  : full panel with title bar + scrollable JobRow list + footer
 *   - 'collapsed' : header bar only (pulsing dot + summary + expand button)
 *   - 'dismissed' : nothing rendered (pill in header still carries state)
 *                   — exception: toasts still render even in dismissed mode
 *
 * Composes <JobRow> (src/shell/JobRow.tsx) for each active job.
 * Tombstone toast cards are rendered above the drawer for recently-completed
 * jobs that have been dismissed from the drawer body.
 *
 * Part of the shell subpath; ported from
 * docs/templates/design_handoff_pdomain_ui/design-system/template.jsx (OQ-5).
 * Target path: src/shell/JobsDrawer.tsx (per OQ-5 decision + #354).
 */
import * as React from 'react';
import { ArrowRight, CheckCircle, ChevronDown, X } from '../icons/lucide.js';
import { JobRow } from './JobRow.js';
import type { Job, JobRowProps } from './JobRow.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type JobsDrawerMode = 'expanded' | 'collapsed' | 'dismissed';

/** A recently-completed job tombstone card shown above the drawer. */
export interface JobToast {
  /** Stable ID for key and callbacks. */
  id: string;
  /** Project display name. */
  project: string;
  /** Short completion message shown in monospace below the project name. */
  message: string;
}

export interface JobsDrawerProps {
  /** Currently active (running, paused, done, etc.) jobs. */
  activeJobs?: Job[];
  /** Tombstone toasts for recently-completed dismissed jobs. */
  toasts?: JobToast[];
  /** Render mode. Defaults to 'expanded'. */
  mode?: JobsDrawerMode;

  // ─── Drawer-level callbacks ────────────────────────────────────────────────
  /** Called when the user clicks Collapse (expanded → collapsed) or Expand (collapsed → expanded). */
  onToggleMode?: () => void;
  /** Called when the user clicks "Dismiss drawer". */
  onDismiss?: () => void;
  /** Called when the user clicks "View all jobs" in the expanded footer. */
  onViewAll?: () => void;

  // ─── JobRow pass-through callbacks ────────────────────────────────────────
  /** Called with job.id when the Open / Open project button is clicked. */
  onJobOpen?: JobRowProps['onOpen'];
  /** Called with job.id when the Pause / Resume button is clicked. */
  onJobPauseResume?: JobRowProps['onPauseResume'];
  /** Called with job.id when the Discard button is clicked. */
  onJobCancel?: JobRowProps['onCancel'];

  // ─── Toast callbacks ──────────────────────────────────────────────────────
  /** Called with toast.id when the Open button inside a toast is clicked. */
  onToastOpen?: (toastId: string) => void;
  /** Called with toast.id when the Dismiss button inside a toast is clicked. */
  onToastDismiss?: (toastId: string) => void;

  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildSummary(running: Job[], done: Job[]): string {
  if (running.length && done.length) return `${running.length} running · ${done.length} done`;
  if (running.length) return `${running.length} running`;
  if (done.length) return `${done.length} done`;
  return 'No jobs';
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface ToastCardProps {
  toast: JobToast;
  onOpen?: ((id: string) => void) | undefined;
  onDismiss?: ((id: string) => void) | undefined;
}

function ToastCard({ toast, onOpen, onDismiss }: ToastCardProps) {
  return (
    <div
      data-testid="jobs-drawer-toast"
      style={{
        pointerEvents: 'auto',
        minWidth: 280,
        maxWidth: 360,
        padding: '9px 12px',
        background: 'var(--bg-surface)',
        border: '1px solid color-mix(in oklab, var(--exact) 40%, var(--border-1))',
        borderRadius: 8,
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12,
      }}
    >
      <CheckCircle size={14} aria-hidden style={{ color: 'var(--exact)', flex: '0 0 auto' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: 'var(--ink-1)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.project}
        </div>
        <div
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 10.5,
            color: 'var(--ink-3)',
          }}
        >
          {toast.message}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpen?.(toast.id)}
        style={{
          background: 'transparent',
          border: 0,
          color: 'var(--ink-2)',
          cursor: 'pointer',
          fontSize: 11.5,
          fontWeight: 500,
          padding: '4px 6px',
        }}
      >
        Open
      </button>
      <button
        type="button"
        onClick={() => onDismiss?.(toast.id)}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 0,
          color: 'var(--ink-4)',
          cursor: 'pointer',
          padding: 2,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <X size={11} aria-hidden />
      </button>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function JobsDrawer({
  activeJobs = [],
  toasts = [],
  mode = 'expanded',
  onToggleMode,
  onDismiss,
  onViewAll,
  onJobOpen,
  onJobPauseResume,
  onJobCancel,
  onToastOpen,
  onToastDismiss,
  className,
}: JobsDrawerProps) {
  const [hoveredId, setHoveredId] = React.useState<string | undefined>(undefined);

  // Dismissed + nothing to show → render null
  if (mode === 'dismissed' && activeJobs.length === 0 && toasts.length === 0) {
    return null;
  }

  const running = activeJobs.filter((j) => j.status !== 'done' && j.status !== 'succeeded');
  const done = activeJobs.filter((j) => j.status === 'done' || j.status === 'succeeded');

  // Multi-running: show aggregate "N running" label; single running shows normal summary.
  const summary =
    running.length > 1
      ? `${running.length} running · ${done.length > 0 ? `${done.length} done` : ''}`.replace(
          /\s·\s$/,
          '',
        )
      : buildSummary(running, done);

  const showDrawerBody = mode !== 'dismissed' && activeJobs.length > 0;
  const singleRunning: Job | undefined = running.length === 1 ? running[0] : undefined;

  return (
    <div
      data-testid="jobs-drawer"
      {...(className !== undefined ? { className } : {})}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {/* Tombstone toast cards — rendered above the drawer */}
      {toasts.map((t) => (
        <ToastCard
          key={t.id}
          toast={t}
          {...(onToastOpen !== undefined ? { onOpen: onToastOpen } : {})}
          {...(onToastDismiss !== undefined ? { onDismiss: onToastDismiss } : {})}
        />
      ))}

      {/* Drawer body — only when there are active jobs and mode is not dismissed */}
      {showDrawerBody ? (
        <div
          style={{
            pointerEvents: 'auto',
            width: 380,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-1)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-overlay)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Resize-handle hint — expanded mode only */}
          {mode === 'expanded' ? (
            <div
              role="slider"
              aria-label="Resize drawer"
              aria-orientation="horizontal"
              aria-valuemin={100}
              aria-valuemax={600}
              aria-valuenow={320}
              tabIndex={0}
              style={{
                position: 'relative',
                height: 6,
                cursor: 'ns-resize',
                background: 'var(--bg-page)',
                borderBottom: '1px solid var(--border-1)',
                outline: 'none',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 28,
                  height: 2,
                  borderRadius: 99,
                  background: 'var(--border-3)',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          ) : null}

          {/* Header bar — always present; doubles as the collapsed surface */}
          <div
            data-testid="jobs-drawer-header"
            style={{
              padding: '8px 10px 8px 12px',
              background: 'var(--bg-page)',
              borderBottom: mode === 'expanded' ? '1px solid var(--border-1)' : 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {/* Status dot */}
            {running.length > 0 ? (
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: 'var(--ocr)',
                  animation: 'pgd-pulse 1.4s ease-in-out infinite',
                  flex: '0 0 auto',
                }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: 'var(--exact)',
                  flex: '0 0 auto',
                }}
              />
            )}

            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--ink-1)',
              }}
            >
              Jobs
            </span>

            <span
              data-testid="jobs-drawer-summary"
              style={{
                fontFamily: 'var(--mono-font)',
                fontSize: 10.5,
                color: 'var(--ink-3)',
              }}
            >
              {summary}
            </span>

            {/* Collapsed single-job pct badge */}
            {mode === 'collapsed' && singleRunning !== undefined ? (
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--mono-font)',
                  fontSize: 11,
                  color: 'var(--ocr)',
                  fontWeight: 600,
                }}
              >
                {singleRunning.pct}%
              </span>
            ) : (
              <span style={{ flex: 1 }} />
            )}

            {/* Toggle collapse/expand */}
            <button
              type="button"
              onClick={onToggleMode}
              aria-label={mode === 'expanded' ? 'Collapse' : 'Expand'}
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: 'var(--ink-3)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <ChevronDown
                size={13}
                aria-hidden
                style={{
                  transform: mode === 'expanded' ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform .15s',
                }}
              />
            </button>

            {/* Dismiss drawer */}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss drawer"
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: 'var(--ink-3)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={12} aria-hidden />
            </button>
          </div>

          {/* Collapsed: single-job mini progress bar */}
          {mode === 'collapsed' && singleRunning !== undefined ? (
            <div style={{ padding: '6px 12px 8px' }}>
              <div
                style={{
                  fontFamily: 'var(--mono-font)',
                  fontSize: 10.5,
                  color: 'var(--ink-3)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}
              >
                {singleRunning.project} · {singleRunning.phase}
              </div>
              <div
                data-testid="jobs-drawer-collapsed-progress"
                style={{
                  height: 3,
                  borderRadius: 99,
                  background: 'var(--bg-sunk)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${singleRunning.pct}%`,
                    height: '100%',
                    background: 'var(--ocr)',
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* Expanded: full job list + footer */}
          {mode === 'expanded' ? (
            <div
              style={{
                maxHeight: 320,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  onMouseEnter={() => {
                    setHoveredId(job.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredId(undefined);
                  }}
                >
                  <JobRow
                    job={job}
                    hovered={hoveredId === job.id}
                    {...(onJobOpen !== undefined ? { onOpen: onJobOpen } : {})}
                    {...(onJobPauseResume !== undefined ? { onPauseResume: onJobPauseResume } : {})}
                    {...(onJobCancel !== undefined ? { onCancel: onJobCancel } : {})}
                  />
                </div>
              ))}
              <button
                type="button"
                data-testid="jobs-drawer-view-all"
                onClick={onViewAll}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-page)',
                  border: 0,
                  borderTopWidth: 1,
                  borderTopStyle: 'solid',
                  borderTopColor: 'var(--border-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>View all jobs</span>
                <ArrowRight size={12} aria-hidden style={{ color: 'var(--ink-3)' }} />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

JobsDrawer.displayName = 'JobsDrawer';
