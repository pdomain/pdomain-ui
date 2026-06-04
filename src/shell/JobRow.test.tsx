/**
 * JobRow tests — covering #355.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobRow } from './JobRow.js';
import type { Job } from './JobRow.js';

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    project: 'My Book',
    phase: 'OCR — page 12 of 40',
    pct: 30,
    status: 'running',
    cancelable: true,
    ...overrides,
  };
}

describe('JobRow (#355)', () => {
  // ─── status rendering ──────────────────────────────────────────────────────

  it('renders project name', () => {
    render(<JobRow job={makeJob()} />);
    expect(screen.getByText('My Book')).toBeTruthy();
  });

  it('renders phase label', () => {
    render(<JobRow job={makeJob()} />);
    expect(screen.getByText('OCR — page 12 of 40')).toBeTruthy();
  });

  it('renders percentage for running status', () => {
    render(<JobRow job={makeJob({ status: 'running', pct: 42 })} />);
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('renders percentage for queued status', () => {
    render(<JobRow job={makeJob({ status: 'queued', pct: 0 })} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('shows Open button for succeeded status', () => {
    render(<JobRow job={makeJob({ status: 'succeeded', pct: 100 })} />);
    expect(screen.getByRole('button', { name: /open/i })).toBeTruthy();
  });

  it('shows Open button for done status', () => {
    render(<JobRow job={makeJob({ status: 'done', pct: 100 })} />);
    expect(screen.getByRole('button', { name: /open/i })).toBeTruthy();
  });

  it('does not render progress bar for succeeded status', () => {
    render(<JobRow job={makeJob({ status: 'succeeded', pct: 100 })} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders progress bar for running status', () => {
    render(<JobRow job={makeJob({ status: 'running', pct: 50 })} />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('renders progress bar for queued status', () => {
    render(<JobRow job={makeJob({ status: 'queued', pct: 0 })} />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('renders progress bar for failed status', () => {
    render(<JobRow job={makeJob({ status: 'failed', pct: 60 })} />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('shows failure indicator for failed status', () => {
    render(<JobRow job={makeJob({ status: 'failed', pct: 60 })} />);
    expect(screen.getByTestId('job-row-status-failed')).toBeTruthy();
  });

  // ─── cancel callback ───────────────────────────────────────────────────────

  it('calls onCancel when Discard button clicked (cancelable + hovered)', () => {
    const onCancel = vi.fn();
    render(<JobRow job={makeJob({ cancelable: true })} hovered onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledWith('job-1');
  });

  it('does not render Discard button when not cancelable', () => {
    render(<JobRow job={makeJob({ cancelable: false })} hovered />);
    expect(screen.queryByRole('button', { name: /discard/i })).toBeNull();
  });

  it('does not render hover actions when not hovered', () => {
    render(<JobRow job={makeJob({ cancelable: true })} />);
    expect(screen.queryByRole('button', { name: /discard/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /pause/i })).toBeNull();
  });

  it('calls onOpen when Open project button clicked (hovered, running)', () => {
    const onOpen = vi.fn();
    render(<JobRow job={makeJob({ status: 'running' })} hovered onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /open project/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith('job-1');
  });

  it('calls onOpen when Open button clicked (succeeded)', () => {
    const onOpen = vi.fn();
    render(<JobRow job={makeJob({ status: 'succeeded', pct: 100 })} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith('job-1');
  });

  it('shows Resume button when paused + hovered', () => {
    render(<JobRow job={makeJob({ status: 'paused' })} hovered />);
    expect(screen.getByRole('button', { name: /resume/i })).toBeTruthy();
  });

  it('shows Pause button when running + hovered', () => {
    render(<JobRow job={makeJob({ status: 'running' })} hovered />);
    expect(screen.getByRole('button', { name: /pause/i })).toBeTruthy();
  });

  it('calls onPauseResume when Pause button clicked', () => {
    const onPauseResume = vi.fn();
    render(<JobRow job={makeJob({ status: 'running' })} hovered onPauseResume={onPauseResume} />);
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(onPauseResume).toHaveBeenCalledTimes(1);
    expect(onPauseResume).toHaveBeenCalledWith('job-1');
  });

  it('calls onPauseResume when Resume button clicked', () => {
    const onPauseResume = vi.fn();
    render(<JobRow job={makeJob({ status: 'paused' })} hovered onPauseResume={onPauseResume} />);
    fireEvent.click(screen.getByRole('button', { name: /resume/i }));
    expect(onPauseResume).toHaveBeenCalledTimes(1);
    expect(onPauseResume).toHaveBeenCalledWith('job-1');
  });

  // ─── testid presence ───────────────────────────────────────────────────────

  it('has data-testid="job-row"', () => {
    render(<JobRow job={makeJob()} />);
    expect(screen.getByTestId('job-row')).toBeTruthy();
  });

  // ─── Task 1: done jobs must be visually static ─────────────────────────────

  it('done job renders NO .shimmer element', () => {
    const { container } = render(
      <JobRow job={makeJob({ status: 'done', pct: 100 })} />,
    );
    expect(container.querySelector('.shimmer')).toBeNull();
  });

  it('done job status dot has no infinite animation', () => {
    render(<JobRow job={makeJob({ status: 'done', pct: 100 })} />);
    const dot = screen.getByTestId('job-status-dot');
    expect(dot).toBeTruthy();
    const anim = (dot as HTMLElement).style.animation;
    expect(anim === '' || anim === 'none').toBe(true);
  });

  it('status dot exists for running job', () => {
    render(<JobRow job={makeJob({ status: 'running', pct: 30 })} />);
    expect(screen.getByTestId('job-status-dot')).toBeTruthy();
  });

});
