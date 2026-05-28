/**
 * Crop stage barrel (Phase 2 M5).
 */

// ─── Shared types ─────────────────────────────────────────────────────────────
export type { CropFlagKind } from './types.js';

// ─── CropBanner ───────────────────────────────────────────────────────────────
export { CropBanner } from './CropBanner.js';
export type { CropBannerProps, CropState, CropFlagCounts } from './CropBanner.js';

// ─── CropToolbar ──────────────────────────────────────────────────────────────
export { CropToolbar } from './CropToolbar.js';
export type {
  CropToolbarProps,
  CropFilter,
  CropDensity,
  CropFilterCounts,
  CropFlagDrillCounts,
} from './CropToolbar.js';

// ─── CropCard ─────────────────────────────────────────────────────────────────
export { CropCard } from './CropCard.js';
export type { CropCardProps, CropPage, CropStatus, CropBbox } from './CropCard.js';

// ─── CropBulkBar ──────────────────────────────────────────────────────────────
export { CropBulkBar } from './CropBulkBar.js';
export type { CropBulkBarProps, CropBulkAction } from './CropBulkBar.js';

// ─── BboxEditor ───────────────────────────────────────────────────────────────
export { BboxEditor } from './BboxEditor.js';
export type {
  BboxEditorProps,
  BboxEditorPage,
  BboxMargins,
  BboxUnit,
  BboxScope,
} from './BboxEditor.js';

// ─── CropOverview ─────────────────────────────────────────────────────────────
export { CropOverview } from './CropOverview.js';
export type {
  CropOverviewProps,
  FlagDistributionEntry,
  CropActivityEntry,
} from './CropOverview.js';

// ─── CropStepSettings ─────────────────────────────────────────────────────────
export { CropStepSettings, CROP_SETTINGS_DEFAULT } from './CropStepSettings.js';
export type { CropStepSettingsProps, CropSettings, CropStrategy } from './CropStepSettings.js';
