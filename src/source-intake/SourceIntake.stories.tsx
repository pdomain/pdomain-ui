import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DirectoryPickerDialog } from './DirectoryPickerDialog.js';
import { FileDropzone } from './FileDropzone.js';
import { PathInputWithRecents } from './PathInputWithRecents.js';
import { SelectedSourceSummary } from './SelectedSourceSummary.js';
import { SourceKindSelector } from './SourceKindSelector.js';
import type { DirectoryEntry, SourceKindOption } from './types.js';

const kinds: SourceKindOption[] = [
  { id: 'file', label: 'Files', description: 'One or more source files' },
  { id: 'folder', label: 'Folder', description: 'A directory of scans' },
  { id: 'archive', label: 'Archive', description: 'ZIP or TAR bundle' },
  { id: 'path', label: 'Path', description: 'Typed local path' },
];

const entries: DirectoryEntry[] = [
  { name: 'novel', path: '/books/novel', kind: 'directory' },
  { name: 'poems', path: '/books/poems', kind: 'directory' },
  { name: 'notes.txt', path: '/books/notes.txt', kind: 'file' },
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

function PathInputExample() {
  const [value, setValue] = useState('/books/current');

  return (
    <PathInputWithRecents
      ariaLabel="Source path"
      value={value}
      onValueChange={setValue}
      recentPaths={['/books/current', '/books/archive', '/tmp/import']}
      onRecentPathSelect={setValue}
      hint="Use an absolute path from the app host."
      placeholder="/path/to/source"
    />
  );
}

function DirectoryPickerExample({ loading, error }: { loading?: boolean; error?: string }) {
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
  title: 'Source Intake/Kit',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DropzoneDefault: Story = {
  render: () => (
    <FileDropzone
      label="Drop source files"
      description="PNG, JPG, PDF, or ZIP files."
      accept="image/*,.pdf,.zip"
      multiple
      onFilesAccepted={() => undefined}
    />
  ),
};

export const SourceKindSelectorDefault: Story = {
  render: () => <SourceKindSelectorExample />,
};

export const PathInputWithRecentsDefault: Story = {
  render: () => <PathInputExample />,
};

export const SelectedSourceSummaryDefault: Story = {
  render: () => (
    <SelectedSourceSummary
      sources={[
        { id: 'one', kind: 'file', label: 'scan001.png', meta: '1 MB' },
        { id: 'two', kind: 'folder', label: '/books/novel', meta: '128 files' },
      ]}
      onRemove={() => undefined}
    />
  ),
};

export const DirectoryPickerOpen: Story = {
  render: () => <DirectoryPickerExample />,
};

export const DirectoryPickerLoading: Story = {
  render: () => <DirectoryPickerExample loading />,
};

export const DirectoryPickerError: Story = {
  render: () => <DirectoryPickerExample error="The directory listing could not be loaded." />,
};
