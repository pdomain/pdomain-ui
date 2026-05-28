/**
 * Tests for <WordList> (M6.2, issue #151).
 *
 * Verifies:
 * - render with fixture words
 * - render-prop slot injection (custom row content)
 * - keyboard navigation (ArrowDown, ArrowUp, Enter)
 * - controlled selection via selectedIndex/onSelect
 * - default plain-text row when renderRow is omitted
 *
 * react-virtuoso is mocked (jsdom has no layout engine; Virtuoso renders
 * nothing in jsdom). The mock renders all items directly so tests can
 * assert on content.
 */

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock react-virtuoso before importing WordList
vi.mock('react-virtuoso', () => ({
  Virtuoso: <TData,>({
    data,
    itemContent,
  }: {
    data?: TData[];
    itemContent?: (index: number, item: TData) => React.ReactNode;
  }) => (
    <div data-testid="virtuoso-mock">
      {(data ?? []).map((item, index) => (
        <div key={index}>{itemContent?.(index, item)}</div>
      ))}
    </div>
  ),
}));

import { WordList } from './WordList';
import type { WordListItem, WordRowProps } from './types';

// ── fixture ───────────────────────────────────────────────────────────────────

function makeWord(text: string, idx: number): WordListItem {
  return {
    text,
    ocr_confidence: 0.9,
    bounding_box: {
      top_left: { x: idx * 10, y: 0 },
      bottom_right: { x: idx * 10 + 8, y: 12 },
    },
  };
}

const THREE_WORDS: WordListItem[] = [
  makeWord('alpha', 0),
  makeWord('beta', 1),
  makeWord('gamma', 2),
];

// 200 words for large-list render check
const TWO_HUNDRED: WordListItem[] = Array.from({ length: 200 }, (_, i) => makeWord(`word-${i}`, i));

// ── rendering ─────────────────────────────────────────────────────────────────

describe('<WordList>', () => {
  it('renders with default plain-text rows', () => {
    render(<WordList items={THREE_WORDS} />);
    expect(screen.getByText('alpha')).toBeDefined();
    expect(screen.getByText('beta')).toBeDefined();
    expect(screen.getByText('gamma')).toBeDefined();
  });

  it('renders with custom renderRow', () => {
    render(
      <WordList
        items={THREE_WORDS}
        renderRow={(p: WordRowProps<WordListItem>) => (
          <span key={p.index} data-testid={`row-${p.index}`} className="custom-row">
            CUSTOM:{p.item.text}
          </span>
        )}
      />,
    );
    expect(screen.getByText('CUSTOM:alpha')).toBeDefined();
    expect(screen.getByText('CUSTOM:beta')).toBeDefined();
  });

  it('passes isSelected=true for the selected index', () => {
    render(
      <WordList
        items={THREE_WORDS}
        selectedIndex={1}
        renderRow={(p: WordRowProps<WordListItem>) => (
          <span key={p.index} data-testid={`sel-${p.index}`}>
            {p.isSelected ? 'SELECTED' : 'NOT'}:{p.item.text}
          </span>
        )}
      />,
    );
    expect(screen.getByText('SELECTED:beta')).toBeDefined();
    expect(screen.getByText('NOT:alpha')).toBeDefined();
    expect(screen.getByText('NOT:gamma')).toBeDefined();
  });

  it('renders the list container with correct role', () => {
    render(<WordList items={THREE_WORDS} aria-label="Test word list" />);
    const list = screen.getByRole('listbox', { name: 'Test word list' });
    expect(list).toBeDefined();
  });

  it('applies className to outer container', () => {
    const { container } = render(<WordList items={THREE_WORDS} className="my-custom-class" />);
    const outer = container.firstElementChild;
    expect(outer?.className).toContain('my-custom-class');
  });

  it('renders empty list without error', () => {
    render(<WordList items={[]} />);
    const list = screen.getByRole('listbox');
    expect(list).toBeDefined();
  });

  it('passes matchStatus from getMatchStatus to renderRow', () => {
    render(
      <WordList
        items={THREE_WORDS}
        getMatchStatus={(item) => (item.text === 'beta' ? 'fuzzy' : 'exact')}
        renderRow={(p: WordRowProps<WordListItem>) => (
          <span key={p.index} data-testid={`ms-${p.index}`}>
            {p.matchStatus}:{p.item.text}
          </span>
        )}
      />,
    );
    expect(screen.getByText('exact:alpha')).toBeDefined();
    expect(screen.getByText('fuzzy:beta')).toBeDefined();
    expect(screen.getByText('exact:gamma')).toBeDefined();
  });
});

// ── keyboard navigation ───────────────────────────────────────────────────────

describe('<WordList> keyboard navigation', () => {
  it('calls onSelect with 0 when ArrowDown pressed with no selection', () => {
    const onSelect = vi.fn();
    render(<WordList items={THREE_WORDS} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('calls onSelect with next index on ArrowDown', () => {
    const onSelect = vi.fn();
    render(<WordList items={THREE_WORDS} selectedIndex={0} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('does not exceed last index on ArrowDown', () => {
    const onSelect = vi.fn();
    render(<WordList items={THREE_WORDS} selectedIndex={2} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onSelect with prev index on ArrowUp', () => {
    const onSelect = vi.fn();
    render(<WordList items={THREE_WORDS} selectedIndex={1} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowUp' });
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('does not go below 0 on ArrowUp', () => {
    const onSelect = vi.fn();
    render(<WordList items={THREE_WORDS} selectedIndex={0} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowUp' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onSelect on Enter for currently selected item', () => {
    const onSelect = vi.fn();
    render(<WordList items={THREE_WORDS} selectedIndex={1} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

// ── large list ────────────────────────────────────────────────────────────────

describe('<WordList> 200-item list', () => {
  it('renders without crash with 200 items', () => {
    render(<WordList items={TWO_HUNDRED} />);
    const list = screen.getByRole('listbox');
    expect(list).toBeDefined();
    expect(screen.getByText('word-0')).toBeDefined();
    expect(screen.getByText('word-199')).toBeDefined();
  });
});

// ── filter / out-of-range index clamping (issue #39) ─────────────────────────

describe('<WordList> filter-clamping (issue #39)', () => {
  it('does not fire onSelect on Enter when controlled selectedIndex is out-of-range after filter narrows list', () => {
    const onSelect = vi.fn();
    // Start with 3 words and selectedIndex=2 (valid), then narrow to 1 item
    const { rerender } = render(
      <WordList items={THREE_WORDS} selectedIndex={2} onSelect={onSelect} />,
    );
    // Narrow list to 1 item — selectedIndex=2 is now out of range
    rerender(<WordList items={[THREE_WORDS[0]!]} selectedIndex={2} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    // Enter must NOT call onSelect with an out-of-range index
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clamps internal index when items shrink in uncontrolled mode', () => {
    const onSelect = vi.fn();
    // Uncontrolled: user navigates to index 2, then list shrinks to 1 item
    const { rerender } = render(<WordList items={THREE_WORDS} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    // Navigate to last item (index 2) via ArrowDown twice
    fireEvent.keyDown(list, { key: 'ArrowDown' }); // 0
    fireEvent.keyDown(list, { key: 'ArrowDown' }); // 1
    fireEvent.keyDown(list, { key: 'ArrowDown' }); // 2
    onSelect.mockClear();

    // Narrow list to 1 item — internal index 2 is now out of range
    rerender(<WordList items={[THREE_WORDS[0]!]} onSelect={onSelect} />);

    // Enter should call onSelect with a clamped valid index (0) or not call at all —
    // either is acceptable; what must NOT happen is calling with index >= items.length
    fireEvent.keyDown(list, { key: 'Enter' });
    if (onSelect.mock.calls.length > 0) {
      const firstCall = onSelect.mock.calls[0] as [number];
      expect(firstCall[0]).toBeLessThan(1); // items.length is 1, so valid range is [0, 0]
    }
  });

  it('does not fire onSelect on Enter when filtered list is empty', () => {
    const onSelect = vi.fn();
    render(<WordList items={[]} selectedIndex={0} onSelect={onSelect} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});

// ── emptySlot (WS5) ────────────────────────────────────────────────────────────

describe('<WordList> emptySlot (WS5)', () => {
  it('renders emptySlot when items is empty', () => {
    render(<WordList items={[]} emptySlot={<div data-testid="empty-state">No words found</div>} />);
    expect(screen.getByTestId('empty-state')).toBeTruthy();
  });

  it('does not render emptySlot when items are present', () => {
    render(
      <WordList
        items={THREE_WORDS}
        emptySlot={<div data-testid="empty-state">No words found</div>}
      />,
    );
    expect(screen.queryByTestId('empty-state')).toBeNull();
  });
});

// ── aria-activedescendant + roving tabIndex (WS6) ────────────────────────────

describe('<WordList> ARIA activedescendant + roving tabIndex (WS6)', () => {
  it('sets aria-activedescendant on listbox when an item is selected', () => {
    render(<WordList items={THREE_WORDS} selectedIndex={1} />);
    const list = screen.getByRole('listbox');
    const activeDescendant = list.getAttribute('aria-activedescendant');
    expect(activeDescendant).toBeTruthy();
    // The referenced element must exist in the DOM
    const activeEl = document.getElementById(activeDescendant!);
    expect(activeEl).toBeTruthy();
  });

  it('does not set aria-activedescendant when nothing is selected', () => {
    render(<WordList items={THREE_WORDS} selectedIndex={null} />);
    const list = screen.getByRole('listbox');
    expect(list.getAttribute('aria-activedescendant')).toBeFalsy();
  });

  it('only the selected row has tabIndex=0; others have tabIndex=-1 (roving focus)', () => {
    render(<WordList items={THREE_WORDS} selectedIndex={1} />);
    const options = screen.getAllByRole('option');
    expect(options[0]?.getAttribute('tabindex')).toBe('-1');
    expect(options[1]?.getAttribute('tabindex')).toBe('0');
    expect(options[2]?.getAttribute('tabindex')).toBe('-1');
  });

  it('all rows have tabIndex=-1 when nothing is selected', () => {
    render(<WordList items={THREE_WORDS} selectedIndex={null} />);
    const options = screen.getAllByRole('option');
    options.forEach((opt) => {
      expect(opt.getAttribute('tabindex')).toBe('-1');
    });
  });
});
