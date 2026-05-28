import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ShortcutsCheatsheet } from './ShortcutsCheatsheet.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

const BINDINGS: ShortcutBinding[] = [
  { keys: 'j', label: 'Next page', group: 'Navigation', handler: () => undefined },
  { keys: 'k', label: 'Previous page', group: 'Navigation', handler: () => undefined },
  { keys: 'arrowright', label: 'Next word', group: 'Navigation', handler: () => undefined },
  { keys: 'arrowleft', label: 'Previous word', group: 'Navigation', handler: () => undefined },
  { keys: 'mod+s', label: 'Save edits', group: 'Editing', handler: () => undefined },
  { keys: 'mod+z', label: 'Undo', group: 'Editing', handler: () => undefined },
  { keys: 'escape', label: 'Cancel selection', handler: () => undefined },
  { keys: '?', label: 'Show shortcuts', group: 'Help', handler: () => undefined },
];

const meta: Meta<typeof ShortcutsCheatsheet> = {
  title: 'Primitives/ShortcutsCheatsheet',
  component: ShortcutsCheatsheet,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ShortcutsCheatsheet>;

function InteractiveWrapper(): React.ReactElement {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        Open Cheatsheet
      </button>
      <ShortcutsCheatsheet open={open} onClose={() => setOpen(false)} bindings={BINDINGS} />
    </>
  );
}

export const Default: Story = {
  render: () => <InteractiveWrapper />,
};

export const Empty: Story = {
  args: { open: true, onClose: () => undefined, bindings: [] },
};
