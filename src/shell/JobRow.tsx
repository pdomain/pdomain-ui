/**
 * JobRow — single row inside JobsDrawer expanded list.
 *
 * Displays a job's project name, current phase, progress percentage, and
 * progress bar. Shows a static success background and Open button for done/succeeded
 * jobs; shows hover actions (Open project, Pause/Resume, Discard) when
 * `hovered` is true and the job is not yet done.
 *
 * Part of the shell subpath; ported from design-system/template.jsx.
 * Target path: src/shell/JobRow.tsx (per OQ-5 decision).
 */
import * as React from 'react';
import { ArrowRight, Pause, Play, Trash2 } from '../icons/lucide.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type JobStatus = 'queued' | 'running' | 'paused' | 'succeeded' | 'done' | 'failed';

export interface Job {
  /** Stable ID used as the argument to callbacks. */
  id: string;
  /** Project display name shown in the row title. */
  project: string;
  /** Current phase label (e.g. "OCR — page 12 of 40"). */
  phase: string;
  /** Completion percentage 0–100. */
  pct: number;
  /** Current status of the job. */
  status: JobStatus;
  /** Whether a Discard/cancel action is available for this job. */
  cancelable: boolean;
}

export interface JobRowProps {
  job: Job;
  /** When true, renders the inline hover-action strip. */
  hovered?: boolean;
  /** Called with job.id when the Open button is clicked. */
  onOpen?: (jobId: string) => void;
  /** Called with job.id when Pause or Resume is clicked. */
  onPauseResume?: (jobId: string) => void;
  /** Called with job.id when Discard is clicked. */
  onCancel?: (jobId: string) => void;
  /** Permanently delete a finished/failed run. Only shown for done or failed jobs. */
  onJobDelete?: (id: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Jobs that are fully complete (show Open button instead of progress bar). */
function isDone(status: JobStatus): boolean {
  return status === 'done' || status === 'succeeded';
}

function isPaused(status: JobStatus): boolean {
  return status === 'paused';
}

function isFailed(status: JobStatus): boolean {
  return status === 'failed';
}

/** Dot/bar accent color based on status. */
function accentVar(status: JobStatus): string {
  if (isDone(status)) return 'var(--exact)';
  if (isPaused(status)) return 'var(--fuzzy)';
  if (isFailed(status)) return 'var(--mismatch)';
  // running / queued
  return 'var(--ocr)';
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function JobRow({ job, hovered = false, onOpen, onPauseResume, onCancel, onJobDelete }: JobRowProps) {
  const done = isDone(job.status);
  const paused = isPaused(job.status);
  const failed = isFailed(job.status);
  const accent = accentVar(job.status);

  return (
    <div
      data-testid="job-row"
      style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border-1)',
        background: done
          ? 'color-mix(in oklab, var(--exact) 6%, var(--bg-surface))'
          : failed
            ? 'color-mix(in oklab, var(--mismatch) 6%, var(--bg-surface))'
            : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        position: 'relative',
      }}
    >


      {/* Title row: status dot, project name, pct / Open */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
        }}
      >
        <span
          aria-hidden
          data-testid="job-status-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: 99,
            background: accent,
            animation: !done && !paused && !failed ? 'pgd-pulse 1.4s ease-in-out infinite' : 'none',
            flex: '0 0 auto',
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

        {done ? (
          <button
            type="button"
            data-testid="job-row-open"
            onClick={() => onOpen?.(job.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 22,
              padding: '0 8px',
              borderRadius: 5,
              background: 'var(--exact)',
              color: 'var(--accent-ink)',
              border: 0,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Open <ArrowRight size={11} />
          </button>
        ) : (
          <span
            data-testid={failed ? 'job-row-status-failed' : undefined}
            style={{
              fontFamily: 'var(--mono-font)',
              fontSize: 11,
              color: accent,
              fontWeight: 600,
            }}
          >
            {failed ? 'Failed' : `${job.pct}%`}
          </span>
        )}
      </div>

      {/* Phase label */}
      <div
        style={{
          fontFamily: 'var(--mono-font)',
          fontSize: 10.5,
          color: 'var(--ink-3)',
          position: 'relative',
        }}
      >
        {job.phase}
      </div>

      {/* Progress bar (hidden for done) */}
      {!done ? (
        <div
          role="progressbar"
          aria-valuenow={job.pct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            height: 3,
            borderRadius: 99,
            background: 'var(--bg-sunk)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${job.pct}%`,
              height: '100%',
              background: paused ? 'var(--fuzzy)' : failed ? 'var(--mismatch)' : 'var(--ocr)',
              borderRadius: 99,
              backgroundImage: paused
                ? 'repeating-linear-gradient(45deg, transparent 0 4px, rgba(0,0,0,0.18) 4px 8px)'
                : 'none',
            }}
          />
        </div>
      ) : null}

      {/* Delete button — shown for done/failed jobs when onJobDelete is provided */}
      {(done || failed) && onJobDelete !== undefined ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <button
            type="button"
            data-testid={`job-delete-${job.id}`}
            aria-label="Delete run"
            onClick={() => onJobDelete(job.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 22,
              padding: '0 8px',
              borderRadius: 5,
              background: 'transparent',
              color: 'var(--mismatch)',
              border: '1px solid var(--mismatch)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            <Trash2 size={11} />
            Delete
          </button>
        </div>
      ) : null}

      {/* Inline hover actions — Open project / Pause/Resume / Discard */}
      {hovered && !done ? (
        <div
          style={{
            marginTop: 2,
            display: 'flex',
            gap: 6,
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => onOpen?.(job.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 24,
              padding: '0 8px',
              borderRadius: 5,
              background: 'var(--bg-raised)',
              color: 'var(--ink-1)',
              border: '1px solid var(--border-2)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Open project <ArrowRight size={11} />
          </button>

          <button
            type="button"
            onClick={() => onPauseResume?.(job.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 24,
              padding: '0 8px',
              borderRadius: 5,
              background: 'transparent',
              color: 'var(--ink-2)',
              border: '1px solid var(--border-2)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {paused ? <Play size={11} /> : <Pause size={11} />}
            {paused ? 'Resume' : 'Pause'}
          </button>

          <span style={{ flex: 1 }} />

          {job.cancelable ? (
            <button
              type="button"
              onClick={() => onCancel?.(job.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                height: 24,
                padding: '0 8px',
                borderRadius: 5,
                background: 'transparent',
                color: 'var(--mismatch)',
                border: '1px solid var(--mismatch)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              <Trash2 size={11} />
              Discard
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

JobRow.displayName = 'JobRow';
