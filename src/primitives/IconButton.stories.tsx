import type { Meta, StoryObj } from '@storybook/react';
import { Search, Trash2, Plus, Settings, X, RefreshCw } from '../icons/lucide.js';
import { IconButton } from './IconButton.js';

const meta: Meta<typeof IconButton> = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default (md)',
  args: {
    'aria-label': 'Search',
    icon: <Search size={14} />,
  },
};

export const Small: Story = {
  name: 'Small (sm)',
  args: {
    'aria-label': 'Close',
    icon: <X size={12} />,
    size: 'sm',
  },
};

export const Large: Story = {
  name: 'Large (lg)',
  args: {
    'aria-label': 'Settings',
    icon: <Settings size={16} />,
    size: 'lg',
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    'aria-label': 'Refresh',
    icon: <RefreshCw size={14} />,
    disabled: true,
  },
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IconButton aria-label="Add (sm)" icon={<Plus size={12} />} size="sm" />
      <IconButton aria-label="Add (md)" icon={<Plus size={14} />} />
      <IconButton aria-label="Add (lg)" icon={<Plus size={16} />} size="lg" />
    </div>
  ),
};

export const Cluster: Story = {
  name: 'Button cluster (inside ButtonGroup)',
  render: () => (
    <div style={{ display: 'flex', gap: '4px' }}>
      <IconButton aria-label="Search" icon={<Search size={14} />} />
      <IconButton aria-label="Settings" icon={<Settings size={14} />} />
      <IconButton aria-label="Delete" icon={<Trash2 size={14} />} />
    </div>
  ),
};
