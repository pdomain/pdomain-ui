import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { BlockingOperationOverlay } from './BlockingOperationOverlay.js';

const meta = {
  title: 'Status/BlockingOperationOverlay',
  component: BlockingOperationOverlay,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BlockingOperationOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    title: 'Saving project',
    message: 'Writing OCR output and page metadata.',
    progress: 72,
    bestEffortCancel: true,
    cancelAction: (
      <Button type="button" variant="ghost" size="sm">
        Cancel
      </Button>
    ),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    message: 'Saving project',
  },
};
