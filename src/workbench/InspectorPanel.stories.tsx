import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { InspectorPanel } from './InspectorPanel.js';

const meta: Meta<typeof InspectorPanel> = {
  title: 'Workbench/InspectorPanel',
  component: InspectorPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Inspector',
    meta: 'Page 001',
    actions: (
      <Button variant="ghost" size="sm">
        Save
      </Button>
    ),
    children: (
      <div style={{ display: 'grid', gap: 8 }}>
        <span>Role: body</span>
        <span>Rotation: 0 degrees</span>
        <span>DPI: 300</span>
      </div>
    ),
    footer: (
      <Button variant="primary" size="sm">
        Apply
      </Button>
    ),
  },
};
