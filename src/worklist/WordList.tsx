/**
 * <WordList> — virtualized, keyboard-navigable word review panel.
 *
 * Uses react-virtuoso (via VirtualizedList base) for DOM-windowing.
 *
 * Render-prop API (spec §6):
 *   renderRow={(p) => <MyRow word={p.item} selected={p.isSelected} />}
 *
 * Keyboard navigation:
 *   ArrowDown → select next (clamped at last item)
 *   ArrowUp   → select prev (clamped at 0)
 *   Enter     → confirm current selection (re-calls onSelect)
 *
 * When `selectedIndex` is provided (controlled mode), selection changes
 * are propagated via `onSelect`. When omitted, the list manages selection
 * internally.
 */

import * as React from 'react';
import { VirtualizedList } from './VirtualizedList';
import type { WordListProps, WordListItem, WordRowProps, MatchStatus } from './types';

// ── default row renderer ──────────────────────────────────────────────────────

function DefaultWordRow<TWord extends WordListItem>({
  item,
  isSelected,
  matchStatus,
}: WordRowProps<TWord>) {
  return (
    <div
      className={`word-list-row${isSelected ? ' word-list-row--selected' : ''} word-list-row--${matchStatus}`}
      style={{
        padding: 'var(--space-1) var(--space-2)',
        background: isSelected
          ? 'color-mix(in srgb, var(--accent) 15%, var(--bg-raised))'
          : 'transparent',
        fontFamily: 'var(--mono-font)',
        fontSize: 'var(--text-sm)',
        color: 'var(--ink-1)',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {item.text}
    </div>
  );
}

// ── <WordList> ────────────────────────────────────────────────────────────────

function WordListInner<TWord extends WordListItem = WordListItem>(
  {
    items,
    renderRow,
    getMatchStatus,
    selectedIndex,
    onSelect,
    'aria-label': ariaLabel,
    className,
    emptySlot,
  }: WordListProps<TWord>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const resolveMatchStatus = React.useCallback(
    (item: TWord): MatchStatus => {
      return getMatchStatus ? getMatchStatus(item) : 'none';
    },
    [getMatchStatus],
  );

  const renderItem = React.useCallback(
    (item: TWord, index: number, isSelected: boolean) => {
      const matchStatus = resolveMatchStatus(item);
      const rowProps: WordRowProps<TWord> = { item, index, isSelected, matchStatus };
      return renderRow ? (
        renderRow(rowProps)
      ) : (
        <DefaultWordRow<TWord>
          item={item}
          index={index}
          isSelected={isSelected}
          matchStatus={matchStatus}
        />
      );
    },
    [resolveMatchStatus, renderRow],
  );

  return (
    <VirtualizedList<TWord>
      ref={ref}
      items={items}
      selectedIndex={selectedIndex}
      onSelect={onSelect}
      aria-label={ariaLabel}
      className={className}
      renderItem={renderItem}
      defaultAriaLabel="Word list"
      emptySlot={emptySlot}
    />
  );
}

/**
 * <WordList> — virtualized word review panel with render-prop rows.
 *
 * Forwards a ref to the outer container div for scroll control.
 */
export const WordList = React.forwardRef(WordListInner) as <
  TWord extends WordListItem = WordListItem,
>(
  props: WordListProps<TWord> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
(WordList as { displayName?: string }).displayName = 'WordList';
