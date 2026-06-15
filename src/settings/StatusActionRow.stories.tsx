import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { StatusActionRow } from './StatusActionRow.js';

const meta: Meta<typeof StatusActionRow> = {
  title: 'Settings/StatusActionRow',
  component: StatusActionRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StatusActionRow
      label="Cache"
      description="Shared model cache status"
      status="Ready"
      action={
        <Button type="button" size="sm" variant="secondary">
          Refresh
        </Button>
      }
    />
  ),
};
