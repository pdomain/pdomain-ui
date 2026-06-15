import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchField, ShortcutSearchField } from './SearchField.js';
import type { SearchFieldProps, ShortcutSearchFieldProps } from './SearchField.js';

function SearchFieldDemo(args: SearchFieldProps) {
  const [value, setValue] = useState(args.value);

  return (
    <SearchField {...args} value={value} onValueChange={setValue} onClear={() => setValue('')} />
  );
}

function ShortcutSearchFieldDemo(args: ShortcutSearchFieldProps) {
  const [value, setValue] = useState(args.value);

  return (
    <ShortcutSearchField
      {...args}
      value={value}
      onValueChange={setValue}
      onClear={() => setValue('')}
    />
  );
}

const meta = {
  title: 'Records/SearchField',
  component: SearchField,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    ariaLabel: 'Search records',
    placeholder: 'Search records',
    onValueChange: () => undefined,
  },
  render: (args) => <SearchFieldDemo {...args} />,
};

export const WithShortcut: Story = {
  args: {
    value: '',
    ariaLabel: 'Quick search',
    onValueChange: () => undefined,
  },
  render: () => (
    <ShortcutSearchFieldDemo
      value=""
      ariaLabel="Quick search"
      placeholder="Search projects"
      shortcutLabel="Mod K"
      onValueChange={() => undefined}
      onShortcutClick={() => undefined}
    />
  ),
};
