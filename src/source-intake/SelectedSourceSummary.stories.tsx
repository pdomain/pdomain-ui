import type { Meta, StoryObj } from '@storybook/react';
import { SelectedSourceSummary } from './SelectedSourceSummary.js';

const sources = [
  { id: 'one', kind: 'file' as const, label: 'scan001.png', meta: '1 MB' },
  { id: 'two', kind: 'file' as const, label: 'scan002.png', meta: '980 KB' },
  { id: 'three', kind: 'folder' as const, label: '/books/novel', meta: '128 files' },
];

const meta = {
  title: 'Source Intake/SelectedSourceSummary',
  component: SelectedSourceSummary,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SelectedSourceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sources,
    onRemove: () => undefined,
  },
};

export const Limited: Story = {
  args: {
    sources,
    maxVisible: 2,
    onRemove: () => undefined,
  },
};

export const ReadOnly: Story = {
  args: {
    sources,
  },
};
