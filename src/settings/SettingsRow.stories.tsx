import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { SettingsRow } from './SettingsRow.js';
import { SettingsValue } from './SettingsValue.js';

const meta: Meta<typeof SettingsRow> = {
  title: 'Settings/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SettingsRow
      label="Language"
      description="OCR language"
      value={<SettingsValue mono>eng</SettingsValue>}
      actions={
        <Button type="button" size="sm" variant="secondary">
          Change
        </Button>
      }
    />
  ),
};
