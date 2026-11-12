import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { TabsBand } from './TabsBand.js';
import type { TabsBandItem } from './TabsBand.js';

const meta: Meta<typeof TabsBand> = {
  title: 'Templates/TabsBand',
  component: TabsBand,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TabsBand>;

// Canonical tab set matching the design source (pipeline-template.jsx STAGE_TABS)
const PIPELINE_TABS: TabsBandItem[] = [
  { id: 'overview', name: 'Overview' },
  { id: 'pages', name: 'Pages', count: 47 },
  { id: 'workbench', name: 'Page workbench' },
  { id: 'settings', name: 'Stage settings' },
];

// ─── DCArtboard: D · TabsBand · default (dark) ─────────────────────────────
// Source: final/pipeline/pipeline-template.jsx — TabsBand component
// Used in PipelineTemplate as the per-stage tab strip.

export const Default: Story = {
  name: 'D · Default (dark)',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('pages');
    return (
      <div style={{ width: '100%' }}>
        <TabsBand items={PIPELINE_TABS} current={current} onTabChange={setCurrent} />
      </div>
    );
  },
};

// ─── DCArtboard: D · TabsBand · first tab active ────────────────────────────

export const OverviewActive: Story = {
  name: 'D · Overview tab active',
  render: () => <TabsBand items={PIPELINE_TABS} current="overview" />,
};

// ─── DCArtboard: D · TabsBand · with rightSlot ──────────────────────────────

export const WithRightSlot: Story = {
  name: 'D · With rightSlot',
  render: () => (
    <TabsBand
      items={PIPELINE_TABS}
      current="pages"
      rightSlot={
        <button
          type="button"
          style={{
            padding: '4px 10px',
            fontSize: 11,
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-2)',
            borderRadius: 4,
            color: 'var(--ink-2)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Filter
        </button>
      }
    />
  ),
};

// ─── DCArtboard: D · TabsBand · sticky (layout demo) ────────────────────────

export const StickyBand: Story = {
  name: 'D · Sticky (scroll demo)',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div style={{ height: 300, overflowY: 'auto', position: 'relative' }}>
      <div
        style={{
          height: 80,
          background: 'var(--bg-raised)',
          borderBottom: '1px solid var(--border-1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          color: 'var(--ink-2)',
          fontSize: 12,
        }}
      >
        Project info band (scroll down)
      </div>
      <TabsBand items={PIPELINE_TABS} current="pages" sticky />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 48,
              border: '1px solid var(--border-1)',
              borderRadius: 6,
              background: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              color: 'var(--ink-3)',
              fontSize: 12,
            }}
          >
            Content row {i + 1}
          </div>
        ))}
      </div>
    </div>
  ),
};

// ─── DCArtboard: D · TabsBand · no counts ────────────────────────────────────

export const NoCounts: Story = {
  name: 'D · No count badges',
  render: () => (
    <TabsBand
      items={[
        { id: 'overview', name: 'Overview' },
        { id: 'pages', name: 'Pages' },
        { id: 'settings', name: 'Settings' },
      ]}
      current="overview"
    />
  ),
};

// ─── DCArtboard: L · TabsBand · light theme ──────────────────────────────────

export const LightTheme: Story = {
  name: 'L · Light theme',
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
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [current, setCurrent] = React.useState('pages');
    return <TabsBand items={PIPELINE_TABS} current={current} onTabChange={setCurrent} />;
  },
};
