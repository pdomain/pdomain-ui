/**
 * RotateHandle — rotation handle for overlayMode='rotate'.
 *
 * Renders a circular drag handle at the top of the image.
 * Dragging rotates the image; `onRotationChange(deg)` fires with the new angle.
 *
 * Exposes `data-testid={ROTATE_HANDLE}` for Playwright.
 */

import { useState, useCallback } from 'react';
import { Circle, Line } from 'react-konva';
import type { CoordContext } from '../../canvas/types.js';
import { ROTATE_HANDLE } from '../../testids/index.js';

export interface RotateHandleProps {
  /** Coordinate context from SlotRenderProps. */
  coords: CoordContext;
  /** Current rotation angle in degrees. */
  rotationDeg: number;
  /** Called with new angle in degrees when user drags. */
  onRotationChange?: (deg: number) => void;
}

/** Radius of the circular handle in page-space pixels. */
const HANDLE_RADIUS = 10;

/** Offset from page top center to handle center — must stay inside stage. */
const HANDLE_OFFSET_Y = HANDLE_RADIUS + 4; // 14px from top edge, inside canvas

export function RotateHandle({ coords, rotationDeg, onRotationChange }: RotateHandleProps) {
  const [dragging, setDragging] = useState(false);

  const cx = coords.pageWidth / 2;
  // Place handle inside the stage (was -24, which clips off the top of the canvas).
  const cy = HANDLE_OFFSET_Y;

  // Compute handle visual position offset by current rotation angle.
  // The handle orbits a small arc around the top center of the image.
  const angleRad = (rotationDeg * Math.PI) / 180;
  const orbitRadius = 30;
  const handleX = cx + orbitRadius * Math.sin(angleRad);
  const handleY = cy + orbitRadius * (1 - Math.cos(angleRad));

  const handleDragMove = useCallback(
    (e: import('konva/lib/Node').KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos || !onRotationChange) return;
      const scale = coords.scale ?? 1;
      const px = pos.x / scale - cx;
      const py = pos.y / scale - coords.pageHeight / 2;
      const dragAngleRad = Math.atan2(px, -py);
      const dragAngleDeg = (dragAngleRad * 180) / Math.PI;
      onRotationChange(dragAngleDeg);
    },
    [coords, cx, onRotationChange],
  );

  return (
    <>
      {/* Stem line from image top center to handle */}
      <Line
        points={[cx, 0, handleX, handleY]}
        stroke="var(--accent, #5d9fdf)"
        strokeWidth={1.5}
        dash={[3, 2]}
        listening={false}
        perfectDrawEnabled={false}
      />
      {/* Circular handle — positioned at computed orbit point */}
      <Circle
        data-testid={ROTATE_HANDLE}
        x={handleX}
        y={handleY}
        radius={HANDLE_RADIUS}
        fill={dragging ? 'var(--accent, #5d9fdf)' : 'var(--bg-raised, #1e293b)'}
        stroke="var(--accent, #5d9fdf)"
        strokeWidth={2}
        draggable
        onDragStart={() => {
          setDragging(true);
        }}
        onDragMove={handleDragMove}
        onDragEnd={() => {
          setDragging(false);
        }}
        dragBoundFunc={(pos) => ({
          x: Math.max(HANDLE_RADIUS, Math.min(coords.stageWidth - HANDLE_RADIUS, pos.x)),
          y: Math.max(HANDLE_RADIUS, Math.min(coords.stageHeight - HANDLE_RADIUS, pos.y)),
        })}
        perfectDrawEnabled={false}
      />
    </>
  );
}

RotateHandle.displayName = 'RotateHandle';
