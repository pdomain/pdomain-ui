import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TriStateChip } from './TriStateChip.js';
import type { TriStateValue } from './TriStateChip.js';

const meta: Meta<typeof TriStateChip> = {
  title: 'Primitives/TriStateChip',
  component: TriStateChip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'select',
      options: ['off', 'on', 'mixed'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TriStateChip>;

function ControlledTriStateChip({
  label,
  initialValue = 'off',
}: {
  label: string;
  initialValue?: TriStateValue;
}) {
  const [value, setValue] = useState<TriStateValue>(initialValue);
  return (
    <TriStateChip value={value} onChange={setValue}>
      {label}
    </TriStateChip>
  );
}

export const Off: Story = {
  render: () => <ControlledTriStateChip label="Hyphen joins" />,
};

export const On: Story = {
  render: () => <ControlledTriStateChip label="Hyphen joins" initialValue="on" />,
};

export const Mixed: Story = {
  render: () => <ControlledTriStateChip label="Hyphen joins" initialValue="mixed" />,
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <TriStateChip value="off">Off</TriStateChip>
      <TriStateChip value="on">On</TriStateChip>
      <TriStateChip value="mixed">Mixed</TriStateChip>
    </div>
  ),
};
