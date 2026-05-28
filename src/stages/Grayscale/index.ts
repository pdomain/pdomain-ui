/**
 * Grayscale stage barrel.
 *
 * Public exports from this subpath (Phase 2 M4).
 */

// ─── Shared types ─────────────────────────────────────────────────────────────
export type { GrayscaleMode } from './types.js';

// ─── AutoDetectBanner ─────────────────────────────────────────────────────────
export { AutoDetectBanner } from './AutoDetectBanner.js';
export type { AutoDetectBannerProps } from './AutoDetectBanner.js';

// ─── ModeCard ─────────────────────────────────────────────────────────────────
export { ModeCard } from './ModeCard.js';
export type { ModeCardProps, ModeEstimate, EstimateTone } from './ModeCard.js';

// ─── AdvancedParams ───────────────────────────────────────────────────────────
export { AdvancedParams, GRAYSCALE_PARAMS_DEFAULT } from './AdvancedParams.js';
export type { AdvancedParamsProps, GrayscaleParams } from './AdvancedParams.js';

// ─── GrayscaleOverview ────────────────────────────────────────────────────────
export { GrayscaleOverview } from './GrayscaleOverview.js';
export type { GrayscaleOverviewProps, GrayscaleStats } from './GrayscaleOverview.js';

// ─── GrayThumb ────────────────────────────────────────────────────────────────
export { GrayThumb } from './GrayThumb.js';
export type { GrayThumbProps, GrayPage } from './GrayThumb.js';

// ─── PageViewer ───────────────────────────────────────────────────────────────
export { PageViewer } from './PageViewer.js';
export type {
  PageViewerProps,
  PageViewerMode,
  PageViewerPage,
  PageViewerThumb,
} from './PageViewer.js';

// ─── StageControlsLeft ────────────────────────────────────────────────────────
export { StageControlsLeft } from './StageControlsLeft.js';
export type { StageControlsLeftProps } from './StageControlsLeft.js';
