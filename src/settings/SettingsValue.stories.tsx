import type { Meta, StoryObj } from '@storybook/react';
import { SettingsValue } from './SettingsValue.js';

const meta: Meta<typeof SettingsValue> = {
  title: 'Settings/SettingsValue',
  component: SettingsValue,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'eng',
    tone: 'neutral',
  },
};

export const Mono: Story = {
  args: {
    children: '/var/tmp/pdomain/jobs',
    mono: true,
  },
};
