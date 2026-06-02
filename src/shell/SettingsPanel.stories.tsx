/**
 * SettingsPanel stories — content-only Settings dock body.
 * Requires UIPrefsStoreProvider for the AppearancePanel sub-component.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { UIPrefsStoreProvider } from '../stores/index.js';
import { SettingsPanel } from './SettingsPanel.js';
import type { UIPrefsConfig } from './types.js';

const STUB_CONFIG: UIPrefsConfig = {
  load: () =>
    Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 }),
  persistCommon: () => Promise.resolve(),
  persistApp: () => Promise.resolve(),
};

function WithStore({ children }: { children: React.ReactNode }) {
  const store = React.useMemo(() => createUIPrefsStore(STUB_CONFIG), []);
  return <UIPrefsStoreProvider value={store}>{children}</UIPrefsStoreProvider>;
}

const meta: Meta<typeof SettingsPanel> = {
  title: 'Shell/SettingsPanel',
  component: SettingsPanel,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <WithStore>
        <div style={{ height: 400, width: 360, border: '1px solid var(--border-1)' }}>
          <Story />
        </div>
      </WithStore>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsPanel>;

export const Appearance: Story = {
  args: {
    activePanel: 'appearance',
    onSelectPanel: () => undefined,
  },
};

export const WithInjectedPanel: Story = {
  args: {
    activePanel: 'export',
    onSelectPanel: () => undefined,
    settingsPanels: [
      {
        id: 'export',
        label: 'Export',
        content: <div style={{ padding: 8 }}>Export settings body</div>,
      },
    ],
  },
};
