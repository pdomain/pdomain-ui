import { memo } from 'react';
import { Rect } from 'react-konva';
import type { CanvasRect } from '../types';

export interface RectOverlayColorSpec {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface RectOverlayItem {
  id: string;
  bbox: CanvasRect;
  selected?: boolean;
  dimmed?: boolean;
}

export interface RectOverlayLayerProps {
  layer: string;
  items: readonly RectOverlayItem[];
  colors: RectOverlayColorSpec;
  visible?: boolean;
  dimmed?: boolean;
  selectionStrokeWidth?: number;
  layerDimmedOpacity?: number;
  itemDimmedOpacity?: number;
  sidecarTestIdPrefix?: string;
}

function RectOverlayLayerInner({
  layer,
  items,
  colors,
  visible = true,
  dimmed = false,
  selectionStrokeWidth = 3,
  layerDimmedOpacity = 0.3,
  itemDimmedOpacity = 0.2,
  sidecarTestIdPrefix = 'bbox-overlay',
}: RectOverlayLayerProps) {
  if (!visible) return null;

  const layerOpacity = dimmed ? layerDimmedOpacity : 1;

  return (
    <>
      {items.map((item) => {
        const opacity = item.dimmed ? itemDimmedOpacity : layerOpacity;
        return (
          <Rect
            key={item.id}
            data-testid={`rect-overlay-${layer}-${item.id}`}
            x={item.bbox.x}
            y={item.bbox.y}
            width={item.bbox.width}
            height={item.bbox.height}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={item.selected ? selectionStrokeWidth : colors.strokeWidth}
            opacity={opacity}
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      })}
      <div
        key={`${sidecarTestIdPrefix}-${layer}-sidecar`}
        data-testid={`${sidecarTestIdPrefix}-${layer}`}
        data-layer={layer}
        data-item-count={items.length}
        data-dimmed={dimmed ? 'true' : undefined}
        style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}
        aria-hidden="true"
      />
    </>
  );
}

export const RectOverlayLayer = memo(RectOverlayLayerInner);
RectOverlayLayer.displayName = 'RectOverlayLayer';
