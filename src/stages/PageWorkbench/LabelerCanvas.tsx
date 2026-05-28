/**
 * LabelerCanvas — annotation-mode canvas (Phase 2 M2).
 *
 * Extends `PageImageCanvas` with labeler overlays:
 *   - Block bbox rendering on the underlay slot (rect outlines per block).
 *   - Selection handles on the tool slot (8 corner + midpoint handles for
 *     the currently selected block — visual only, no drag in M2).
 *   - A `LayerToggle` HUD pinned top-right for showing/hiding layer types.
 *   - A HUD status text showing the visible block count.
 *
 * Composition: wraps `<PageImageCanvas>` via its slot API — does NOT
 * re-implement Konva stage management.
 *
 * Block bboxes are normalized [x, y, w, h] in [0,1] × [0,1] relative to
 * page dimensions (matching WordBbox convention in this package). At render
 * time they are projected to page-space pixels so the Konva Stage can draw
 * them at the correct scale.
 *
 * Spec §6.2: annotation-mode canvas for pdomain-ui Phase 2.
 */

import { useMemo } from 'react';
import { Rect, Circle } from 'react-konva';
import { PageImageCanvas } from '../../canvas/PageImageCanvas.js';
import { LayerToggle } from './LayerToggle.js';
import { resolveToken } from '../../canvas/resolveToken.js';

// ── Public types ──────────────────────────────────────────────────────────────

export interface LabelerBlock {
  id: string;
  /**
   * Normalized [x, y, w, h] (0–1) relative to page dimensions.
   * Top-left origin, same convention as WordBbox.
   */
  bbox: [number, number, number, number];
  /** Optional block type label (e.g. 'text', 'heading', 'table'). */
  type?: string;
  /**
   * Optional color tone token (e.g. 'brand', 'ocr', 'clean').
   * Default: 'neutral'.
   */
  tone?: string;
}

export interface LayerVisibility {
  blocks: boolean;
  words: boolean;
  detections: boolean;
}

export interface LabelerCanvasProps {
  /** Page image URL. */
  imageUrl: string;
  /** Page width in natural pixels. */
  pageWidth: number;
  /** Page height in natural pixels. */
  pageHeight: number;
  /** Block annotations to display. */
  blocks: ReadonlyArray<LabelerBlock>;
  /**
   * Called when the user adds/edits/removes a block.
   * @note M2 ships rendering only. This prop is accepted in the type contract
   * but intentionally not called — bbox drag-to-create and handle dragging are
   * explicit Phase 2 follow-ons. Treat as a no-op until that milestone lands.
   */
  onBlocksChange?: (blocks: ReadonlyArray<LabelerBlock>) => void;
  /** Currently-selected block id (controlled). */
  selectedBlockId?: string;
  /** Called when the user clicks a block rect or deselects. */
  onSelectBlock?: (id: string | null) => void;
  /** Layer visibility map (controlled). */
  layerVisibility: LayerVisibility;
  /** Called when the user toggles a layer. */
  onLayerVisibilityChange: (next: LayerVisibility) => void;
  'data-testid'?: string;
}

// ── Tone → resolved canvas color ──────────────────────────────────────────────
// Konva renders to <canvas>; CSS var() strings and color-mix() are not
// evaluated by the Canvas API. Resolve tokens to concrete color strings at
// render time via resolveToken. Remap deprecated --brand→--accent,
// --clean→--exact per §0.2 color-remap table.

function toneStroke(tone: string | undefined): string {
  switch (tone) {
    case 'brand':
      // --brand remapped to --accent per §0.2
      return resolveToken('--accent', 'rgba(93,159,223,1)');
    case 'ocr':
      return resolveToken('--ocr', 'rgba(14,165,233,1)');
    case 'clean':
      // --clean remapped to --exact per §0.2
      return resolveToken('--exact', 'rgba(34,197,94,1)');
    default:
      return resolveToken('--accent', 'rgba(93,159,223,1)');
  }
}

function toneFill(tone: string | undefined): string {
  switch (tone) {
    case 'brand':
      return resolveToken('--accent-subtle', 'rgba(93,159,223,0.12)');
    case 'ocr':
      return resolveToken('--ocr-subtle', 'rgba(14,165,233,0.12)');
    case 'clean':
      return resolveToken('--exact-subtle', 'rgba(34,197,94,0.12)');
    default:
      return resolveToken('--accent-subtle', 'rgba(93,159,223,0.12)');
  }
}

// ── Selection handle positions ────────────────────────────────────────────────

/**
 * Returns 8 {cx, cy} anchor points for selection handles around a rect:
 * corners (4) + edge midpoints (4), in page-space pixels.
 */
function selectionHandles(
  x: number,
  y: number,
  w: number,
  h: number,
): Array<{ cx: number; cy: number; key: string }> {
  const mx = x + w / 2;
  const my = y + h / 2;
  const ex = x + w;
  const ey = y + h;
  return [
    { cx: x, cy: y, key: 'nw' },
    { cx: mx, cy: y, key: 'n' },
    { cx: ex, cy: y, key: 'ne' },
    { cx: ex, cy: my, key: 'e' },
    { cx: ex, cy: ey, key: 'se' },
    { cx: mx, cy: ey, key: 's' },
    { cx: x, cy: ey, key: 'sw' },
    { cx: x, cy: my, key: 'w' },
  ];
}

// ── Empty words array (stable reference) ─────────────────────────────────────

const EMPTY_WORDS: never[] = [];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * `<LabelerCanvas>` — annotation-mode canvas for labeler workflows.
 *
 * @example
 * ```tsx
 * <LabelerCanvas
 *   imageUrl={url}
 *   pageWidth={2400}
 *   pageHeight={3200}
 *   blocks={blocks}
 *   selectedBlockId={selectedId}
 *   onSelectBlock={setSelectedId}
 *   layerVisibility={visibility}
 *   onLayerVisibilityChange={setVisibility}
 * />
 * ```
 */
export function LabelerCanvas(props: LabelerCanvasProps) {
  const {
    imageUrl,
    pageWidth,
    pageHeight,
    blocks,
    selectedBlockId,
    onSelectBlock,
    layerVisibility,
    onLayerVisibilityChange,
    'data-testid': testId = 'labeler-canvas',
  } = props;
  // props.onBlocksChange: M2 ships rendering only. The prop is accepted in
  // the type contract but not wired to any mutation path yet — bbox
  // drag-to-create and handle dragging are explicit Phase 2 follow-ons.
  // Memoize the selected block lookup
  const selectedBlock = useMemo(
    () => (selectedBlockId != null ? (blocks.find((b) => b.id === selectedBlockId) ?? null) : null),
    [blocks, selectedBlockId],
  );

  // Visible block count (used in HUD + tests)
  const visibleBlockCount = layerVisibility.blocks ? blocks.length : 0;

  const page = useMemo(() => ({ width: pageWidth, height: pageHeight }), [pageWidth, pageHeight]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <PageImageCanvas
        src={imageUrl}
        page={page}
        words={EMPTY_WORDS}
        selectionLayerListening={false}
      >
        {{
          // ── underlay: block bbox rects ────────────────────────────────────
          underlay: ({ coords }) => {
            if (!layerVisibility.blocks) return null;
            return (
              <>
                {blocks.map((block) => {
                  const [nx, ny, nw, nh] = block.bbox;
                  const x = nx * coords.pageWidth;
                  const y = ny * coords.pageHeight;
                  const w = nw * coords.pageWidth;
                  const h = nh * coords.pageHeight;
                  const isSelected = block.id === selectedBlockId;
                  const stroke = isSelected
                    ? resolveToken(
                        '--accent-strong',
                        resolveToken('--accent', 'rgba(93,159,223,1)'),
                      )
                    : toneStroke(block.tone);
                  const fill = isSelected
                    ? resolveToken('--accent-subtle', 'rgba(93,159,223,0.20)')
                    : toneFill(block.tone);

                  return (
                    <Rect
                      key={block.id}
                      data-testid={`labeler-block-${block.id}`}
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2 : 1.5}
                      fill={fill}
                      listening
                      onClick={() => {
                        onSelectBlock?.(block.id);
                      }}
                      onTap={() => {
                        onSelectBlock?.(block.id);
                      }}
                      perfectDrawEnabled={false}
                    />
                  );
                })}
              </>
            );
          },

          // ── tool: selection handles around the selected block ─────────────
          tool: ({ coords }) => {
            if (selectedBlock == null) return null;
            const [nx, ny, nw, nh] = selectedBlock.bbox;
            const x = nx * coords.pageWidth;
            const y = ny * coords.pageHeight;
            const w = nw * coords.pageWidth;
            const h = nh * coords.pageHeight;
            const handles = selectionHandles(x, y, w, h);
            return (
              <>
                {handles.map(({ cx, cy, key }) => (
                  <Circle
                    key={key}
                    data-testid={`labeler-handle-${selectedBlock.id}-${key}`}
                    x={cx}
                    y={cy}
                    radius={5}
                    fill={resolveToken('--bg-surface', '#fff')}
                    stroke={resolveToken('--accent', 'rgba(93,159,223,1)')}
                    strokeWidth={1.5}
                    listening={false}
                    perfectDrawEnabled={false}
                  />
                ))}
              </>
            );
          },

          // ── hud: block count status ───────────────────────────────────────
          hud: ({ coords }) => {
            // HUD is a DOM layer — we render nothing in Konva hud and instead
            // use the DOM overlay below. Return null here.
            // (coords available if needed for future positioning)
            void coords;
            return null;
          },
        }}
      </PageImageCanvas>

      {/* DOM HUD overlays (outside Konva — easier to style and test) */}

      {/* Block count status */}
      <div
        data-testid="labeler-canvas-hud-status"
        aria-label="Block count"
        style={{
          position: 'absolute',
          bottom: 'var(--space-2, 8px)',
          left: 'var(--space-2, 8px)',
          padding: 'var(--space-1, 4px) var(--space-2, 8px)',
          background: 'var(--surface-overlay, rgba(0,0,0,0.6))',
          color: 'var(--text-on-dark, #fff)',
          borderRadius: 'var(--radius-sm, 4px)',
          fontSize: 'var(--text-xs, 11px)',
          pointerEvents: 'none',
        }}
      >
        {visibleBlockCount} block{visibleBlockCount !== 1 ? 's' : ''}
      </div>

      {/* LayerToggle HUD — pinned top-right */}
      <div
        data-testid="labeler-canvas-layer-toggle-hud"
        style={{
          position: 'absolute',
          top: 'var(--space-2, 8px)',
          right: 'var(--space-2, 8px)',
          pointerEvents: 'auto',
          zIndex: 10,
        }}
      >
        <LayerToggle visibility={layerVisibility} onChange={onLayerVisibilityChange} />
      </div>
    </div>
  );
}

LabelerCanvas.displayName = 'LabelerCanvas';
