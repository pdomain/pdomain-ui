/**
 * UtilityDock stories — the right-side dock switching on active surface.
 *
 * Each surface (settings / keybinds / jobs) is shown in overlay mode and
 * pinned mode. Providers: UIPrefsStoreProvider (for SettingsPanel) +
 * UtilityDockContext.Provider (for the dock value).
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { UIPrefsStoreProvider } from '../stores/index.js';
import { UtilityDock } from './UtilityDock.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue, DockSurface } from './UtilityDockContext.js';
import type { UIPrefsConfig } from './types.js';

// ─── Shared setup ─────────────────────────────────────────────────────────────

const STUB_CONFIG: UIPrefsConfig = {
  load: () =>
    Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 }),
  persistCommon: () => Promise.resolve(),
  persistApp: () => Promise.resolve(),
};

function makeCtx(active: DockSurface, pinned: boolean, width = 420): UtilityDockContextValue {
  return {
    active,
    pinned,
    width,
    open: () => undefined,
    close: () => undefined,
    toggle: () => undefined,
    setPinned: () => undefined,
    setWidth: () => undefined,
  };
}

function WithProviders({
  active,
  pinned,
  width,
  children,
}: {
  active: DockSurface;
  pinned: boolean;
  width?: number;
  children: React.ReactNode;
}) {
  const store = React.useMemo(() => createUIPrefsStore(STUB_CONFIG), []);
  const ctx = React.useMemo(() => makeCtx(active, pinned, width), [active, pinned, width]);
  return (
    <UIPrefsStoreProvider value={store}>
      <UtilityDockContext.Provider value={ctx}>{children}</UtilityDockContext.Provider>
    </UIPrefsStoreProvider>
  );
}

const SAMPLE_BINDINGS = [
  { keys: '?', label: 'Keyboard shortcuts', handler: () => undefined, group: 'General' },
  { keys: 's', label: 'Save', handler: () => undefined, group: 'Editing' },
  { keys: 'g', label: 'Go to page', handler: () => undefined, group: 'Navigation' },
];

const SAMPLE_JOBS = [
  {
    id: 'j1',
    project: 'belloc-hills',
    phase: 'OCR',
    pct: 42,
    status: 'running' as const,
    cancelable: true,
  },
  {
    id: 'j2',
    project: 'chesterton-orthodoxy',
    phase: 'Ingest',
    pct: 100,
    status: 'done' as const,
    cancelable: false,
  },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof UtilityDock> = {
  title: 'Shell/UtilityDock',
  component: UtilityDock,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UtilityDock>;

// ─── Settings surface ─────────────────────────────────────────────────────────

export const SettingsOverlay: Story = {
  decorators: [
    (Story) => (
      <WithProviders active="settings" pinned={false}>
        <div
          style={{ position: 'relative', height: '100vh', background: 'var(--bg-page, #1a1a1a)' }}
        >
          <Story />
        </div>
      </WithProviders>
    ),
  ],
};

export const SettingsPinned: Story = {
  decorators: [
    (Story) => (
      <WithProviders active="settings" pinned width={480}>
        <div
          style={{ position: 'relative', height: '100vh', background: 'var(--bg-page, #1a1a1a)' }}
        >
          <Story />
        </div>
      </WithProviders>
    ),
  ],
};

// ─── Keybinds surface ─────────────────────────────────────────────────────────

export const KeybindsOverlay: Story = {
  args: { bindings: SAMPLE_BINDINGS },
  decorators: [
    (Story) => (
      <WithProviders active="keybinds" pinned={false}>
        <div
          style={{ position: 'relative', height: '100vh', background: 'var(--bg-page, #1a1a1a)' }}
        >
          <Story />
        </div>
      </WithProviders>
    ),
  ],
};

export const KeybindsPinned: Story = {
  args: { bindings: SAMPLE_BINDINGS },
  decorators: [
    (Story) => (
      <WithProviders active="keybinds" pinned width={420}>
        <div
          style={{ position: 'relative', height: '100vh', background: 'var(--bg-page, #1a1a1a)' }}
        >
          <Story />
        </div>
      </WithProviders>
    ),
  ],
};

// ─── Jobs surface ─────────────────────────────────────────────────────────────

export const JobsOverlay: Story = {
  args: { activeJobs: SAMPLE_JOBS },
  decorators: [
    (Story) => (
      <WithProviders active="jobs" pinned={false}>
        <div
          style={{ position: 'relative', height: '100vh', background: 'var(--bg-page, #1a1a1a)' }}
        >
          <Story />
        </div>
      </WithProviders>
    ),
  ],
};

export const JobsPinned: Story = {
  args: { activeJobs: SAMPLE_JOBS },
  decorators: [
    (Story) => (
      <WithProviders active="jobs" pinned width={420}>
        <div
          style={{ position: 'relative', height: '100vh', background: 'var(--bg-page, #1a1a1a)' }}
        >
          <Story />
        </div>
      </WithProviders>
    ),
  ],
};
