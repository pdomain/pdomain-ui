/**
 * SplitOverlay — draggable vertical split line for before/after comparison.
 *
 * Exports two things consumers wire together in ArtifactViewer:
 *
 * 1. `SplitOverlay` React component — renders Konva shapes (Line + Rect) inside
 *    a PageImageCanvas slot function. Receives `coords` from SlotRenderProps.
 * 2. `SplitHandle` DOM component — the `role="separator"` sidecar rendered as
 *    a positioned div alongside the Stage for accessibility / Playwright testid.
 *
 * ArtifactViewer internally wires both. Consumers using a custom shell can
 * import and wire them directly.
 */

import { useState, useCallback } from 'react';
import { Line, Rect } from 'react-konva';
import type { CoordContext } from '../../canvas/types.js';
import { SPLIT_HANDLE } from '../../testids/index.js';

export interface SplitOverlayProps {
  /** Coordinate context from SlotRenderProps. */
  coords: CoordContext;
  /** Normalized split x position (0–1). */
  splitX: number;
  /** Called with new normalized x when user drags the handle. */
  onSplitXChange?: (x: number) => void;
}

/** Width (in page-space pixels) of the drag handle clickable zone. */
const HANDLE_HIT_WIDTH = 12;

/**
 * Konva shapes for the split overlay. Render inside a PageImageCanvas slot fn.
 */
export function SplitOverlay({ coords, splitX, onSplitXChange }: SplitOverlayProps) {
  const [dragging, setDragging] = useState(false);

  const xPx = splitX * coords.pageWidth;

  const handleDragMove = useCallback(
    (e: import('konva/lib/Node').KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos || !onSplitXChange) return;
      const scale = coords.scale ?? 1;
      const rawX = pos.x / scale;
      const clamped = Math.max(0, Math.min(1, rawX / coords.pageWidth));
      onSplitXChange(clamped);
    },
    [coords, onSplitXChange],
  );

  const handleDragEnd = useCallback(
    (e: import('konva/lib/Node').KonvaEventObject<MouseEvent>) => {
      setDragging(false);
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos || !onSplitXChange) return;
      const scale = coords.scale ?? 1;
      const rawX = pos.x / scale;
      const clamped = Math.max(0, Math.min(1, rawX / coords.pageWidth));
      onSplitXChange(clamped);
    },
    [coords, onSplitXChange],
  );

  return (
    <>
      {/* Vertical split line */}
      <Line
        points={[xPx, 0, xPx, coords.pageHeight]}
        stroke="var(--accent, #5d9fdf)"
        strokeWidth={2}
        dash={[6, 3]}
        listening={false}
        perfectDrawEnabled={false}
      />
      {/* Konva drag hit rect */}
      <Rect
        x={xPx - HANDLE_HIT_WIDTH / 2}
        y={0}
        width={HANDLE_HIT_WIDTH}
        height={coords.pageHeight}
        fill="transparent"
        draggable
        onDragStart={() => {
          setDragging(true);
        }}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        dragBoundFunc={(pos) => ({
          x: Math.max(0, Math.min(coords.stageWidth - HANDLE_HIT_WIDTH / 2, pos.x)),
          y: 0,
        })}
      />
      {/* Visual indicator dot when dragging */}
      {dragging && (
        <Rect
          x={xPx - 4}
          y={coords.pageHeight / 2 - 4}
          width={8}
          height={8}
          fill="var(--accent, #5d9fdf)"
          cornerRadius={4}
          listening={false}
        />
      )}
    </>
  );
}

SplitOverlay.displayName = 'SplitOverlay';

/**
 * DOM sidecar for accessibility: provides `role="separator"` + testid.
 * Rendered as a positioned div overlaying the split handle's x position.
 * `aria-valuenow` is the normalized x × 100.
 */
export interface SplitHandleProps {
  splitX: number;
  /** Total width of the canvas container in CSS px. */
  containerWidth: number;
}

export function SplitHandle({ splitX, containerWidth }: SplitHandleProps) {
  const leftPx = splitX * containerWidth;
  return (
    <div
      role="separator"
      aria-label="Split position"
      aria-valuenow={Math.round(splitX * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      data-testid={SPLIT_HANDLE}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: leftPx - HANDLE_HIT_WIDTH / 2,
        width: HANDLE_HIT_WIDTH,
        zIndex: 2,
        cursor: 'col-resize',
        pointerEvents: 'none', // Konva handles pointer events
      }}
    />
  );
}

SplitHandle.displayName = 'SplitHandle';
