import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { WordList } from './WordList.js';
import { StatusPip } from '../primitives/StatusPip.js';
import type { WordListItem, WordRowProps, MatchStatus } from './types.js';

// ── Fixture data ──────────────────────────────────────────────────────────────

function makeWord(text: string, confidence: number): WordListItem {
  return {
    text,
    ocr_confidence: confidence,
    bounding_box: {
      top_left: { x: 0, y: 0 },
      bottom_right: { x: 100, y: 20 },
    },
  };
}

const SMALL_WORDS: WordListItem[] = [
  makeWord('Hello', 0.99),
  makeWord('world', 0.95),
  makeWord('from', 0.88),
  makeWord('Storybook', 0.82),
  makeWord('rendering', 0.75),
  makeWord('ambiguous', 0.45),
  makeWord('unclear', 0.3),
];

const LARGE_WORDS: WordListItem[] = Array.from({ length: 200 }, (_, i) =>
  makeWord(`word-${i.toString().padStart(3, '0')}`, Math.random()),
);

function statusForConfidence(c: number | null | undefined): MatchStatus {
  if (c == null) return 'none';
  if (c >= 0.9) return 'exact';
  if (c >= 0.7) return 'fuzzy';
  return 'mismatch';
}

// ── Custom row renderer ───────────────────────────────────────────────────────

function CustomRow({ item, isSelected, matchStatus }: WordRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        background: isSelected
          ? 'color-mix(in srgb, var(--accent) 15%, var(--bg-raised))'
          : 'transparent',
        fontFamily: 'var(--mono-font)',
        fontSize: 'var(--text-sm)',
        color: 'var(--ink-1)',
        cursor: 'pointer',
      }}
    >
      <StatusPip status={matchStatus === 'none' ? 'ocr' : matchStatus} />
      <span>{item.text}</span>
      {item.ocr_confidence != null && (
        <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: '11px' }}>
          {(item.ocr_confidence * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof WordList> = {
  title: 'WordList/WordList',
  component: WordList,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Default row renderer with a small word list. */
export const Default: Story = {
  args: {
    items: SMALL_WORDS,
    'aria-label': 'Demo word list',
  },
};

/** Custom row renderer showing status pip and confidence. */
export const CustomRowRenderer: Story = {
  render: () => (
    <div style={{ width: '320px', height: '300px', background: 'var(--bg-raised)' }}>
      <WordList
        items={SMALL_WORDS}
        getMatchStatus={(w) => statusForConfidence(w.ocr_confidence)}
        renderRow={(p) => <CustomRow {...p} />}
        aria-label="Word list with custom rows"
      />
    </div>
  ),
};

/** Large list to demonstrate virtualization (200 rows). */
export const VirtualizedLargeList: Story = {
  render: () => (
    <div style={{ width: '320px', height: '400px', background: 'var(--bg-raised)' }}>
      <WordList
        items={LARGE_WORDS}
        getMatchStatus={(w) => statusForConfidence(w.ocr_confidence)}
        renderRow={(p) => <CustomRow {...p} />}
        aria-label="Large virtualized word list"
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
        <div style={{ height: '300px', background: 'var(--bg-raised)', marginBottom: '8px' }}>
          <WordList
            items={SMALL_WORDS}
            selectedIndex={selected}
            onSelect={setSelected}
            getMatchStatus={(w) => statusForConfidence(w.ocr_confidence)}
            renderRow={(p) => <CustomRow {...p} />}
            aria-label="Controlled word list"
          />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
          Selected index: {selected ?? 'none'} —{' '}
          {selected != null ? `"${SMALL_WORDS[selected]?.text ?? ''}"` : '(none)'}
        </div>
      </div>
    );
  },
};
