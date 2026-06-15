import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { OperationStatusPanel } from './OperationStatusPanel.js';

const meta = {
  title: 'Status/OperationStatusPanel',
  component: OperationStatusPanel,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'queued', 'running', 'success', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof OperationStatusPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: {
    title: 'OCR running',
    message: 'Processing page 3.',
    state: 'running',
    progress: 45,
    primaryAction: (
      <Button type="button" size="sm">
        Open
      </Button>
    ),
  },
};
