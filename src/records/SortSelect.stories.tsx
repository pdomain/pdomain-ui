import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SortSelect } from './SortSelect.js';
import type { SortSelectProps } from './SortSelect.js';

function SortSelectDemo(args: SortSelectProps) {
  const [value, setValue] = useState(args.value);

  return <SortSelect {...args} value={value} onValueChange={setValue} />;
}

const meta = {
  title: 'Records/SortSelect',
  component: SortSelect,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SortSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'Sort projects',
    value: 'name',
    onValueChange: () => undefined,
    options: [
      { value: 'name', label: 'Name' },
      { value: 'updated', label: 'Last updated' },
      { value: 'status', label: 'Status' },
    ],
  },
  render: (args) => <SortSelectDemo {...args} />,
};
