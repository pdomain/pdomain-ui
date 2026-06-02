import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { ShortcutsHelpButton } from './ShortcutsHelpButton.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue } from './UtilityDockContext.js';

// ─── Stub dock context ─────────────────────────────────────────────────────────

function WithDockCtx({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState<UtilityDockContextValue['active']>(null);

  const ctx: UtilityDockContextValue = {
    active,
    pinned: false,
    width: 420,
    open: (s) => setActive(s),
    close: () => setActive(null),
    toggle: (s) => setActive((c) => (c === s ? null : s)),
    setPinned: () => undefined,
    setWidth: () => undefined,
  };

  return (
    <UtilityDockContext.Provider value={ctx}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '8px' }}>
        {children}
        {active === 'keybinds' && (
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            Keybinds dock open (aria-expanded=true)
          </span>
        )}
      </div>
    </UtilityDockContext.Provider>
  );
}

function withDockCtx(Story: React.ComponentType) {
  return (
    <WithDockCtx>
      <Story />
    </WithDockCtx>
  );
}

const meta: Meta<typeof ShortcutsHelpButton> = {
  title: 'Shell/ShortcutsHelpButton',
  component: ShortcutsHelpButton,
  decorators: [withDockCtx],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Ghost icon button — click to toggle the keybinds dock surface. */
export const Default: Story = {};
