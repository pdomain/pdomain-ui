/**
 * JobsPanelBody tests — the dock body for the Jobs surface.
 * Reuses the JobRow list extracted from JobsDrawer.
 *
 * Also covers:
 *  - "View all jobs" button present only when onViewAll is provided.
 *  - Empty-state message.
 *  - onJobPauseResume / onJobCancel forwarding via hover simulation.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobsPanelBody } from './JobsPanelBody.js';
import type { Job } from './JobRow.js';

// Use 'done' status so the Open button is always visible (not hover-dependent).
const jobs: Job[] = [
  { id: 'j1', project: 'belloc', phase: 'OCR', pct: 100, status: 'done', cancelable: false },
  { id: 'j2', project: 'chesterton', phase: 'Ingest', pct: 100, status: 'done', cancelable: false },
];

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

describe('JobsPanelBody', () => {
  it('renders the body wrapper testid', () => {
    render(<JobsPanelBody activeJobs={jobs} />);
    expect(screen.getByTestId('jobs-panel-body')).toBeTruthy();
  });

  it('renders a JobRow per active job', () => {
    render(<JobsPanelBody activeJobs={jobs} />);
    expect(screen.getAllByTestId('job-row').length).toBe(2);
  });

  it('renders an empty state when there are no jobs', () => {
    render(<JobsPanelBody activeJobs={[]} />);
    expect(screen.queryByTestId('job-row')).toBeNull();
    expect(screen.getByText(/no active jobs/i)).toBeTruthy();
  });

  it('forwards onJobOpen to JobRow', () => {
    const onJobOpen = vi.fn();
    render(<JobsPanelBody activeJobs={jobs} onJobOpen={onJobOpen} />);
    // Done-status JobRow always renders an Open button (not hover-gated).
    const openButtons = screen.getAllByRole('button', { name: /open/i });
    fireEvent.click(openButtons[0]!);
    expect(onJobOpen).toHaveBeenCalledWith('j1');
  });

  it('does NOT render view-all button when onViewAll is undefined', () => {
    render(<JobsPanelBody activeJobs={jobs} />);
    expect(screen.queryByTestId('jobs-panel-body-view-all')).toBeNull();
  });

  it('renders view-all button and fires callback when onViewAll is provided', () => {
    const onViewAll = vi.fn();
    render(<JobsPanelBody activeJobs={jobs} onViewAll={onViewAll} />);
    const btn = screen.getByTestId('jobs-panel-body-view-all');
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onViewAll).toHaveBeenCalledOnce();
  });
});

// ─── onJobPauseResume forwarding ─────────────────────────────────────────────

describe('JobsPanelBody — onJobPauseResume forwarding', () => {
  it('Pause button visible and fires onJobPauseResume for a hovered running job', () => {
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

// ─── onJobCancel forwarding ──────────────────────────────────────────────────

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
