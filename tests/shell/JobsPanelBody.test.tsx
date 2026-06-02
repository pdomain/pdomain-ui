/**
 * JobsPanelBody tests.
 *
 * Tests:
 *  1. "View all jobs" footer absent when onViewAll is undefined (even with jobs).
 *  2. "View all jobs" footer present when onViewAll is provided; clicking fires callback.
 *  3. No jobs renders the empty state message.
 *  4. onJobOpen forwarding — clicking Open on a done job fires onJobOpen.
 *  5. onJobPauseResume forwarding — clicking Pause/Resume fires onJobPauseResume.
 *  6. onJobCancel forwarding — clicking Discard fires onJobCancel (cancelable job).
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobsPanelBody } from '../../src/shell/JobsPanelBody.js';
import type { Job } from '../../src/shell/JobRow.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeJob(overrides?: Partial<Job>): Job {
  return {
    id: 'job-1',
    project: 'Test Project',
    phase: 'OCR — page 1 of 10',
    pct: 100,
    status: 'done',
    cancelable: true,
    ...overrides,
  };
}

// ─── 1. view-all absent when onViewAll is undefined ───────────────────────────

describe('JobsPanelBody — view-all gating', () => {
  it('does NOT render view-all button when jobs present but onViewAll is undefined', () => {
    render(<JobsPanelBody activeJobs={[makeJob()]} />);

    expect(screen.queryByTestId('jobs-panel-body-view-all')).toBeNull();
  });

  it('does NOT render view-all button when no jobs and no onViewAll', () => {
    render(<JobsPanelBody activeJobs={[]} />);

    expect(screen.queryByTestId('jobs-panel-body-view-all')).toBeNull();
  });

  it('renders view-all button when jobs present and onViewAll is provided', () => {
    const onViewAll = vi.fn();
    render(<JobsPanelBody activeJobs={[makeJob()]} onViewAll={onViewAll} />);

    expect(screen.getByTestId('jobs-panel-body-view-all')).toBeTruthy();
  });

  it('clicking view-all button fires onViewAll callback', () => {
    const onViewAll = vi.fn();
    render(<JobsPanelBody activeJobs={[makeJob()]} onViewAll={onViewAll} />);

    fireEvent.click(screen.getByTestId('jobs-panel-body-view-all'));
    expect(onViewAll).toHaveBeenCalledOnce();
  });
});

// ─── 2. Empty state ───────────────────────────────────────────────────────────

describe('JobsPanelBody — empty state', () => {
  it('renders empty-state message when activeJobs is empty', () => {
    render(<JobsPanelBody activeJobs={[]} />);

    expect(screen.getByText(/No active jobs/)).toBeTruthy();
  });

  it('does not render job rows when activeJobs is empty', () => {
    render(<JobsPanelBody activeJobs={[]} />);

    expect(screen.queryByTestId('job-row')).toBeNull();
  });
});

// ─── 3. onJobOpen forwarding ──────────────────────────────────────────────────

describe('JobsPanelBody — onJobOpen forwarding', () => {
  it('clicking the Open button on a done job fires onJobOpen with the job id', () => {
    const onJobOpen = vi.fn();
    const job = makeJob({ id: 'job-open-1', status: 'done' });
    render(<JobsPanelBody activeJobs={[job]} onJobOpen={onJobOpen} />);

    // Done jobs render an "Open" button unconditionally (no hover required).
    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(onJobOpen).toHaveBeenCalledWith('job-open-1');
  });
});

// ─── 4. onJobPauseResume forwarding ──────────────────────────────────────────

describe('JobsPanelBody — onJobPauseResume forwarding', () => {
  it('Pause button visible and fires onJobPauseResume for a hovered running job', () => {
    // JobsPanelBody uses mouse hover state internally. We simulate hover via
    // mouseEnter on the row wrapper and then click the Pause button.
    const onJobPauseResume = vi.fn();
    const job = makeJob({ id: 'job-pr-1', status: 'running', pct: 40, cancelable: false });
    render(<JobsPanelBody activeJobs={[job]} onJobPauseResume={onJobPauseResume} />);

    // Trigger hover on the row wrapper (first child of jobs-panel-body that
    // wraps the JobRow — the div with onMouseEnter/Leave).
    const body = screen.getByTestId('jobs-panel-body');
    const rowWrapper = body.firstElementChild?.firstElementChild as HTMLElement | null;
    if (rowWrapper) fireEvent.mouseEnter(rowWrapper);

    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(onJobPauseResume).toHaveBeenCalledWith('job-pr-1');
  });
});

// ─── 5. onJobCancel forwarding ────────────────────────────────────────────────

describe('JobsPanelBody — onJobCancel forwarding', () => {
  it('Discard button visible and fires onJobCancel for a hovered cancelable job', () => {
    const onJobCancel = vi.fn();
    const job = makeJob({ id: 'job-cancel-1', status: 'running', pct: 20, cancelable: true });
    render(<JobsPanelBody activeJobs={[job]} onJobCancel={onJobCancel} />);

    const body = screen.getByTestId('jobs-panel-body');
    const rowWrapper = body.firstElementChild?.firstElementChild as HTMLElement | null;
    if (rowWrapper) fireEvent.mouseEnter(rowWrapper);

    fireEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(onJobCancel).toHaveBeenCalledWith('job-cancel-1');
  });
});
