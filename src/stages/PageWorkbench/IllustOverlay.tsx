/**
 * IllustOverlay — illustration bbox highlight rectangles.
 *
 * Renders Konva Rect shapes inside a PageImageCanvas slot fn (`underlay`).
 * Bboxes are decoration (non-interactive highlights), so `underlay` is
 * appropriate — they render above the image but below word overlays.
 *
 * Each bbox is normalized [x, y, w, h] relative to page dimensions.
 */

import { Rect } from 'react-konva';
import type { CoordContext } from '../../canvas/types.js';
import { resolveToken } from '../../canvas/resolveToken.js';

export interface IllustBbox {
  id: string;
  /** Normalized [x, y, w, h] relative to image dimensions. */
  bbox: [number, number, number, number];
  label?: string;
}

export interface IllustOverlayProps {
  /** Coordinate context from SlotRenderProps. */
  coords: CoordContext;
  /** Illustration bboxes to highlight. */
  illustBboxes: IllustBbox[];
}

export function IllustOverlay({ coords, illustBboxes }: IllustOverlayProps) {
  return (
    <>
      {illustBboxes.map((ill) => {
        const [nx, ny, nw, nh] = ill.bbox;
        const x = nx * coords.pageWidth;
        const y = ny * coords.pageHeight;
        const w = nw * coords.pageWidth;
        const h = nh * coords.pageHeight;
        // Resolve --ocr (remapped from --info per §0.2) for Konva canvas rendering.
        const ocrColor = resolveToken('--ocr', 'rgba(14,165,233,1)');
        const ocrFill = resolveToken('--ocr-subtle', 'rgba(14,165,233,0.12)');
        return (
          <Rect
            key={ill.id}
            data-testid={`illust-bbox-${ill.id}`}
            x={x}
            y={y}
            width={w}
            height={h}
            stroke={ocrColor}
            strokeWidth={2}
            fill={ocrFill}
            cornerRadius={2}
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      })}
    </>
  );
}

IllustOverlay.displayName = 'IllustOverlay';
