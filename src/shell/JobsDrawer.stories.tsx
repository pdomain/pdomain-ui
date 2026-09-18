/**
 * JobsDrawer stories — covers all three modes (expanded / collapsed / dismissed)
 * plus toast tombstone cards per AC #354.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { JobsDrawer } from './JobsDrawer.js';
import type { Job } from './JobRow.js';
import type { JobToast } from './JobsDrawer.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const runningJob: Job = {
  id: 'job-1',
  project: 'The Pickwick Papers',
  phase: 'OCR — page 12 of 340',
  pct: 35,
  status: 'running',
  cancelable: true,
};

const pausedJob: Job = {
  id: 'job-2',
  project: 'Bleak House',
  phase: 'Paused at OCR — page 5 of 280',
  pct: 18,
  status: 'paused',
  cancelable: false,
};

const doneJob: Job = {
  id: 'job-3',
  project: 'Great Expectations',
  phase: 'Completed',
  pct: 100,
  status: 'done',
  cancelable: false,
};

const failedJob: Job = {
  id: 'job-4',
  project: 'Oliver Twist',
  phase: 'Failed at OCR — page 20 of 340',
  pct: 60,
  status: 'failed',
  cancelable: false,
};

const cancelledJob: Job = {
  id: 'job-5',
  project: 'David Copperfield',
  phase: 'Cancelled at OCR — page 30 of 340',
  pct: 45,
  status: 'cancelled',
  cancelable: false,
};

const sampleToasts: JobToast[] = [
  {
    id: 'toast-1',
    project: 'A Tale of Two Cities',
    message: 'Completed · 312 pages processed',
  },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof JobsDrawer> = {
  title: 'Shell/JobsDrawer',
  component: JobsDrawer,
  parameters: {
    layout: 'padded',
  },
  args: {
    activeJobs: [runningJob],
    toasts: [],
    mode: 'expanded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Mode variants ────────────────────────────────────────────────────────────

export const Expanded: Story = {
  args: {
    activeJobs: [runningJob, pausedJob, doneJob],
    mode: 'expanded',
  },
};

export const ExpandedSingleRunning: Story = {
  name: 'Expanded — single running job',
  args: {
    activeJobs: [runningJob],
    mode: 'expanded',
  },
};

export const ExpandedWithFailed: Story = {
  name: 'Expanded — with failed job',
  args: {
    activeJobs: [runningJob, failedJob],
    mode: 'expanded',
  },
};

export const ExpandedWithCancelled: Story = {
  name: 'Expanded — with cancelled job',
  args: {
    activeJobs: [runningJob, cancelledJob],
    mode: 'expanded',
  },
};

export const Collapsed: Story = {
  args: {
    activeJobs: [runningJob],
    mode: 'collapsed',
  },
};

export const CollapsedMultiple: Story = {
  name: 'Collapsed — multiple running jobs',
  args: {
    activeJobs: [runningJob, pausedJob],
    mode: 'collapsed',
  },
};

export const DismissedWithToasts: Story = {
  name: 'Dismissed — with tombstone toasts',
  args: {
    activeJobs: [],
    toasts: sampleToasts,
    mode: 'dismissed',
  },
};

export const ExpandedWithToasts: Story = {
  name: 'Expanded — with tombstone toasts above',
  args: {
    activeJobs: [runningJob],
    toasts: sampleToasts,
    mode: 'expanded',
  },
};

export const Empty: Story = {
  name: 'Dismissed — empty (renders nothing)',
  args: {
    activeJobs: [],
    toasts: [],
    mode: 'dismissed',
  },
};
