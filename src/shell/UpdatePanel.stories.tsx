import type { Meta, StoryObj } from '@storybook/react';
import { UpdatePanel, UpdateBadge } from './UpdatePanel.js';
import { fn } from 'storybook/test';

const meta: Meta<typeof UpdatePanel> = {
  title: 'Shell/UpdatePanel',
  component: UpdatePanel,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof UpdatePanel>;

const updateAvailableInfo = {
  current: '0.9.0',
  latest: '0.10.0',
  update_available: true,
  changelog_url: 'https://example.com/changelog',
  channel: 'stable',
};

const upToDateInfo = {
  current: '0.10.0',
  latest: '0.10.0',
  update_available: false,
  changelog_url: 'https://example.com/changelog',
  channel: 'stable',
};

export const UpdateAvailable: Story = {
  args: {
    info: updateAvailableInfo,
    policy: 'notify',
    onPolicyChange: fn(),
    onApply: fn(),
  },
};

export const UpToDate: Story = {
  args: {
    info: upToDateInfo,
    policy: 'notify',
    onPolicyChange: fn(),
    onApply: fn(),
  },
};

export const ManualPolicy: Story = {
  args: {
    info: null,
    policy: 'manual',
    onPolicyChange: fn(),
    onApply: fn(),
  },
};

export const Badge: StoryObj<typeof UpdateBadge> = {
  render: () => <UpdateBadge available />,
};
