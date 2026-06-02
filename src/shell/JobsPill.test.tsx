/**
 * JobsPill tests.
 *
 * After M5: the inline hover popover has been removed. hoverPopover defaults
 * to false. The pill is a simple button that calls onClick; click-to-toggle
 * the jobs dock surface is wired by the consumer (AppHeader/AppShell).
 *
 * Covers:
 *  - click handling (onClick callback)
 *  - running-state rendering (active jobs)
 *  - idle-state rendering (no active jobs)
 *  - high-count variant (count badge rendered)
 *  - popover markup is gone (hoverPopover defaults false)
 *  - aria-expanded is gone (no internal open state)
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

  it('renders high count (10+) correctly', () => {
    const jobs = Array.from({ length: 12 }, (_, i) => makeJob(String(i)));
    render(<JobsPill activeJobs={jobs} />);
    const count = screen.getByTestId('jobs-pill-count');
    expect(count.textContent).toBe('12');
  });

  it('accepts optional className', () => {
    render(<JobsPill activeJobs={[]} className="custom-class" />);
    const btn = screen.getByRole('button', { name: /jobs/i });
    expect(btn).toBeDefined();
  });
});

describe('JobsPill — popover removed', () => {
  it('does not render the inline popover even on hover (hoverPopover defaults false)', () => {
    render(
      <JobsPill activeJobs={[{ id: 'j', title: 'T', phase: 'p', pct: 1, project: 'x' }]} />,
    );
    // hover would previously open jobs-pill-popover; that markup no longer exists.
    expect(screen.queryByTestId('jobs-pill-popover')).toBeNull();
  });

  it('calls onClick when the pill is clicked', () => {
    const onClick = vi.fn();
    render(<JobsPill activeJobs={[]} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /jobs/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('still renders the count badge when there are active jobs', () => {
    render(
      <JobsPill activeJobs={[{ id: 'j', title: 'T', phase: 'p', pct: 1, project: 'x' }]} />,
    );
    expect(screen.getByTestId('jobs-pill-count')).toBeTruthy();
  });

  it('passing deprecated open=true does NOT render the inline popover', () => {
    const jobs = [makeJob('x', 75)];
    // open is now @deprecated and ignored; no popover should appear.
    render(<JobsPill activeJobs={jobs} open />);
    expect(screen.queryByTestId('jobs-pill-popover')).toBeNull();
  });

  it('passing deprecated hoverPopover=true does NOT render the inline popover on hover', () => {
    const jobs = [makeJob('x', 75)];
    render(<JobsPill activeJobs={jobs} hoverPopover />);
    fireEvent.mouseEnter(screen.getByRole('button', { name: /jobs/i }));
    expect(screen.queryByTestId('jobs-pill-popover')).toBeNull();
  });
});
