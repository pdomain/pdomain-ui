/**
 * pdomain-ui types barrel
 *
 * Re-exports all generated types from pdomain-book-tools codegen, plus
 * `*Like` structural reductions for use as generic constraints in
 * <PageImageCanvas>, <WordList>, and other slot-based components.
 *
 * Field names follow the actual pdomain-book-tools JSON Schema output:
 *   - Block uses `block_category` and `items` (not `category`/`children`)
 *   - Page uses `items` (not `blocks`); `image_path` is host-supplied, not on Page
 *   - Word has `bounding_box`, `text`, `ocr_confidence`, `review`,
 *     `word_labels`, `text_style_labels`
 *
 * These *Like types serve as the minimum required interface for pdomain-ui
 * slot components. The Pick<> will fail to compile if pdomain-book-tools
 * ever removes a field — that's the codegen contract.
 */

export * from './generated/book-tools';
// Named re-exports from ocr-ops (avoid wildcard — book-tools and ocr-ops both
// export `components`, `paths`, `webhooks`, etc. which would conflict).
export type {
  SuiteApp,
  InstalledApp,
  LayerColors,
  CommonUiPrefs,
  UiPrefs,
  LaunchResultOpened,
  LaunchResultRequiresHostConfig,
  StageResult,
  JobStatus,
  JobEvent,
  JobSpec,
  LaunchResult,
} from './generated/ocr-ops.js';
export type { JobState } from './job-state.js';

import type { Word, Block, Page } from './generated/book-tools';

/**
 * Minimum fields required by canvas and worklist components to render a word.
 * Any type with at least these fields satisfies the TWord generic constraint.
 */
export type WordLike = Pick<
  Word,
  'bounding_box' | 'text' | 'ocr_confidence' | 'review' | 'word_labels' | 'text_style_labels'
>;

/**
 * Minimum fields required by block-level list components.
 * Lines are blocks: filter by `block.block_category === 'LINE'`.
 * Same for paragraphs, captions, figures, etc. No separate LineLike.
 */
export type BlockLike = Pick<Block, 'block_category' | 'bounding_box' | 'items' | 'review'>;

/**
 * Minimum fields required by page-level canvas components.
 * `image_path` is the filesystem path to the page image, supplied by the host.
 */
export type PageLike = Pick<
  Page,
  'page_index' | 'name' | 'width' | 'height' | 'items' | 'review'
> & {
  /**
   * Supplied by the host application, not by the Page model.
   * pdomain-book-tools removed `image_path` from Page in the 0.15 line, along
   * with ten other operational metadata fields, and the host now carries it on
   * its own page record. Page itself identifies images by content hash
   * (`image_blob_hash`, `thumbnail_blob_hash`) instead.
   */
  image_path?: string | null;
};
