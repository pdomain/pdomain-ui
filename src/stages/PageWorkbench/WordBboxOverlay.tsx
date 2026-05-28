/**
 * WordBboxOverlay — per-word bounding-box rectangles.
 *
 * Renders Konva Rect shapes inside a PageImageCanvas slot fn (`overlay` or `selection`).
 * Each rect gets `data-testid="word-bbox-{id}"` and fires `onWordClick(id)` on click.
 *
 * Each bbox is normalized [x, y, w, h] relative to page dimensions.
 *
 * Note: this component is for overlaying WordBbox[] data directly, distinct from
 * the CanvasWord[] approach used by PageImageCanvas's built-in `words` prop.
 * It renders in the `selection` layer (with selectionLayerListening=true) so
 * click events reach the Konva shapes.
 */

import { Rect } from 'react-konva';
import type { CoordContext } from '../../canvas/types.js';
import { resolveToken } from '../../canvas/resolveToken.js';

export interface WordBbox {
  id: string;
  /** Normalized [x, y, w, h] relative to image dimensions. */
  bbox: [number, number, number, number];
  confidence?: number;
  selected?: boolean;
}

export interface WordBboxOverlayProps {
  /** Coordinate context from SlotRenderProps. */
  coords: CoordContext;
  /** Word bboxes to render. */
  wordBboxes: WordBbox[];
  /** Called when a word bbox rect is clicked. */
  onWordClick?: (id: string) => void;
}

export function WordBboxOverlay({ coords, wordBboxes, onWordClick }: WordBboxOverlayProps) {
  return (
    <>
      {wordBboxes.map((wb) => {
        const [nx, ny, nw, nh] = wb.bbox;
        const x = nx * coords.pageWidth;
        const y = ny * coords.pageHeight;
        const w = nw * coords.pageWidth;
        const h = nh * coords.pageHeight;

        const isSelected = wb.selected === true;
        // Konva renders to Canvas; CSS vars / color-mix() are unparseable here.
        // Resolve design-system tokens to concrete color strings at render time.
        // --accent (selected) and --exact (unselected, was --clean).
        const strokeColor = isSelected
          ? resolveToken('--accent', 'rgba(239,68,68,1)')
          : resolveToken('--exact', 'rgba(34,197,94,0.7)');
        const fillColor = isSelected
          ? resolveToken('--accent-subtle', 'rgba(239,68,68,0.18)')
          : resolveToken('--exact-subtle', 'rgba(34,197,94,0.12)');

        return (
          <Rect
            key={wb.id}
            data-testid={`word-bbox-${wb.id}`}
            x={x}
            y={y}
            width={w}
            height={h}
            stroke={strokeColor}
            strokeWidth={isSelected ? 1.5 : 1}
            fill={fillColor}
            listening={onWordClick !== undefined}
            onClick={() => {
              onWordClick?.(wb.id);
            }}
            onTap={() => {
              onWordClick?.(wb.id);
            }}
            perfectDrawEnabled={false}
          />
        );
      })}
    </>
  );
}

WordBboxOverlay.displayName = 'WordBboxOverlay';
