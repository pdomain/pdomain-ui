/**
 * JobsPanelBody tests — the dock body for the Jobs surface.
 * Reuses the JobRow list extracted from JobsDrawer.
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

  it('forwards onViewAll via the View all jobs button', () => {
    const onViewAll = vi.fn();
    render(<JobsPanelBody activeJobs={jobs} onViewAll={onViewAll} />);
    fireEvent.click(screen.getByTestId('jobs-panel-body-view-all'));
    expect(onViewAll).toHaveBeenCalledOnce();
  });
});
