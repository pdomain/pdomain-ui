import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { BlockingOperationOverlay } from './BlockingOperationOverlay.js';
import { OperationStatusPanel } from './OperationStatusPanel.js';
import { RetryActionPanel } from './RetryActionPanel.js';

const meta = {
  title: 'Status/OperationStatus',
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

export const Idle: Story = {
  args: {
    title: 'OCR idle',
    message: 'Select pages to start processing.',
    state: 'idle',
  },
};

export const Queued: Story = {
  args: {
    title: 'OCR queued',
    message: 'Waiting for the active import to finish.',
    state: 'queued',
    secondaryAction: (
      <Button type="button" variant="ghost" size="sm">
        Move up
      </Button>
    ),
  },
};

export const Running: Story = {
  args: {
    title: 'OCR running',
    message: 'Processing page 3.',
    state: 'running',
    progress: 45,
    details: '12 of 28 pages complete',
    primaryAction: (
      <Button type="button" size="sm">
        Open
      </Button>
    ),
  },
};

export const Success: Story = {
  args: {
    title: 'OCR complete',
    message: 'All selected pages were processed.',
    state: 'success',
    progress: 100,
    primaryAction: (
      <Button type="button" size="sm">
        Review output
      </Button>
    ),
  },
};

export const Warning: Story = {
  args: {
    title: 'OCR completed with warnings',
    message: 'Some pages have low confidence text.',
    state: 'warning',
    progress: 100,
    details: '4 pages need review before export.',
    primaryAction: (
      <Button type="button" size="sm">
        Review pages
      </Button>
    ),
  },
};

export const Error: Story = {
  args: {
    title: 'OCR failed',
    message: 'The worker timed out while processing page 18.',
    state: 'error',
    progress: 64,
    primaryAction: (
      <Button type="button" variant="danger" size="sm">
        Retry
      </Button>
    ),
  },
};

export const OverlayOpen: StoryObj<typeof BlockingOperationOverlay> = {
  render: () => (
    <BlockingOperationOverlay
      open
      title="Saving project"
      message="Writing OCR output and page metadata."
      progress={72}
      bestEffortCancel
      cancelAction={
        <Button type="button" variant="ghost" size="sm">
          Cancel
        </Button>
      }
    />
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const OverlayClosed: StoryObj<typeof BlockingOperationOverlay> = {
  render: () => <BlockingOperationOverlay open={false} message="Saving project" />,
};

export const Retry: StoryObj<typeof RetryActionPanel> = {
  render: () => (
    <RetryActionPanel
      title="OCR failed"
      message="The operation can be retried without losing completed pages."
      error="Timeout while waiting for the OCR worker."
      retryAction={
        <Button type="button" variant="danger" size="sm">
          Retry
        </Button>
      }
      detailsAction={
        <Button type="button" variant="ghost" size="sm">
          View details
        </Button>
      }
    />
  ),
};
