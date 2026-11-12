import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { SettingsNav, PROJECT_SETTINGS_GROUPS } from './SettingsNav.js';
import type { SettingsNavGroup } from './SettingsNav.js';

const meta: Meta<typeof SettingsNav> = {
  title: 'Templates/SettingsNav',
  component: SettingsNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsNav>;

// Wrapper to give the nav a realistic sidebar width + background
const SidebarWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: 240,
      minHeight: 400,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-1)',
      padding: '14px 12px',
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// D · Default 8-item layout (dark)
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'D · Default 8-item layout (dark)',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('general');
    return (
      <SidebarWrapper>
        <SettingsNav
          groups={PROJECT_SETTINGS_GROUPS}
          currentGroup={current}
          onGroupChange={setCurrent}
          label="Project settings"
        />
      </SidebarWrapper>
    );
  },
};

// ---------------------------------------------------------------------------
// D · Danger zone active (dark)
// ---------------------------------------------------------------------------

export const DangerActive: Story = {
  name: 'D · Danger zone active',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('danger');
    return (
      <SidebarWrapper>
        <SettingsNav
          groups={PROJECT_SETTINGS_GROUPS}
          currentGroup={current}
          onGroupChange={setCurrent}
          label="Project settings"
        />
      </SidebarWrapper>
    );
  },
};

// ---------------------------------------------------------------------------
// D · Custom groups (user-account settings in another SPA)
// ---------------------------------------------------------------------------

const ACCOUNT_GROUPS: SettingsNavGroup[] = [
  { id: 'profile', name: 'Profile', icon: 'image' },
  { id: 'security', name: 'Security', icon: 'wrench' },
  { id: 'billing', name: 'Billing', icon: 'hardDrive' },
  { id: 'tokens', name: 'API tokens', icon: 'file' },
  { id: 'danger', name: 'Delete account', icon: 'trash', danger: true },
];

export const CustomGroups: Story = {
  name: 'D · Custom groups (account settings)',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('profile');
    return (
      <SidebarWrapper>
        <SettingsNav
          groups={ACCOUNT_GROUPS}
          currentGroup={current}
          onGroupChange={setCurrent}
          label="Account settings"
        />
      </SidebarWrapper>
    );
  },
};

// ---------------------------------------------------------------------------
// D · No label (no heading, minimal layout)
// ---------------------------------------------------------------------------

export const NoLabel: Story = {
  name: 'D · No label prop',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('general');
    return (
      <SidebarWrapper>
        <SettingsNav
          groups={PROJECT_SETTINGS_GROUPS}
          currentGroup={current}
          onGroupChange={setCurrent}
        />
      </SidebarWrapper>
    );
  },
};

// ---------------------------------------------------------------------------
// L · Light theme — default 8-item layout
// ---------------------------------------------------------------------------

export const LightTheme: Story = {
  name: 'L · Default 8-item layout (light)',
  parameters: {
    backgrounds: { default: 'light' },
  },
  decorators: [
    (Story) => (
      <div data-theme="light">
        <Story />
      </div>
    ),
  ],
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('general');
    return (
      <SidebarWrapper>
        <SettingsNav
          groups={PROJECT_SETTINGS_GROUPS}
          currentGroup={current}
          onGroupChange={setCurrent}
          label="Project settings"
        />
      </SidebarWrapper>
    );
  },
};

// ---------------------------------------------------------------------------
// L · Light theme — danger zone active
// ---------------------------------------------------------------------------

export const LightDangerActive: Story = {
  name: 'L · Danger zone active (light)',
  parameters: {
    backgrounds: { default: 'light' },
  },
  decorators: [
    (Story) => (
      <div data-theme="light">
        <Story />
      </div>
    ),
  ],
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('danger');
    return (
      <SidebarWrapper>
        <SettingsNav
          groups={PROJECT_SETTINGS_GROUPS}
          currentGroup={current}
          onGroupChange={setCurrent}
          label="Project settings"
        />
      </SidebarWrapper>
    );
  },
};
