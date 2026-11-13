/**
 * Storybook stories for ProjectsEmpty.
 *
 * Three stories: Default, CustomCopy, SinglePrimaryAction.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProjectsEmpty } from './index.js';

const meta = {
  title: 'Stages/Projects/ProjectsEmpty',
  component: ProjectsEmpty,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProjectsEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomCopy: Story = {
  args: {
    title: 'Your library is empty',
    description:
      'Upload a folder of scans to begin. Each project tracks its own pages, pipeline state, and settings end-to-end.',
    primaryAction: {
      label: 'Upload scans',
      onClick: () => {
        // no-op in Storybook
      },
    },
    secondaryAction: {
      label: 'Paste archive.org URL',
      onClick: () => {
        // no-op in Storybook
      },
    },
  },
};

export const SinglePrimaryAction: Story = {
  args: {
    primaryAction: {
      label: 'Create your first project',
      onClick: () => {
        // no-op in Storybook
      },
    },
  },
};
