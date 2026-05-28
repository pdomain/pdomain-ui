/**
 * WordList API types — spec §6.
 *
 * These types define the public API surface for <WordList> and its
 * render-prop row slot. They are exported from the `./worklist` subpath.
 *
 * Design note: Like canvas types, we define plain structural interfaces here
 * rather than re-using generated Pick<Word,...> aliases directly. This avoids
 * ESLint no-unsafe-* false positives while still being structurally compatible
 * with pdomain-book-tools Word instances.
 */

import type { ReactNode } from 'react';

// ── MatchStatus ───────────────────────────────────────────────────────────────

/**
 * Match status of a word against ground truth.
 *
 * - `exact`    — OCR text matches GT exactly.
 * - `fuzzy`    — OCR text approximately matches GT (within edit distance).
 * - `mismatch` — OCR text does not match GT.
 * - `none`     — No GT to compare against (unvalidated / no GT loaded).
 */
export type MatchStatus = 'exact' | 'fuzzy' | 'mismatch' | 'none';

// ── Row types ─────────────────────────────────────────────────────────────────

/**
 * Minimum required shape for a word item passed to <WordList>.
 * Any type with at least these fields satisfies the TWord generic constraint.
 * Structurally compatible with WordLike from `@pdomain/pdomain-ui/types`.
 */
export interface WordListItem {
  text: string;
  ocr_confidence?: number | null | undefined;
  bounding_box: {
    top_left: { x: number; y: number };
    bottom_right: { x: number; y: number };
  };
  word_labels?: string[] | undefined;
  text_style_labels?: string[] | undefined;
}

/**
 * Props provided to the `renderRow` render-prop.
 * TWord is the concrete word type for this list instance.
 */
export interface WordRowProps<TWord extends WordListItem = WordListItem> {
  /** The word item for this row. */
  item: TWord;
  /** Zero-based index in the (filtered/sorted) display list. */
  index: number;
  /** Whether this row is currently selected. */
  isSelected: boolean;
  /** Derived match status for this word. */
  matchStatus: MatchStatus;
}

// ── Block/Page row types (for LineList and PageList) ─────────────────────────

/**
 * Minimum required shape for a block item passed to <LineList> / <PageList>.
 * Structurally compatible with BlockLike from `@pdomain/pdomain-ui/types`.
 */
export interface BlockListItem {
  block_category?: ('BLOCK' | 'PARAGRAPH' | 'LINE') | null | undefined;
  bounding_box?:
    | {
        top_left: { x: number; y: number };
        bottom_right: { x: number; y: number };
      }
    | null
    | undefined;
  review?: unknown;
}

/**
 * Minimum required shape for a page item passed to <PageList>.
 * Structurally compatible with PageLike from `@pdomain/pdomain-ui/types`.
 */
export interface PageListItem {
  page_index?: number | undefined;
  name?: string | null | undefined;
  width: number;
  height: number;
}

/**
 * Props provided to the render-prop for a block row.
 */
export interface BlockRowProps<TBlock extends BlockListItem = BlockListItem> {
  item: TBlock;
  index: number;
  isSelected: boolean;
}

/**
 * Props provided to the render-prop for a page row.
 */
export interface PageRowProps<TPage extends PageListItem = PageListItem> {
  item: TPage;
  index: number;
  isSelected: boolean;
}

// ── List component props ──────────────────────────────────────────────────────

/**
 * Props for <WordList>.
 *
 * TWord is the concrete word type; apps pass their Word/WordLike instances
 * directly and the list renders each row via `renderRow`.
 *
 * `getMatchStatus` derives the match status for each word. When omitted,
 * all words default to `'none'`.
 *
 * `selectedIndex` / `onSelect` implement controlled selection. When
 * `selectedIndex` is undefined the list manages internal selection state.
 */
export interface WordListProps<TWord extends WordListItem = WordListItem> {
  /** The (filtered/sorted) word items to render. */
  items: TWord[];

  /**
   * Render-prop for each row.
   * Receives `WordRowProps<TWord>` including the concrete TWord item.
   * When omitted the list renders a default plain-text row.
   */
  renderRow?: ((props: WordRowProps<TWord>) => ReactNode) | undefined;

  /**
   * Derive the match status for a word.
   * Defaults to `() => 'none'` when not provided.
   */
  getMatchStatus?: ((item: TWord) => MatchStatus) | undefined;

  /**
   * Controlled selected index (zero-based into `items`).
   * Pass `null` for no selection. When undefined the list manages selection.
   */
  selectedIndex?: number | null | undefined;

  /**
   * Called when the user selects a row (click or keyboard Enter).
   * Receives the zero-based index into `items`.
   */
  onSelect?: ((index: number) => void) | undefined;

  /**
   * aria-label for the list element. Defaults to "Word list".
   */
  'aria-label'?: string | undefined;

  /** Additional CSS class applied to the outer container. */
  className?: string | undefined;

  /**
   * Node rendered instead of the virtualized list when `items` is empty.
   * The listbox wrapper is still present; only the row content is replaced.
   * Use this to show "No results" / search-empty-state prompts.
   */
  emptySlot?: ReactNode;
}

/**
 * Props for <LineList> — renders Block items (filtered by LINE category).
 */
export interface LineListProps<TBlock extends BlockListItem = BlockListItem> {
  items: TBlock[];
  renderRow?: ((props: BlockRowProps<TBlock>) => ReactNode) | undefined;
  selectedIndex?: number | null | undefined;
  onSelect?: ((index: number) => void) | undefined;
  'aria-label'?: string | undefined;
  className?: string | undefined;
}

/**
 * Props for <PageList> — renders Page items.
 */
export interface PageListProps<TPage extends PageListItem = PageListItem> {
  items: TPage[];
  renderRow?: ((props: PageRowProps<TPage>) => ReactNode) | undefined;
  selectedIndex?: number | null | undefined;
  onSelect?: ((index: number) => void) | undefined;
  'aria-label'?: string | undefined;
  className?: string | undefined;
}
