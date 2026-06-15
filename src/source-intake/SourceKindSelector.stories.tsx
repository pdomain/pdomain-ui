import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SourceKindSelector } from './SourceKindSelector.js';
import type { SourceKindOption } from './types.js';

const kinds: SourceKindOption[] = [
  { id: 'file', label: 'Files', description: 'One or more source files' },
  { id: 'folder', label: 'Folder', description: 'A directory of scans' },
  { id: 'archive', label: 'Archive', description: 'ZIP or TAR bundle' },
  { id: 'path', label: 'Path', description: 'Typed local path' },
];

function SourceKindSelectorExample() {
  const [activeKind, setActiveKind] = useState('file');

  return (
    <SourceKindSelector
      ariaLabel="Source kind"
      activeKind={activeKind}
      kinds={kinds}
      onActiveKindChange={setActiveKind}
    />
  );
}

const meta = {
  title: 'Source Intake/SourceKindSelector',
  component: SourceKindSelector,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SourceKindSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'Source kind',
    activeKind: 'file',
    kinds,
    onActiveKindChange: () => undefined,
  },
  render: () => <SourceKindSelectorExample />,
};

export const WithDisabledKind: Story = {
  args: {
    ariaLabel: 'Source kind',
    activeKind: 'file',
    kinds: [...kinds, { id: 'camera', label: 'Camera', disabled: true }],
    onActiveKindChange: () => undefined,
  },
};
