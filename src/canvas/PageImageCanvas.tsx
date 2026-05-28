/**
 * PageImageCanvas — slot-based Konva stage that renders a page image with
 * structured overlay layers.
 *
 * Layer order (fixed; apps inject via slot fills):
 *   image → underlay → overlay (per-word) → selection → tool → hud
 *
 * Spec §6: slot-based API with `children.underlay`, `children.overlay`,
 * `children.selection`, `children.tool`, `children.hud`.
 *
 * Port-not-copy from pdomain-ocr-labeler-spa/PageImageCanvas.tsx.
 * Labeler-specific logic (mode pills, bulk-action strip, store subscriptions)
 * is intentionally left as slot responsibilities — pdomain-ui owns only the
 * stage, pan/zoom math, image loading, context provision.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Image as KonvaImage, Layer, Rect, Stage } from 'react-konva';
import type Konva from 'konva';
import { CanvasInternalContext } from './context';
import type { CanvasProps, CanvasWord, CoordContext, SelectionState, ViewportState } from './types';
import { isValidBBox } from './types';
import { isPageDimensionsValid } from './pageSizeGuard';
import { makeRafThrottle } from './rafThrottle';
import { resolveToken } from './resolveToken.js';

// Resolve design tokens once at module load (resolve-once-at-mount per OQ-1).
const DRAG_STROKE_COLOR = resolveToken('--accent', '#5d9fdf');

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_SELECTION: SelectionState = { ids: new Set<string>() };
const EMPTY_PAN = { x: 0, y: 0 };

/**
 * Derive a stable ID from a word's bounding_box.
 * Falls back to the word text when the bbox is invalid or missing, so that
 * corrupt OCR data never throws during render or selection bookkeeping.
 */
function defaultGetWordId(word: CanvasWord): string {
  const bb = word.bounding_box;
  if (!isValidBBox(bb)) return `invalid-bbox:${word.text}`;
  return `${bb.top_left.x},${bb.top_left.y}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * `<PageImageCanvas>` — the shared canvas component.
 *
 * @example
 * ```tsx
 * <PageImageCanvas src={imageUrl} page={page} words={words}
 *   selection={sel} onSelectionChange={setSel}>
 *   {{
 *     overlay: ({ word, isSelected }) => (
 *       <BBoxLayer word={word} isSelected={isSelected} />
 *     ),
 *   }}
 * </PageImageCanvas>
 * ```
 */
export function PageImageCanvas<
  TWord extends CanvasWord = CanvasWord,
  TPage extends { width: number; height: number } = { width: number; height: number },
>({
  src,
  page,
  words,
  selection: selectionProp,
  onSelectionChange,
  getWordId = defaultGetWordId,
  initialZoom = 0,
  fitOnMount = true,
  onImageNodeReady,
  selectionLayerListening = false,
  onStagePointerDown,
  onStagePointerMove,
  onStagePointerUp,
  children,
}: CanvasProps<TWord, TPage>) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Container size (ResizeObserver) ────────────────────────────────────────
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  // ── Zoom state ─────────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(initialZoom);
  useEffect(() => {
    if (fitOnMount) {
      setZoom(0); // 0 → fit
    }
  }, [fitOnMount]);

  // ── Page dimension validation (issue #29) ─────────────────────────────────
  // Validate before any dimension arithmetic.  Invalid metadata renders a
  // visible fallback rather than allocating a huge/broken Konva canvas.
  // NOTE: this guard is computed as a memo (not a hook condition) so that the
  // hook call order above is unconditional — React rules-of-hooks require all
  // hooks to execute on every render regardless of page validity.
  const pageDimensionsValid = useMemo(
    () => isPageDimensionsValid(page.width, page.height),
    [page.width, page.height],
  );

  const fitScale = useMemo(() => {
    const { w, h } = containerSize;
    if (w <= 0 || h <= 0 || page.width <= 0 || page.height <= 0) return 1;
    return Math.min(w / page.width, h / page.height, 1);
  }, [containerSize, page.width, page.height]);

  const effectiveScale = zoom === 0 ? fitScale : zoom;

  // ── Pan state ──────────────────────────────────────────────────────────────
  // TODO(audit): pan is not yet implemented (always {0,0}). Removed from
  // SlotRenderProps to avoid misleading slot authors (audit WS5).
  const [pan] = useState(EMPTY_PAN);

  // ── Selection state (uncontrolled + controlled) ────────────────────────────
  const [internalSelection, setInternalSelection] = useState<SelectionState>(EMPTY_SELECTION);
  const selection = selectionProp ?? internalSelection;

  const setSelection = useCallback(
    (s: SelectionState) => {
      if (selectionProp !== undefined) {
        onSelectionChange?.(s);
      } else {
        setInternalSelection(s);
      }
    },
    [selectionProp, onSelectionChange],
  );

  // ── CoordContext ───────────────────────────────────────────────────────────
  const coords: CoordContext = useMemo(
    () => ({
      scale: effectiveScale,
      stageWidth: page.width * effectiveScale,
      stageHeight: page.height * effectiveScale,
      pageWidth: page.width,
      pageHeight: page.height,
    }),
    [effectiveScale, page.width, page.height],
  );

  // ── ViewportState ──────────────────────────────────────────────────────────
  const viewport: ViewportState = useMemo(
    () => ({
      scale: effectiveScale,
      pan,
    }),
    [effectiveScale, pan],
  );

  // ── Slot render props (shared across all non-word slots) ───────────────────
  // hover is not implemented (always null) — removed from SlotRenderProps
  // to avoid misleading slot authors (audit WS5 / TODO: pan/hover).
  const slotProps = useMemo(
    () => ({
      coords,
      selection,
      zoom: effectiveScale,
    }),
    [coords, selection, effectiveScale],
  );

  // ── Context value ──────────────────────────────────────────────────────────
  const ctxValue = useMemo(
    () => ({ coords, selection, viewport, setSelection }),
    [coords, selection, viewport, setSelection],
  );

  // ── Image load state ───────────────────────────────────────────────────────
  // Clear immediately on src change so no stale image is shown while loading.
  // A "cancelled" flag acts as a source token to discard late-arriving loads
  // from a prior src (e.g. slow network + rapid src change).
  // onerror keeps imageEl null so a broken image never shows a stale frame.
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    setImageEl(null);
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (!cancelled) setImageEl(img);
    };
    img.onerror = () => {
      if (!cancelled) setImageEl(null);
    };
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // ── Image node ref (issue #12) ─────────────────────────────────────────────
  // Exposes the Konva Image node via callback so consumers can attach a
  // Konva Transformer without reaching into the Stage via findOne.
  const imageNodeRef = useRef<Konva.Image | null>(null);
  const handleImageRef = useCallback(
    (node: Konva.Image | null) => {
      imageNodeRef.current = node;
      onImageNodeReady?.(node);
    },
    [onImageNodeReady],
  );

  // ── Focus on mount (keyboard hotkeys) ─────────────────────────────────────
  useEffect(() => {
    wrapperRef.current?.focus();
  }, []);

  // ── Drag (marquee select) ──────────────────────────────────────────────────
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  // Stable throttle instance — persists across renders so pending flag works correctly.
  const dragThrottleRef = useRef(makeRafThrottle());

  const stageWidth = page.width * effectiveScale;
  const stageHeight = page.height * effectiveScale;

  // ── Render ─────────────────────────────────────────────────────────────────
  // Canvas viewport acts as a keyboard-navigable image region; tabIndex + pointer
  // events are required for hotkey dispatch (select/drag/zoom modes).
  // The jsx-a11y rule is disabled because role="img" + tabIndex is the correct
  // pattern here: the element renders an image but also accepts keyboard focus
  // for interaction mode hotkeys. This matches the pdomain-ocr-labeler-spa pattern.

  // Invalid page dimensions: render a safe fallback instead of a Konva stage.
  // Dimensions may be invalid when OCR/page metadata is corrupt or out of range.
  if (!pageDimensionsValid) {
    return (
      <div
        ref={wrapperRef}
        data-testid="canvas-invalid-page"
        role="img"
        aria-label="Page cannot be rendered: invalid dimensions"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ink-3)',
          fontSize: '0.875rem',
          outline: 'none',
          userSelect: 'none',
        }}
      >
        Page cannot be rendered: invalid dimensions ({page.width}&times;{page.height})
      </div>
    );
  }

  /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
  return (
    <CanvasInternalContext.Provider value={ctxValue}>
      <div
        ref={wrapperRef}
        tabIndex={0}
        role="region"
        aria-label="Page image viewport"
        data-testid="image-viewport"
        data-width={page.width}
        data-height={page.height}
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
          <Stage
            width={stageWidth}
            height={stageHeight}
            scaleX={effectiveScale}
            scaleY={effectiveScale}
            data-testid="canvas-stage"
            onMouseDown={(e) => {
              onStagePointerDown?.(e, coords);
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (!pos) return;
              const s = effectiveScale || 1;
              dragStartRef.current = { x: pos.x / s, y: pos.y / s };
              setDragRect(null);
            }}
            onMouseMove={(e) => {
              onStagePointerMove?.(e, coords);
              if (!dragStartRef.current) return;
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (!pos) return;
              const s = effectiveScale || 1;
              const cur = { x: pos.x / s, y: pos.y / s };
              const start = dragStartRef.current;
              // Use the stable throttle ref so pending persists across event calls.
              // Passing the latest computed rect as `fn` ensures the rAF always
              // commits the most recent position, not a stale closure capture.
              dragThrottleRef.current(() => {
                setDragRect({
                  x: Math.min(cur.x, start.x),
                  y: Math.min(cur.y, start.y),
                  width: Math.abs(cur.x - start.x),
                  height: Math.abs(cur.y - start.y),
                });
              });
            }}
            onMouseUp={(e) => {
              onStagePointerUp?.(e, coords);
              const start = dragStartRef.current;
              if (!start) return;
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              const s = effectiveScale || 1;
              const cur = pos ? { x: pos.x / s, y: pos.y / s } : start;
              const rect = {
                x: Math.min(cur.x, start.x),
                y: Math.min(cur.y, start.y),
                width: Math.abs(cur.x - start.x),
                height: Math.abs(cur.y - start.y),
              };
              dragStartRef.current = null;
              setDragRect(null);

              // Hit-test: trivial drag (≤2px) = point click
              if (rect.width <= 2 && rect.height <= 2) {
                const hit = words.find((w) => {
                  const bb = w.bounding_box;
                  if (!isValidBBox(bb)) return false;
                  return (
                    cur.x >= bb.top_left.x &&
                    cur.x <= bb.bottom_right.x &&
                    cur.y >= bb.top_left.y &&
                    cur.y <= bb.bottom_right.y
                  );
                });
                if (hit) {
                  const id = getWordId(hit);
                  setSelection({ ids: new Set([id]) });
                }
                return;
              }

              // Marquee select: collect all words whose bboxes intersect the drag rect
              // Words with invalid bounding boxes are silently skipped.
              const hitIds = words
                .filter((w) => {
                  const bb = w.bounding_box;
                  if (!isValidBBox(bb)) return false;
                  return (
                    bb.bottom_right.x > rect.x &&
                    bb.top_left.x < rect.x + rect.width &&
                    bb.bottom_right.y > rect.y &&
                    bb.top_left.y < rect.y + rect.height
                  );
                })
                .map((w) => getWordId(w));
              setSelection({ ids: new Set(hitIds) });
            }}
            onMouseLeave={() => {
              dragStartRef.current = null;
              setDragRect(null);
            }}
          >
            {/* Layer 1: image */}
            <Layer name="image" listening={false}>
              {imageEl && (
                <KonvaImage
                  ref={handleImageRef}
                  image={imageEl}
                  x={0}
                  y={0}
                  width={page.width}
                  height={page.height}
                  listening={false}
                  perfectDrawEnabled={false}
                />
              )}
            </Layer>

            {/* Layer 2: underlay slot */}
            <Layer name="underlay" listening={false}>
              {children?.underlay?.(slotProps)}
            </Layer>

            {/* Layer 3: overlay — per-word slot */}
            {/* Words with invalid bounding boxes are silently skipped to prevent
                canvas crashes from corrupt OCR data (issue #22). */}
            <Layer name="overlay" listening={false}>
              {words.map((word) => {
                if (!isValidBBox(word.bounding_box)) return null;
                const id = getWordId(word);
                const wordSlotProps = {
                  ...slotProps,
                  word,
                  isSelected: selection.ids.has(id),
                };
                return children?.overlay?.(wordSlotProps) ?? null;
              })}
            </Layer>

            {/* Layer 4: selection slot (issue #13: opt-in listening) */}
            <Layer name="selection" listening={selectionLayerListening}>
              {children?.selection?.(slotProps)}
            </Layer>

            {/* Layer 5: tool slot (drag preview + custom tools) */}
            <Layer name="tool">
              {dragRect && (
                <Rect
                  data-testid="canvas-drag-preview"
                  x={dragRect.x}
                  y={dragRect.y}
                  width={dragRect.width}
                  height={dragRect.height}
                  stroke={DRAG_STROKE_COLOR}
                  strokeWidth={2}
                  dash={[4, 2]}
                  fill="transparent"
                  listening={false}
                  perfectDrawEnabled={false}
                />
              )}
              {children?.tool?.(slotProps)}
            </Layer>

            {/* Layer 6: hud slot */}
            <Layer name="hud" listening={false}>
              {children?.hud?.(slotProps)}
            </Layer>
          </Stage>
        </div>

        {/* Drag sidecar for Playwright / driver-contract tests */}
        {dragRect && (
          <div
            data-testid="canvas-drag-rect"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: dragRect.x,
              top: dragRect.y,
              width: dragRect.width,
              height: dragRect.height,
              pointerEvents: 'none',
              visibility: 'hidden',
            }}
          />
        )}
      </div>
    </CanvasInternalContext.Provider>
  );
}

PageImageCanvas.displayName = 'PageImageCanvas';
