/**
 * JobsPanelBody stories — content-only Jobs dock body.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { JobsPanelBody } from './JobsPanelBody.js';
import type { Job } from './JobRow.js';

const runningJob: Job = {
  id: 'job-1',
  project: 'The Pickwick Papers',
  phase: 'OCR — page 12 of 340',
  pct: 35,
  status: 'running',
  cancelable: true,
};

const doneJob: Job = {
  id: 'job-2',
  project: 'Bleak House',
  phase: 'Completed',
  pct: 100,
  status: 'done',
  cancelable: false,
};

const meta: Meta<typeof JobsPanelBody> = {
  title: 'Shell/JobsPanelBody',
  component: JobsPanelBody,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof JobsPanelBody>;

export const WithJobs: Story = {
  args: {
    activeJobs: [runningJob, doneJob],
    onJobOpen: (id) => alert(`open: ${id}`),
    onViewAll: () => alert('view all'),
  },
};

export const Empty: Story = {
  args: {
    activeJobs: [],
  },
};
