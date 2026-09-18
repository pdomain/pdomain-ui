/**
 * JobRow stories — covers all status variants per AC #355, plus cancelled
 * and the `pausable` capability flag.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { JobRow } from './JobRow.js';
import type { Job } from './JobRow.js';

const baseJob: Job = {
  id: 'job-demo',
  project: 'The Pickwick Papers',
  phase: 'OCR — page 12 of 340',
  pct: 35,
  status: 'running',
  cancelable: true,
};

const meta: Meta<typeof JobRow> = {
  title: 'Shell/JobRow',
  component: JobRow,
  parameters: {
    layout: 'padded',
  },
  args: {
    job: baseJob,
    hovered: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Status variants ──────────────────────────────────────────────────────────

export const Queued: Story = {
  args: {
    job: { ...baseJob, status: 'queued', pct: 0, phase: 'Waiting in queue' },
  },
};

export const Running: Story = {
  args: {
    job: baseJob,
  },
};

export const RunningHovered: Story = {
  name: 'Running (hovered)',
  args: {
    job: baseJob,
    hovered: true,
  },
};

export const Paused: Story = {
  args: {
    job: { ...baseJob, status: 'paused', phase: 'Paused at OCR — page 12 of 340' },
  },
};

export const PausedHovered: Story = {
  name: 'Paused (hovered)',
  args: {
    job: { ...baseJob, status: 'paused', phase: 'Paused at OCR — page 12 of 340' },
    hovered: true,
  },
};

export const Succeeded: Story = {
  args: {
    job: {
      ...baseJob,
      status: 'succeeded',
      pct: 100,
      phase: 'Completed',
    },
  },
};

export const Failed: Story = {
  args: {
    job: {
      ...baseJob,
      status: 'failed',
      pct: 60,
      phase: 'Failed at OCR — page 20 of 340',
      cancelable: false,
    },
  },
};

export const NonCancelableHovered: Story = {
  name: 'Running non-cancelable (hovered)',
  args: {
    job: { ...baseJob, cancelable: false },
    hovered: true,
  },
};

export const Cancelled: Story = {
  args: {
    job: {
      ...baseJob,
      status: 'cancelled',
      pct: 45,
      phase: 'Cancelled at OCR — page 15 of 340',
      cancelable: false,
    },
  },
};

export const NonPausableHovered: Story = {
  name: 'Running non-pausable (hovered)',
  args: {
    job: { ...baseJob, pausable: false },
    hovered: true,
  },
};
