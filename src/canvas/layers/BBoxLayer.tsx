/**
 * BBoxLayer — renders a Konva <Rect> for a single word's bounding box.
 *
 * Designed to be used as the `overlay` slot fill in `<PageImageCanvas>`:
 *
 * ```tsx
 * <PageImageCanvas ...>
 *   {{
 *     overlay: (p) => <BBoxLayer key={...} {...p} />,
 *   }}
 * </PageImageCanvas>
 * ```
 *
 * Colors are read from CSS custom properties so the caller controls theming.
 * All hex fallback values use design-system token names; no hard-coded palette.
 */

import { memo } from 'react';
import { Rect } from 'react-konva';
import type { WordSlotProps } from '../types';
import { bboxToRect } from '../types';
import { resolveToken } from '../resolveToken.js';
// WordSlotProps.word is CanvasWord (locally typed), not imported from generated types

interface BBoxLayerProps extends WordSlotProps {
  /** CSS color for the fill (default: var(--layer-word-fill)). */
  fill?: string;
  /** CSS color for the stroke (default: var(--layer-word-stroke)). */
  stroke?: string;
  /** Stroke width in pixels. Selected items use a wider stroke. */
  strokeWidth?: number;
  /** Stroke width when the word is selected. */
  selectedStrokeWidth?: number;
  /** Opacity when the item should be visually de-emphasised. */
  dimmedOpacity?: number;
  /** Whether this item is de-emphasised (e.g., mismatches-only filter). */
  dimmed?: boolean;
}

// Resolve design tokens once at module load (resolve-once-at-mount per OQ-1).
// These provide Konva-compatible resolved color strings; Konva cannot evaluate var().
const DEFAULT_WORD_FILL = resolveToken('--word', 'rgba(59,130,246,0.18)');
const DEFAULT_WORD_STROKE = resolveToken('--word', 'rgba(29,78,216,0.65)');

function BBoxLayerInner({
  word,
  isSelected,
  fill = DEFAULT_WORD_FILL,
  stroke = DEFAULT_WORD_STROKE,
  strokeWidth = 1,
  selectedStrokeWidth = 3,
  dimmedOpacity = 0.2,
  dimmed = false,
}: BBoxLayerProps) {
  const rect = bboxToRect(word.bounding_box);
  if (!rect) return null;

  const opacity = dimmed ? dimmedOpacity : 1;

  return (
    <Rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill={fill}
      stroke={stroke}
      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
      opacity={opacity}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
}

export const BBoxLayer = memo(BBoxLayerInner);
BBoxLayer.displayName = 'BBoxLayer';
