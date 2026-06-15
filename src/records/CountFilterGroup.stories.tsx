import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CountFilterGroup } from './CountFilterGroup.js';
import type { CountFilterGroupProps } from './CountFilterGroup.js';

function CountFilterGroupDemo(args: CountFilterGroupProps) {
  const [activeId, setActiveId] = useState(args.activeId);

  return <CountFilterGroup {...args} activeId={activeId} onActiveChange={setActiveId} />;
}

const meta = {
  title: 'Records/CountFilterGroup',
  component: CountFilterGroup,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CountFilterGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'Filter projects',
    activeId: 'all',
    onActiveChange: () => undefined,
    filters: [
      { id: 'all', label: 'All', count: 18 },
      { id: 'running', label: 'Running', count: 3 },
      { id: 'review', label: 'Review', count: 6 },
      { id: 'done', label: 'Done', count: 9 },
    ],
  },
  render: (args) => <CountFilterGroupDemo {...args} />,
};
