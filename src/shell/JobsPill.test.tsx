/**
 * JobsPill tests — TDD first.
 *
 * Covers:
 *  - click handling (onClick callback)
 *  - running-state rendering (active jobs)
 *  - idle-state rendering (no active jobs)
 *  - high-count variant (count badge rendered)
 */

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobsPill } from './JobsPill.js';

const makeJob = (id: string, pct = 50) => ({
  id,
  title: `Job ${id}`,
  phase: 'OCR pass 1',
  pct,
  project: `Project ${id}`,
});

describe('JobsPill', () => {
  it('renders in idle state when no active jobs', () => {
    render(<JobsPill activeJobs={[]} />);
    const btn = screen.getByRole('button', { name: /jobs/i });
    expect(btn).toBeDefined();
    // idle: no count badge
    expect(screen.queryByTestId('jobs-pill-count')).toBeNull();
  });

  it('renders count badge when jobs are active', () => {
    const jobs = [makeJob('a'), makeJob('b'), makeJob('c')];
    render(<JobsPill activeJobs={jobs} />);
    const count = screen.getByTestId('jobs-pill-count');
    expect(count.textContent).toBe('3');
  });

  it('shows pulse dot when running', () => {
    render(<JobsPill activeJobs={[makeJob('a')]} />);
    expect(screen.getByTestId('jobs-pill-pulse')).toBeDefined();
  });

  it('does not show pulse dot when idle', () => {
    render(<JobsPill activeJobs={[]} />);
    expect(screen.queryByTestId('jobs-pill-pulse')).toBeNull();
  });

  it('calls onClick when button is clicked', () => {
    const onClick = vi.fn();
    render(<JobsPill activeJobs={[]} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /jobs/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders popover on hover (open=true)', () => {
    const jobs = [makeJob('x', 75)];
    render(<JobsPill activeJobs={jobs} open />);
    expect(screen.getByTestId('jobs-pill-popover')).toBeDefined();
    // Should show the job project name
    expect(screen.getByText('Project x')).toBeDefined();
  });

  it('does not render the hover popover when hoverPopover is false', () => {
    const jobs = [makeJob('x', 75)];
    render(<JobsPill activeJobs={jobs} hoverPopover={false} />);
    fireEvent.mouseEnter(screen.getByRole('button', { name: /jobs/i }));
    expect(screen.queryByTestId('jobs-pill-popover')).toBeNull();
  });

  it('renders idle message in popover when no active jobs and open', () => {
    render(<JobsPill activeJobs={[]} open />);
    expect(screen.getByTestId('jobs-pill-popover')).toBeDefined();
    expect(screen.getByText(/no active jobs/i)).toBeDefined();
  });

  it('renders high count (10+) correctly', () => {
    const jobs = Array.from({ length: 12 }, (_, i) => makeJob(String(i)));
    render(<JobsPill activeJobs={jobs} />);
    const count = screen.getByTestId('jobs-pill-count');
    expect(count.textContent).toBe('12');
  });

  it('accepts optional className', () => {
    render(<JobsPill activeJobs={[]} className="custom-class" />);
    const btn = screen.getByRole('button', { name: /jobs/i });
    // className may be on the wrapper or button; just ensure no crash
    expect(btn).toBeDefined();
  });
});
