import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { GuidancePanel } from './GuidancePanel.js';

const meta: Meta<typeof GuidancePanel> = {
  title: 'Settings/GuidancePanel',
  component: GuidancePanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <GuidancePanel
      title="CUDA setup"
      tone="info"
      actions={
        <Button type="button" size="sm" variant="ghost">
          Open docs
        </Button>
      }
    >
      Install matching drivers before enabling GPU-backed OCR.
    </GuidancePanel>
  ),
};
