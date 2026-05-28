/**
 * @pdomain/pdomain-ui/canvas
 *
 * Slot-based Konva canvas for page-image rendering with overlay layers.
 *
 * Primary export: `<PageImageCanvas>` — the stage shell.
 * Slot helpers:   `BBoxLayer`, `WordHitLayer`, `MarqueeSelectLayer`.
 * Hooks:          `useCanvasCoords`, `useViewport`, `useCanvasSelection`.
 * Types:          `CanvasProps`, `SlotRenderProps`, `WordSlotProps`,
 *                 `CoordContext`, `SelectionState`, `ViewportState`,
 *                 `CanvasRect`, `bboxToRect`, `isValidBBox`.
 */

// Component
export { PageImageCanvas } from './PageImageCanvas';

// Token resolver (P1 — also imported by L-PW lane for Konva color resolution)
export { resolveToken } from './resolveToken';

// Throttle utility (issue #35)
export { makeRafThrottle } from './rafThrottle';

// Slot helpers
export { BBoxLayer } from './layers/BBoxLayer';
export { WordHitLayer } from './layers/WordHitLayer';
export { MarqueeSelectLayer } from './layers/MarqueeSelectLayer';

// Hooks
export { useCanvasCoords } from './hooks/useCanvasCoords';
export { useViewport } from './hooks/useViewport';
export { useCanvasSelection } from './hooks/useCanvasSelection';

// Page-size guard (issue #29)
export {
  PAGE_DIMENSION_MAX,
  isPageDimensionsValid,
  validatePageDimensions,
  clampPageDimensions,
} from './pageSizeGuard';
export type { PageDimensionValidationResult } from './pageSizeGuard';

// Types
export type {
  CanvasProps,
  CanvasWord,
  CanvasPage,
  SlotRenderProps,
  WordSlotProps,
  CoordContext,
  SelectionState,
  ViewportState,
  CanvasRect,
  PageBBox,
  PagePoint,
} from './types';
export { bboxToRect, isValidBBox } from './types';
