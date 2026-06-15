import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { RetryActionPanel } from './RetryActionPanel.js';

const meta = {
  title: 'Status/RetryActionPanel',
  component: RetryActionPanel,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RetryActionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'OCR failed',
    message: 'The operation can be retried without losing completed pages.',
    error: 'Timeout while waiting for the OCR worker.',
    retryAction: (
      <Button type="button" variant="danger" size="sm">
        Retry
      </Button>
    ),
    detailsAction: (
      <Button type="button" variant="ghost" size="sm">
        View details
      </Button>
    ),
  },
};
