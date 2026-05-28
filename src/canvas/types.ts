/**
 * Canvas slot API types — spec §6.
 *
 * These types define the public API surface for <PageImageCanvas> and its
 * slot-filling helpers. They are exported from the `./canvas` subpath.
 *
 * `selection` and `onSelectionChange` are optional so read-only embedders
 * (e.g. pdomain-ocr-simple-gui's per-page view) do not have to thread no-op pairs.
 * When `selection` is undefined the canvas treats selection as the empty set;
 * when `onSelectionChange` is undefined, selection-changing actions are tracked
 * internally but no callback fires.
 *
 * Design note: canvas-internal types are defined as plain interfaces here
 * rather than re-using the generated Pick<Word,...> aliases. This avoids
 * ESLint no-unsafe-* false positives that arise when TypeScript-ESLint
 * cannot fully resolve deeply-nested generated `components["schemas"]` types.
 * The canvas API accepts any value structurally compatible with these interfaces,
 * which includes pdomain-book-tools `Word` instances — no explicit casting needed.
 */

import type { ReactNode } from 'react';

// ── Geometry types ────────────────────────────────────────────────────────────

/** A point in page-space pixels. */
export interface PagePoint {
  x: number;
  y: number;
}

/**
 * Bounding box in page-space: top_left and bottom_right corners.
 * Structurally matches `Word.bounding_box` from pdomain-book-tools.
 */
export interface PageBBox {
  top_left: PagePoint;
  bottom_right: PagePoint;
}

/**
 * Axis-aligned rect in stage-space pixels (for Konva rendering).
 * Canvas slot fills receive rects already projected into stage space.
 */
export interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Return `true` when a bounding_box is structurally valid for canvas use.
 *
 * A bbox is invalid when any of the following are true:
 *   - `bb` is null / undefined
 *   - `top_left` or `bottom_right` is missing
 *   - Any coordinate (`x`, `y`) is not a finite number (NaN, Infinity, etc.)
 *
 * Invalid words are silently skipped during render and hit-testing so that
 * corrupt OCR data never crashes the canvas.
 */
export function isValidBBox(bb: unknown): bb is PageBBox {
  if (bb === null || bb === undefined || typeof bb !== 'object') return false;
  const b = bb as Record<string, unknown>;
  const tl = b['top_left'];
  const br = b['bottom_right'];
  if (tl === null || tl === undefined || typeof tl !== 'object') return false;
  if (br === null || br === undefined || typeof br !== 'object') return false;
  const tlObj = tl as Record<string, unknown>;
  const brObj = br as Record<string, unknown>;
  return (
    typeof tlObj['x'] === 'number' &&
    isFinite(tlObj['x']) &&
    typeof tlObj['y'] === 'number' &&
    isFinite(tlObj['y']) &&
    typeof brObj['x'] === 'number' &&
    isFinite(brObj['x']) &&
    typeof brObj['y'] === 'number' &&
    isFinite(brObj['y'])
  );
}

/**
 * Convert a `bounding_box` (top_left / bottom_right) to a `CanvasRect`.
 * Returns `null` when the bounding_box is absent, null, or structurally invalid
 * (missing corners, NaN/Infinity coordinates).
 */
export function bboxToRect(bb: PageBBox | null | undefined): CanvasRect | null {
  if (!isValidBBox(bb)) return null;
  return {
    x: bb.top_left.x,
    y: bb.top_left.y,
    width: bb.bottom_right.x - bb.top_left.x,
    height: bb.bottom_right.y - bb.top_left.y,
  };
}

// ── Minimal canvas-facing structural interfaces ───────────────────────────────
//
// These mirror the subset of pdomain-book-tools `Word` and `Page` fields that the
// canvas needs at runtime. Any pdomain-book-tools Word/Page value satisfies these
// interfaces structurally without explicit casting.

/**
 * Minimum required shape for a word passed to `<PageImageCanvas>`.
 * Matches `WordLike` from `@pdomain/pdomain-ui/types` structurally.
 */
export interface CanvasWord {
  bounding_box: PageBBox;
  text: string;
  ocr_confidence?: number | null;
  review?: unknown;
  word_labels?: string[];
  text_style_labels?: string[];
}

/**
 * Minimum required shape for a page passed to `<PageImageCanvas>`.
 * Matches `PageLike` from `@pdomain/pdomain-ui/types` structurally.
 */
export interface CanvasPage {
  width: number;
  height: number;
  page_index?: number;
  name?: string | null;
  image_path?: string | null;
  items?: unknown[];
  review?: unknown;
}

// ── Context types ─────────────────────────────────────────────────────────────

/**
 * Coordinate context provided by the canvas to every slot fill.
 * Slot fills use this to project page-space rects into stage-space.
 */
export interface CoordContext {
  /** Effective scale factor applied to the Konva Stage (1.0 = natural size). */
  scale: number;
  /** Stage width in CSS pixels (= page width * scale). */
  stageWidth: number;
  /** Stage height in CSS pixels (= page height * scale). */
  stageHeight: number;
  /** Original unscaled page width (pixels). */
  pageWidth: number;
  /** Original unscaled page height (pixels). */
  pageHeight: number;
}

/**
 * Selection state.  `ids` is a Set of stable word IDs derived via `getWordId`.
 */
export interface SelectionState {
  ids: ReadonlySet<string>;
}

/**
 * Viewport pan/zoom state managed by the canvas internally.
 */
export interface ViewportState {
  scale: number;
  pan: { x: number; y: number };
}

// ── Slot types ────────────────────────────────────────────────────────────────

/**
 * Props provided to every layer slot fill.
 *
 * Note: `pan` and `hover` are intentionally absent — neither is implemented
 * in the current PageImageCanvas (pan is always {0,0} and hover is always null).
 * Exposing unimplemented fields on the public API would silently mislead
 * slot authors into depending on values that never change.
 * TODO(audit): pan/hover not implemented — re-add when pan/zoom and word-hover
 * state are wired in PageImageCanvas (audit WS5).
 */
export type SlotRenderProps = {
  coords: CoordContext;
  selection: SelectionState;
  zoom: number;
};

/** Props provided to the per-word overlay slot fill. */
export type WordSlotProps = SlotRenderProps & {
  word: CanvasWord;
  isSelected: boolean;
};

/**
 * Props for `<PageImageCanvas>`.
 *
 * Layer order (fixed by pdomain-ui):
 *   image → underlay → overlay (per-word) → selection → tool → hud
 *
 * `selection` / `onSelectionChange` are optional — see file-level comment.
 *
 * TWord must extend CanvasWord (which is structurally compatible with
 * pdomain-book-tools Word and WordLike). TPage must extend CanvasPage.
 */
export type CanvasProps<
  TWord extends CanvasWord = CanvasWord,
  TPage extends CanvasPage = CanvasPage,
> = {
  /** Image URL to render on the background layer. */
  src: string;
  /** Page model; width/height drives the stage dimensions. */
  page: TPage;
  /** Words to render on the overlay layer. */
  words: TWord[];
  /**
   * Optional controlled selection state.
   * When undefined the canvas manages its own internal selection.
   */
  selection?: SelectionState;
  /**
   * Called when the user changes the selection.
   * Only fires when `selection` is provided (controlled mode).
   */
  onSelectionChange?: (s: SelectionState) => void;
  /**
   * Derive a stable string ID for a word.  Defaults to serialising the
   * bounding_box top_left coords.  Apps with server-assigned IDs should pass
   * an identity function instead.
   */
  getWordId?: (word: TWord) => string;
  /** Initial zoom level. 0 = fit-to-container (default). */
  initialZoom?: number;
  /** Fit the canvas to its container on first mount. Default: true. */
  fitOnMount?: boolean;

  /**
   * Called with the Konva Image node once the background image has loaded and
   * the node is mounted on the stage, enabling consumers to attach a Konva
   * Transformer for rotate/scale operations without reaching into the Stage via
   * `findOne`. Called with `null` when the component unmounts.
   *
   * @example
   * ```tsx
   * <PageImageCanvas
   *   onImageNodeReady={(node) => {
   *     if (node) transformerRef.current?.nodes([node])
   *   }}
   * />
   * ```
   */
  onImageNodeReady?: (node: import('konva/lib/shapes/Image').Image | null) => void;

  /**
   * When `true`, the selection layer is rendered with `listening={true}` so
   * that Konva routes pointer events to shapes placed by the `selection` slot.
   * Default: `false` (selection layer is non-interactive) to preserve the
   * prior behaviour and avoid unnecessary hit-test overhead.
   *
   * Enable this when the selection slot renders Konva shapes that need to
   * receive click/hover events (e.g. word-select hit rects) — this removes
   * the need for a separate DOM hit-test overlay.
   */
  selectionLayerListening?: boolean;

  /**
   * Called when the pointer is pressed on the Konva Stage surface.
   * Receives the raw Konva event and the current `CoordContext` so consumers
   * can compute page-space coordinates without needing a separate DOM overlay.
   *
   * This is the preferred way to intercept pointer events for custom
   * interaction modes (rebox, add-word, erase) — it replaces the
   * `image-event-overlay` div pattern used in pdomain-ocr-labeler-spa.
   */
  onStagePointerDown?: (
    e: import('konva/lib/Node').KonvaEventObject<MouseEvent>,
    ctx: CoordContext,
  ) => void;

  /**
   * Called when the pointer moves over the Konva Stage surface while pressed
   * or hovering. Receives the raw Konva event and the current `CoordContext`.
   */
  onStagePointerMove?: (
    e: import('konva/lib/Node').KonvaEventObject<MouseEvent>,
    ctx: CoordContext,
  ) => void;

  /**
   * Called when the pointer is released on the Konva Stage surface.
   * Receives the raw Konva event and the current `CoordContext`.
   */
  onStagePointerUp?: (
    e: import('konva/lib/Node').KonvaEventObject<MouseEvent>,
    ctx: CoordContext,
  ) => void;

  children?: {
    /** Rendered below the word overlay, above the image. */
    underlay?: (p: SlotRenderProps) => ReactNode;
    /** Per-word slot — rendered once per word on the overlay layer. */
    overlay?: (p: WordSlotProps) => ReactNode;
    /** Selection visualisation layer. */
    selection?: (p: SlotRenderProps) => ReactNode;
    /** Tool / interaction layer (drag handles, etc.). */
    tool?: (p: SlotRenderProps) => ReactNode;
    /** HUD / floating UI layer (zoom pill, bulk-action strip). */
    hud?: (p: SlotRenderProps) => ReactNode;
  };
};
