/**
 * Stories for <PageList> — virtualized page review panel.
 *
 * PageList is a public API component (src/worklist/index.ts exports it).
 * These stories demonstrate the default row renderer, custom renderRow
 * render-prop, controlled selection, null-name pages, and the empty state.
 */

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PageList } from './PageList.js';
import type { PageListItem, PageRowProps } from './types.js';

// ── Fixture data ──────────────────────────────────────────────────────────────

const SAMPLE_PAGES: PageListItem[] = [
  { page_index: 0, name: 'Cover', width: 800, height: 1200 },
  { page_index: 1, name: 'Title page', width: 800, height: 1200 },
  { page_index: 2, name: null, width: 800, height: 1200 },
  { page_index: 3, name: 'Chapter I', width: 800, height: 1200 },
  { page_index: 4, name: null, width: 800, height: 1200 },
  { page_index: 5, name: 'Chapter II', width: 800, height: 1200 },
];

const LARGE_PAGES: PageListItem[] = Array.from({ length: 200 }, (_, i) => ({
  page_index: i,
  name: i % 20 === 0 ? `Chapter ${Math.floor(i / 20) + 1}` : null,
  width: 800,
  height: 1200,
}));

// ── Custom row renderer ───────────────────────────────────────────────────────

function CustomPageRow({ item, index, isSelected }: PageRowProps) {
  const label = item.name ?? `Page ${(item.page_index ?? index) + 1}`;
  const isChapter = item.name != null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isChapter ? '6px 8px' : '4px 8px',
        background: isSelected
          ? 'color-mix(in srgb, var(--accent) 15%, var(--bg-raised))'
          : 'transparent',
        fontSize: isChapter ? 'var(--text-sm)' : 'var(--text-xs)',
        fontWeight: isChapter ? 600 : 400,
        color: isSelected ? 'var(--ink-1)' : isChapter ? 'var(--ink-1)' : 'var(--ink-2)',
        borderLeft: isChapter ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--mono-font)',
          fontSize: '10px',
          color: 'var(--ink-3)',
          minWidth: '28px',
        }}
      >
        {(item.page_index ?? index) + 1}
      </span>
      <span>{label}</span>
    </div>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof PageList> = {
  title: 'WordList/PageList',
  component: PageList,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Default row renderer — uses page name or fallback "Page N". */
export const Default: Story = {
  args: {
    items: SAMPLE_PAGES,
    'aria-label': 'Demo page list',
  },
};

/** Custom row renderer with chapter headings and page-number column. */
export const CustomRowRenderer: Story = {
  render: () => (
    <div style={{ width: '260px', height: '300px', background: 'var(--bg-raised)' }}>
      <PageList
        items={SAMPLE_PAGES}
        renderRow={(p) => <CustomPageRow {...p} />}
        aria-label="Page list with custom rows"
      />
    </div>
  ),
};

/** Large list to demonstrate virtualization (200 pages). */
export const VirtualizedLargeList: Story = {
  render: () => (
    <div style={{ width: '260px', height: '400px', background: 'var(--bg-raised)' }}>
      <PageList
        items={LARGE_PAGES}
        renderRow={(p) => <CustomPageRow {...p} />}
        aria-label="Large virtualized page list"
      />
    </div>
  ),
};

/** Controlled selection with external state. */
export const ControlledSelection: Story = {
  render: function ControlledSelectionStory() {
    const [selected, setSelected] = useState<number | null>(0);

    return (
      <div style={{ width: '260px' }}>
        <div style={{ height: '280px', background: 'var(--bg-raised)', marginBottom: '8px' }}>
          <PageList
            items={SAMPLE_PAGES}
            selectedIndex={selected}
            onSelect={setSelected}
            renderRow={(p) => <CustomPageRow {...p} />}
            aria-label="Controlled page list"
          />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
          Selected index: {selected ?? 'none'} —{' '}
          {selected != null
            ? `"${SAMPLE_PAGES[selected]?.name ?? `Page ${(SAMPLE_PAGES[selected]?.page_index ?? selected) + 1}`}"`
            : '(none)'}
        </div>
      </div>
    );
  },
};

/** Pages without names — fallback label "Page N" via page_index. */
export const UnnamedPages: Story = {
  args: {
    items: Array.from({ length: 5 }, (_, i) => ({
      page_index: i,
      name: null,
      width: 800,
      height: 1200,
    })) satisfies PageListItem[],
    'aria-label': 'Unnamed page list',
  },
};

/** Empty list — renders without error. */
export const Empty: Story = {
  args: {
    items: [],
    'aria-label': 'Empty page list',
  },
};
