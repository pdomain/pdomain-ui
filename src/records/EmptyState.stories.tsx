import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { CheckIcon } from '../primitives/CheckIcon.js';
import { EmptyState } from './EmptyState.js';

const meta = {
  title: 'Records/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No records',
    description: 'Records will appear here after you add a source.',
  },
};

export const Danger: Story = {
  args: {
    title: 'Could not load records',
    description: 'Refresh the view or check the source connection.',
    tone: 'danger',
  },
};

export const Info: Story = {
  args: {
    title: 'Waiting for import',
    description: 'Records will be created once the import finishes.',
    tone: 'info',
  },
};

export const Warning: Story = {
  args: {
    title: 'Review needed',
    description: 'Some records need attention before they can continue.',
    tone: 'warning',
  },
};

export const LongText: Story = {
  args: {
    title: 'No matching records for the current filters',
    description:
      'Try clearing one or more filters, changing the active source, or widening the date range to include records that were processed earlier.',
  },
};

export const WithActionAndIcon: Story = {
  args: {
    title: 'No projects',
    description: 'Open a source folder to start building records.',
    icon: <CheckIcon state="skip" size={24} />,
    action: <Button size="sm">Open folder</Button>,
  },
};
