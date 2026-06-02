/**
 * ShortcutsCheatsheetBody stories — content-only cheatsheet for the utility dock.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ShortcutsCheatsheetBody } from './ShortcutsCheatsheetBody.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

const BINDINGS: ShortcutBinding[] = [
  { keys: 'j', label: 'Next page', group: 'Navigation', handler: () => undefined },
  { keys: 'k', label: 'Previous page', group: 'Navigation', handler: () => undefined },
  { keys: 'mod+s', label: 'Save edits', group: 'Editing', handler: () => undefined },
  { keys: 'mod+z', label: 'Undo', group: 'Editing', handler: () => undefined },
  { keys: 'escape', label: 'Cancel selection', handler: () => undefined },
  { keys: '?', label: 'Show shortcuts', group: 'Help', handler: () => undefined },
];

const meta: Meta<typeof ShortcutsCheatsheetBody> = {
  title: 'Primitives/ShortcutsCheatsheetBody',
  component: ShortcutsCheatsheetBody,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ShortcutsCheatsheetBody>;

export const Default: Story = {
  args: {
    bindings: BINDINGS,
  },
};

export const Empty: Story = {
  args: {
    bindings: [],
  },
};
