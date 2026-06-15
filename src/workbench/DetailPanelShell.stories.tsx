import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { DetailPanelShell } from './DetailPanelShell.js';

const meta: Meta<typeof DetailPanelShell> = {
  title: 'Workbench/DetailPanelShell',
  component: DetailPanelShell,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Page detail',
    meta: '300 dpi',
    actions: (
      <Button variant="ghost" size="sm">
        Open
      </Button>
    ),
    children: (
      <div style={{ display: 'grid', gap: 8 }}>
        <span>Text layer: ready</span>
        <span>Image layer: loaded</span>
        <span>Flags: none</span>
      </div>
    ),
    footer: (
      <Button variant="primary" size="sm">
        Review
      </Button>
    ),
  },
};
