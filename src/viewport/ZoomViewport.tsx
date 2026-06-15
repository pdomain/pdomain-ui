import * as React from 'react';
import { cn } from '../primitives/cn.js';
import { clampZoom, resolveFitZoom } from './viewportMath.js';
import type { ViewportSize, ZoomFitMode } from './types.js';

const DEFAULT_MIN_ZOOM = 0.25;
const DEFAULT_MAX_ZOOM = 4;

export interface ZoomViewportProps {
  children: React.ReactNode;
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?(this: void, zoom: number): void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  fitMode?: ZoomFitMode;
  onFitModeChange?(this: void, mode: ZoomFitMode): void;
  contentSize?: ViewportSize;
  ariaLabel?: string;
  className?: string;
}

export function ZoomViewport(props: ZoomViewportProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const minZoom = props.minZoom ?? DEFAULT_MIN_ZOOM;
  const maxZoom = props.maxZoom ?? DEFAULT_MAX_ZOOM;
  const fitMode = props.fitMode ?? 'none';
  const [containerSize, setContainerSize] = React.useState<ViewportSize | null>(null);
  const [internalZoom] = React.useState(() => clampZoom(props.defaultZoom ?? 1, minZoom, maxZoom));

  React.useEffect(() => {
    const element = viewportRef.current;
    if (element === null) return undefined;

    const updateContainerSize = () => {
      setContainerSize({ width: element.clientWidth, height: element.clientHeight });
    };

    updateContainerSize();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry === undefined) return;
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  const baseZoom = props.zoom ?? internalZoom;
  const fitZoom =
    fitMode !== 'none' && props.contentSize !== undefined && containerSize !== null
      ? resolveFitZoom(fitMode, props.contentSize, containerSize)
      : baseZoom;
  const resolvedZoom = clampZoom(fitZoom, minZoom, maxZoom);
  const contentStyle: React.CSSProperties = {
    transform: `scale(${resolvedZoom})`,
  };

  if (props.contentSize !== undefined) {
    contentStyle.width = props.contentSize.width;
    contentStyle.height = props.contentSize.height;
  }

  return (
    <div
      ref={viewportRef}
      role={props.ariaLabel !== undefined ? 'region' : undefined}
      aria-label={props.ariaLabel}
      className={cn('pdui-zoom-viewport', props.className)}
      data-zoom={resolvedZoom}
    >
      <div className="pdui-zoom-viewport__content" style={contentStyle}>
        {props.children}
      </div>
    </div>
  );
}
