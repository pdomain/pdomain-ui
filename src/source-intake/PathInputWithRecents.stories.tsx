import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PathInputWithRecents } from './PathInputWithRecents.js';
import type { PathInputWithRecentsProps } from './PathInputWithRecents.js';

function PathInputExample(args: PathInputWithRecentsProps) {
  const [value, setValue] = useState(args.value);

  return (
    <PathInputWithRecents
      {...args}
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        args.onValueChange(nextValue);
      }}
      onRecentPathSelect={(path) => {
        setValue(path);
        args.onRecentPathSelect?.(path);
      }}
    />
  );
}

const meta = {
  title: 'Source Intake/PathInputWithRecents',
  component: PathInputWithRecents,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PathInputWithRecents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <PathInputExample {...args} />,
  args: {
    ariaLabel: 'Source path',
    value: '/books/current',
    onValueChange: () => undefined,
    placeholder: '/path/to/source',
    recentPaths: ['/books/current', '/books/archive', '/tmp/import'],
    hint: 'Use an absolute path from the app host.',
  },
};

export const WithError: Story = {
  render: (args) => <PathInputExample {...args} />,
  args: {
    ...Default.args,
    error: 'The path could not be opened.',
  },
};
