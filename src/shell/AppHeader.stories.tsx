/**
 * AppHeader stories — covers idle, active-jobs, and unread-notifications variants.
 *
 * Renders in both dark (:root) and light ([data-theme="light"]) per spec §9 Phase-1.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { AppHeader } from './AppHeader.js';

const meta: Meta<typeof AppHeader> = {
  title: 'Shell/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Opinionated top-chrome header for pdomain-* SPAs. Composes JobsPill, bell ' +
          'notification button, and user avatar. All colors via var(--token).',
      },
    },
  },
  argTypes: {
    appName: { control: 'text' },
    appInitial: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    username: { control: 'text' },
    initials: { control: 'text' },
    unread: { control: { type: 'number', min: 0 } },
    jobsOpen: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

const SAMPLE_JOBS = [
  { id: '1', title: 'OCR run', phase: 'OCR — page 12 of 40', pct: 31, project: 'belloc-survivals' },
  {
    id: '2',
    title: 'Ingest',
    phase: 'Ingest — copying pages',
    pct: 68,
    project: 'doyle-adventure',
  },
];

/** Default idle state — no active jobs, no unread notifications. */
export const Default: Story = {
  args: {
    appName: 'pgdp-prep',
    username: 'jsmith',
    initials: 'JS',
    unread: 0,
    activeJobs: [],
  },
};

/** Active jobs — JobsPill shows pulse dot and count badge. */
export const WithActiveJobs: Story = {
  args: {
    appName: 'pgdp-prep',
    username: 'jsmith',
    initials: 'JS',
    unread: 0,
    activeJobs: SAMPLE_JOBS,
  },
};

/** Jobs popover open — for static artboard / Storybook demo. */
export const JobsPopoverOpen: Story = {
  args: {
    appName: 'pgdp-prep',
    username: 'jsmith',
    initials: 'JS',
    unread: 0,
    activeJobs: SAMPLE_JOBS,
    jobsOpen: true,
  },
};

/** Unread notification badge visible. */
export const WithUnread: Story = {
  args: {
    appName: 'pgdp-prep',
    username: 'jsmith',
    initials: 'JS',
    unread: 5,
    activeJobs: [],
  },
};

/** Combined: active jobs + unread badge. */
export const FullyLoaded: Story = {
  args: {
    appName: 'pgdp-prep',
    username: 'jsmith',
    initials: 'JS',
    unread: 3,
    activeJobs: SAMPLE_JOBS,
  },
};

/** Light theme variant — wrap with data-theme="light". */
export const LightTheme: Story = {
  args: {
    appName: 'pgdp-prep',
    username: 'jsmith',
    initials: 'JS',
    unread: 2,
    activeJobs: SAMPLE_JOBS,
  },
  decorators: [
    (Story) => (
      <div data-theme="light">
        <Story />
      </div>
    ),
  ],
};

/** Custom app name and initial. */
export const CustomApp: Story = {
  args: {
    appName: 'labeler-spa',
    appInitial: 'L',
    username: 'awhite',
    initials: 'AW',
    unread: 0,
    activeJobs: [],
  },
};
