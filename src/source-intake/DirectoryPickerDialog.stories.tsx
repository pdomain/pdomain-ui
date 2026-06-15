import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DirectoryPickerDialog } from './DirectoryPickerDialog.js';
import type { DirectoryEntry } from './types.js';

const entries: DirectoryEntry[] = [
  { name: 'novel', path: '/books/novel', kind: 'directory' },
  { name: 'poems', path: '/books/poems', kind: 'directory' },
  { name: 'notes.txt', path: '/books/notes.txt', kind: 'file' },
];

type DirectoryPickerStoryProps = {
  loading?: boolean;
  error?: string;
};

function DirectoryPickerExample({ loading, error }: DirectoryPickerStoryProps) {
  const [open, setOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState('/books');
  const [inputPath, setInputPath] = useState('/books');
  const stateProps = {
    ...(loading !== undefined ? { loading } : {}),
    ...(error !== undefined ? { error } : {}),
  };

  return (
    <DirectoryPickerDialog
      open={open}
      onOpenChange={setOpen}
      currentPath={currentPath}
      onCurrentPathChange={(path) => {
        setCurrentPath(path);
        setInputPath(path);
      }}
      inputPath={inputPath}
      onInputPathChange={setInputPath}
      entries={entries}
      onRefresh={() => undefined}
      onHome={() => {
        setCurrentPath('/home/user');
        setInputPath('/home/user');
      }}
      onUp={() => {
        setCurrentPath('/books');
        setInputPath('/books');
      }}
      onApply={() => undefined}
      {...stateProps}
    />
  );
}

const meta = {
  title: 'Source Intake/DirectoryPickerDialog',
  component: DirectoryPickerDialog,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DirectoryPickerDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    currentPath: '/books',
    onCurrentPathChange: () => undefined,
    inputPath: '/books',
    onInputPathChange: () => undefined,
    entries,
    onApply: () => undefined,
  },
  render: () => <DirectoryPickerExample />,
};

export const Loading: Story = {
  args: {
    ...Open.args,
    loading: true,
  },
  render: () => <DirectoryPickerExample loading />,
};

export const Error: Story = {
  args: {
    ...Open.args,
    error: 'The directory listing could not be loaded.',
  },
  render: () => <DirectoryPickerExample error="The directory listing could not be loaded." />,
};
