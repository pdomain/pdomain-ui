import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { SettingsCard } from './SettingsCard.js';
import { SettingsRow } from './SettingsRow.js';
import { SettingsValue } from './SettingsValue.js';

const meta: Meta<typeof SettingsCard> = {
  title: 'Settings/SettingsCard',
  component: SettingsCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SettingsCard
      title="OCR"
      description="OCR settings"
      actions={
        <Button type="button" size="sm" variant="outline">
          Reset
        </Button>
      }
    >
      <SettingsRow label="Language" value={<SettingsValue>eng</SettingsValue>} />
    </SettingsCard>
  ),
};
