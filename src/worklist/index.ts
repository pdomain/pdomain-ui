/**
 * @pdomain/pdomain-ui/worklist
 *
 * Virtualized, keyboard-navigable list panels for the pdomain-* review workflow.
 *
 * Primary exports:
 *   <WordList>        — word review panel with render-prop rows
 *   <LineList>        — block/line panel with render-prop rows
 *   <PageList>        — page panel with render-prop rows
 *
 * Status row primitives:
 *   <StatusPip>       — re-exported from @pdomain/pdomain-ui/primitives
 *   <ConfidenceBar>   — horizontal OCR confidence bar
 *   <MatchStatusChip> — compact match status chip
 *
 * Hooks:
 *   useWorklistFilter — memoized filter by status / query / confidence
 *   useWorklistSort   — memoized sort by index / confidence / text
 *
 * Types:
 *   MatchStatus, WordListItem, WordRowProps, WordListProps
 *   BlockListItem, BlockRowProps, LineListProps
 *   PageListItem, PageRowProps, PageListProps
 *   WorklistFilterOptions, WorklistSortKey
 */

// ── Components ────────────────────────────────────────────────────────────────

export { WordList } from './WordList';
export { LineList } from './LineList';
export { PageList } from './PageList';

// ── Status row primitives ─────────────────────────────────────────────────────

// Re-export StatusPip from primitives for convenience in renderRow fills
export { StatusPip } from '../primitives/StatusPip';
export type { StatusPipProps, StatusPipStatus } from '../primitives/StatusPip';

export { ConfidenceBar } from './ConfidenceBar';
export type { ConfidenceBarProps } from './ConfidenceBar';

export { MatchStatusChip } from './MatchStatusChip';
export type { MatchStatusChipProps } from './MatchStatusChip';

// ── Hooks ─────────────────────────────────────────────────────────────────────

export { useWorklistFilter } from './hooks/useWorklistFilter';
export type { WorklistFilterOptions } from './hooks/useWorklistFilter';

export { useWorklistSort } from './hooks/useWorklistSort';
export type { WorklistSortKey } from './hooks/useWorklistSort';

// ── Types ─────────────────────────────────────────────────────────────────────

export type {
  MatchStatus,
  WordListItem,
  WordRowProps,
  WordListProps,
  BlockListItem,
  BlockRowProps,
  LineListProps,
  PageListItem,
  PageRowProps,
  PageListProps,
} from './types';
