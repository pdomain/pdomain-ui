import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { ShortcutsHelpButton } from './ShortcutsHelpButton.js';
import { ShortcutsProvider } from '../hooks/ShortcutsContext.js';
import { useShortcuts } from '../hooks/ShortcutsContext.js';

// ─── Decorator ────────────────────────────────────────────────────────────────

/** Wraps the button in a ShortcutsProvider so clicking actually opens the dialog. */
function WithProvider({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '8px' }}>
      <ShortcutsProvider>{children}</ShortcutsProvider>
    </div>
  );
}

function withProvider(Story: React.ComponentType) {
  return (
    <WithProvider>
      <Story />
    </WithProvider>
  );
}

// ─── Story with sample bindings ───────────────────────────────────────────────

function WithBindings() {
  useShortcuts([
    { keys: 'mod+s', label: 'Save edits', group: 'Editing', handler: () => undefined },
    { keys: 'j', label: 'Next item', group: 'Navigation', handler: () => undefined },
    { keys: 'k', label: 'Previous item', group: 'Navigation', handler: () => undefined },
    { keys: '?', label: 'Show shortcuts', group: 'General', handler: () => undefined },
  ]);
  return null;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ShortcutsHelpButton> = {
  title: 'Shell/ShortcutsHelpButton',
  component: ShortcutsHelpButton,
  decorators: [withProvider],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Ghost icon button — click to open the global shortcuts cheatsheet. */
export const Default: Story = {};

/** Button with sample bindings registered — clicking shows the cheatsheet. */
export const WithSampleBindings: Story = {
  render: () => (
    <ShortcutsProvider>
      <WithBindings />
      <ShortcutsHelpButton />
    </ShortcutsProvider>
  ),
  decorators: [],
};
