import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell.js';
import { Button } from '../primitives/Button.js';
import type { UIPrefsConfig } from './types.js';

// Stub UIPrefsConfig for story use — returns default prefs, no-op persist.
const STUB_PREFS_CONFIG: UIPrefsConfig = {
  load: () =>
    Promise.resolve({
      theme: 'dark',
      density: 'comfortable',
      fontScale: 1.0,
    }),
  persistCommon: () => Promise.resolve(),
  persistApp: () => Promise.resolve(),
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof AppShell> = {
  title: 'Shell/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Shared slot fragments ─────────────────────────────────────────────────────

const HeaderSlot = (
  <div
    style={{
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
      background: 'var(--bg-raised)',
      borderBottom: '1px solid var(--border-1)',
    }}
  >
    <span style={{ fontWeight: 600, color: 'var(--ink-1)' }}>pdomain-ui Demo App</span>
    <Button variant="ghost" size="sm">
      File
    </Button>
    <Button variant="ghost" size="sm">
      Edit
    </Button>
    <Button variant="ghost" size="sm">
      View
    </Button>
  </div>
);

const RailSlot = (
  <div
    style={{
      width: '64px',
      height: '100%',
      background: 'var(--bg-raised)',
      borderRight: '1px solid var(--border-1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '16px',
      gap: '8px',
    }}
  >
    <Button variant="ghost" size="sm" title="Layers">
      L
    </Button>
    <Button variant="ghost" size="sm" title="Search">
      S
    </Button>
    <Button variant="ghost" size="sm" title="Settings">
      G
    </Button>
  </div>
);

const DrawerSlot = (
  <div
    style={{
      width: '240px',
      height: '100%',
      background: 'var(--bg-page)',
      borderRight: '1px solid var(--border-1)',
      padding: '16px',
    }}
  >
    <h3 style={{ margin: '0 0 8px', color: 'var(--ink-1)', fontSize: 'var(--text-sm)' }}>Pages</h3>
    {['Page 1', 'Page 2', 'Page 3'].map((p) => (
      <div
        key={p}
        style={{
          padding: '6px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'var(--ink-2)',
          fontSize: 'var(--text-sm)',
        }}
      >
        {p}
      </div>
    ))}
  </div>
);

const MainSlot = (
  <div
    style={{
      flex: 1,
      padding: '24px',
      color: 'var(--ink-2)',
      fontSize: 'var(--text-sm)',
    }}
  >
    <p>Main content area</p>
    <p>
      This is the primary workspace. It receives all remaining space after header, rail, drawer, and
      right panel are laid out.
    </p>
  </div>
);

const RightPanelSlot = (
  <div
    style={{
      width: '280px',
      height: '100%',
      background: 'var(--bg-page)',
      borderLeft: '1px solid var(--border-1)',
      padding: '16px',
    }}
  >
    <h3 style={{ margin: '0 0 8px', color: 'var(--ink-1)', fontSize: 'var(--text-sm)' }}>
      Properties
    </h3>
    <p style={{ color: 'var(--ink-3)', fontSize: '12px' }}>No selection</p>
  </div>
);

// ── Stories ───────────────────────────────────────────────────────────────────

/** Full shell with all slots populated. */
export const AllSlots: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppShell
        appId="demo"
        appDisplayName="pdomain-ui Demo"
        appIconUrl=""
        uiPrefsConfig={STUB_PREFS_CONFIG}
        header={HeaderSlot}
        rail={RailSlot}
        drawer={DrawerSlot}
        main={MainSlot}
        rightPanel={RightPanelSlot}
      />
    </div>
  ),
};

/** Main-only layout — no rail, drawer, or right panel. */
export const MainOnly: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppShell
        appId="demo"
        appDisplayName="pdomain-ui Demo"
        appIconUrl=""
        uiPrefsConfig={STUB_PREFS_CONFIG}
        header={HeaderSlot}
        main={MainSlot}
      />
    </div>
  ),
};

/** With deployMode='hosted' — shows what a hosted-mode shell looks like. */
export const HostedMode: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppShell
        appId="demo"
        appDisplayName="pdomain-ui Demo (hosted)"
        appIconUrl=""
        uiPrefsConfig={STUB_PREFS_CONFIG}
        deployMode="hosted"
        header={
          <div
            style={{
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '12px',
              background: 'var(--bg-raised)',
              borderBottom: '1px solid var(--border-1)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--ink-1)' }}>
              pdomain-ui Demo App [hosted]
            </span>
          </div>
        }
        main={MainSlot}
        rail={RailSlot}
      />
    </div>
  ),
};

/** Minimal — no slots beyond main. */
export const MinimalMain: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppShell
        appId="minimal"
        appDisplayName="Minimal"
        appIconUrl=""
        uiPrefsConfig={STUB_PREFS_CONFIG}
        main={
          <div style={{ padding: '24px', color: 'var(--ink-1)' }}>
            Just the main slot — no header, rail, drawer, or right panel.
          </div>
        }
      />
    </div>
  ),
};

/**
 * Built-in header — no custom `header` prop; AppShell renders icon + name +
 * settings gear automatically.
 */
export const BuiltInHeader: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppShell
        appId="demo-builtin"
        appDisplayName="pdomain-ui Demo App"
        appIconUrl=""
        uiPrefsConfig={STUB_PREFS_CONFIG}
        main={
          <div style={{ padding: '24px', color: 'var(--ink-1)' }}>
            <p>
              The header above is the built-in AppShellHeader (no custom <code>header</code> prop).
            </p>
            <p>Click the gear icon to open the settings popover.</p>
          </div>
        }
      />
    </div>
  ),
};
