import type { Meta, StoryObj } from '@storybook/react';
import { SettingsAsyncSection } from './SettingsAsyncSection.js';

const meta: Meta<typeof SettingsAsyncSection> = {
  title: 'Settings/SettingsAsyncSection',
  component: SettingsAsyncSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    title: 'Models',
    state: 'loading',
    children: 'Ready body',
  },
};

export const Error: Story = {
  args: {
    title: 'Models',
    state: 'error',
    error: 'Failed',
    children: 'Ready body',
  },
};
