import type { Meta, StoryObj } from '@storybook/react';
import { ComputeTargetPanel } from './ComputeTargetPanel.js';

const meta: Meta<typeof ComputeTargetPanel> = {
  title: 'Shell/ComputeTargetPanel',
  component: ComputeTargetPanel,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ComputeTargetPanel>;

const localInfo = {
  mode: 'local' as const,
  available: [
    { id: 'cpu', label: 'CPU' },
    { id: 'cuda:0', label: 'NVIDIA RTX 3090', vram_total_mb: 24576, vram_free_mb: 20000 },
  ],
  current: 'cpu',
  effective_source: 'auto',
};

export const LocalModeCPU: Story = {
  args: {
    info: localInfo,
    onSelect: () => {},
  },
};

export const LocalModeGPUActive: Story = {
  args: {
    info: { ...localInfo, current: 'cuda:0', effective_source: 'app' },
    onSelect: () => {},
  },
};

export const HiddenInHostedMode: Story = {
  args: {
    info: { mode: 'hosted', available: [], current: null, effective_source: null },
    onSelect: () => {},
  },
};
