/**
 * Stories for <LineList> — virtualized block/line review panel.
 *
 * LineList is a public API component (src/worklist/index.ts exports it).
 * These stories demonstrate the default row renderer, custom renderRow
 * render-prop, controlled selection, and the empty state.
 */

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LineList } from './LineList.js';
import type { BlockListItem, BlockRowProps } from './types.js';

// ── Fixture data ──────────────────────────────────────────────────────────────

const SAMPLE_BLOCKS: BlockListItem[] = [
  {
    block_category: 'LINE',
    bounding_box: { top_left: { x: 0, y: 0 }, bottom_right: { x: 400, y: 20 } },
  },
  {
    block_category: 'LINE',
    bounding_box: { top_left: { x: 0, y: 25 }, bottom_right: { x: 400, y: 45 } },
  },
  {
    block_category: 'PARAGRAPH',
    bounding_box: { top_left: { x: 0, y: 50 }, bottom_right: { x: 400, y: 90 } },
  },
  {
    block_category: 'LINE',
    bounding_box: { top_left: { x: 0, y: 95 }, bottom_right: { x: 400, y: 115 } },
  },
  {
    block_category: 'LINE',
    bounding_box: { top_left: { x: 0, y: 120 }, bottom_right: { x: 400, y: 140 } },
  },
  {
    block_category: 'PARAGRAPH',
    bounding_box: { top_left: { x: 0, y: 145 }, bottom_right: { x: 400, y: 185 } },
  },
];

const LARGE_BLOCKS: BlockListItem[] = Array.from({ length: 150 }, (_, i) => ({
  block_category: i % 3 === 0 ? ('PARAGRAPH' as const) : ('LINE' as const),
  bounding_box: {
    top_left: { x: 0, y: i * 22 },
    bottom_right: { x: 400, y: i * 22 + 20 },
  },
}));

// ── Custom row renderer ───────────────────────────────────────────────────────

function CustomBlockRow({ item, index, isSelected }: BlockRowProps) {
  const isParagraph = item.block_category === 'PARAGRAPH';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isParagraph ? '6px 8px' : '4px 8px 4px 20px',
        background: isSelected
          ? 'color-mix(in srgb, var(--accent) 15%, var(--bg-raised))'
          : 'transparent',
        fontSize: isParagraph ? 'var(--text-sm)' : 'var(--text-xs)',
        fontWeight: isParagraph ? 600 : 400,
        color: 'var(--ink-1)',
        borderLeft: isParagraph ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer',
      }}
    >
      <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono-font)', fontSize: '10px' }}>
        {item.block_category ?? 'BLOCK'}
      </span>
      <span>Block {index + 1}</span>
    </div>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof LineList> = {
  title: 'WordList/LineList',
  component: LineList,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Default row renderer showing block_category labels. */
export const Default: Story = {
  args: {
    items: SAMPLE_BLOCKS,
    'aria-label': 'Demo line list',
  },
};

/** Custom row renderer with indentation for LINE vs PARAGRAPH blocks. */
export const CustomRowRenderer: Story = {
  render: () => (
    <div style={{ width: '320px', height: '300px', background: 'var(--bg-raised)' }}>
      <LineList
        items={SAMPLE_BLOCKS}
        renderRow={(p) => <CustomBlockRow {...p} />}
        aria-label="Line list with custom rows"
      />
    </div>
  ),
};

/** Large list to demonstrate virtualization (150 blocks). */
export const VirtualizedLargeList: Story = {
  render: () => (
    <div style={{ width: '320px', height: '400px', background: 'var(--bg-raised)' }}>
      <LineList
        items={LARGE_BLOCKS}
        renderRow={(p) => <CustomBlockRow {...p} />}
        aria-label="Large virtualized line list"
      />
    </div>
  ),
};

/** Controlled selection with external state. */
export const ControlledSelection: Story = {
  render: function ControlledSelectionStory() {
    const [selected, setSelected] = useState<number | null>(0);

    return (
      <div style={{ width: '320px' }}>
        <div style={{ height: '280px', background: 'var(--bg-raised)', marginBottom: '8px' }}>
          <LineList
            items={SAMPLE_BLOCKS}
            selectedIndex={selected}
            onSelect={setSelected}
            renderRow={(p) => <CustomBlockRow {...p} />}
            aria-label="Controlled line list"
          />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
          Selected index: {selected ?? 'none'} —{' '}
          {selected != null ? `"${SAMPLE_BLOCKS[selected]?.block_category ?? 'BLOCK'}"` : '(none)'}
        </div>
      </div>
    );
  },
};

/** Empty list — renders without error. */
export const Empty: Story = {
  args: {
    items: [],
    'aria-label': 'Empty line list',
  },
};
