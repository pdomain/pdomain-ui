import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Segmented } from './Segmented.js';

const meta: Meta<typeof Segmented> = {
  title: 'Primitives/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Segmented>;

// ─── DCArtboard: D · Segmented · text-only 2-option (Seg2 pattern) ───────────
// Source: wf11/wf11-variations.jsx and wf-pw/wf-pw-variations.jsx — Seg2 component
// Used for binary mode pickers (e.g. Standard / Perceptual grayscale mode).

export const TwoOptionDefault: Story = {
  name: 'D · Seg2 · text-only 2-option',
  render: () => (
    <Segmented
      options={[
        { value: 'standard', label: 'Standard' },
        { value: 'perceptual', label: 'Perceptual' },
      ]}
      defaultValue="perceptual"
    />
  ),
};

// ─── DCArtboard: D · Segmented · text-only 3-option (SegTiny/mono pattern) ──
// Source: wf01/variations.jsx — SegTiny component
// Used for file-format or size selection (JP2 · JPG · PDF).

export const ThreeOptionMono: Story = {
  name: 'D · SegTiny · 3-option monospace',
  render: () => (
    <Segmented
      options={[
        { value: 'jp2', label: 'JP2 (2.0 GB)' },
        { value: 'jpg', label: 'JPG (430 MB)' },
        { value: 'pdf', label: 'PDF (610 MB)' },
      ]}
      defaultValue="jp2"
    />
  ),
};

// ─── DCArtboard: D · Segmented · 4-option with icons (ModalD pattern) ───────
// Source: wf01/variations.jsx — ModalD inline segmented tabs
// Used for source-type pickers (Zip · Folder · Local path · IA/URL).

export const FourOptionWithIcons: Story = {
  name: 'D · ModalD · 4-option full-width with icons',
  render: () => (
    <div style={{ width: 556 }}>
      <Segmented
        options={[
          { value: 'zip', label: 'Zip' },
          { value: 'folder', label: 'Folder' },
          { value: 'local', label: 'Local path' },
          { value: 'url', label: 'IA / URL' },
        ]}
        defaultValue="folder"
        size="md"
        full
      />
    </div>
  ),
};

// ─── DCArtboard: D · Segmented · controlled ──────────────────────────────────

export const Controlled: Story = {
  name: 'D · Controlled',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [value, setValue] = React.useState('b');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Segmented
          options={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
            { value: 'c', label: 'Gamma' },
          ]}
          value={value}
          onChange={setValue}
        />
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          Active: <strong style={{ color: 'var(--ink-1)' }}>{value}</strong>
        </div>
      </div>
    );
  },
};

// ─── DCArtboard: D · Segmented · size variants ───────────────────────────────

export const SizeVariants: Story = {
  name: 'D · Size variants (sm / md)',
  render: () => {
    const opts = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', width: 28 }}>sm</span>
          <Segmented options={opts} defaultValue="a" size="sm" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', width: 28 }}>md</span>
          <Segmented options={opts} defaultValue="a" size="md" />
        </div>
      </div>
    );
  },
};

// ─── DCArtboard: D · Segmented · light theme ─────────────────────────────────

export const LightTheme: Story = {
  name: 'D · Light theme',
  parameters: {
    backgrounds: { default: 'light' },
  },
  decorators: [
    (Story) => (
      <div data-theme="light">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Segmented
      options={[
        { value: 'standard', label: 'Standard' },
        { value: 'perceptual', label: 'Perceptual' },
      ]}
      defaultValue="standard"
    />
  ),
};
