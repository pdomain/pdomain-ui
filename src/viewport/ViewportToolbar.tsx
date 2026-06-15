import * as React from 'react';
import { Minus, Plus, RefreshCw } from '../icons/lucide.js';
import { Button } from '../primitives/Button.js';
import { cn } from '../primitives/cn.js';
import { clampZoom } from './viewportMath.js';
import type { ZoomFitMode } from './types.js';

const DEFAULT_MIN_ZOOM = 0.25;
const DEFAULT_MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const DEFAULT_ARIA_LABEL = 'Viewport toolbar';

export interface ViewportToolbarProps {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange(this: void, zoom: number): void;
  fitMode?: ZoomFitMode;
  onFitModeChange?(this: void, mode: ZoomFitMode): void;
  actions?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function ViewportToolbar({
  zoom,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  onZoomChange,
  fitMode = 'none',
  onFitModeChange,
  actions,
  ariaLabel = DEFAULT_ARIA_LABEL,
  className,
}: ViewportToolbarProps) {
  const clampedZoom = clampZoom(zoom, minZoom, maxZoom);
  const resetZoom = clampZoom(1, minZoom, maxZoom);

  const setZoom = (value: number) => {
    onFitModeChange?.('none');
    onZoomChange(clampZoom(value, minZoom, maxZoom));
  };

  const setFitMode = (mode: ZoomFitMode) => {
    onFitModeChange?.(mode);
  };

  return (
    <div role="toolbar" aria-label={ariaLabel} className={cn('pdui-viewport-toolbar', className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<Minus size={14} />}
        disabled={clampedZoom <= minZoom}
        onClick={() => setZoom(zoom - ZOOM_STEP)}
      >
        Zoom out
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<Plus size={14} />}
        disabled={clampedZoom >= maxZoom}
        onClick={() => setZoom(zoom + ZOOM_STEP)}
      >
        Zoom in
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<RefreshCw size={14} />}
        disabled={fitMode === 'none' && clampedZoom === resetZoom}
        onClick={() => setZoom(resetZoom)}
      >
        Reset zoom
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={fitMode === 'fit-width'}
        disabled={onFitModeChange === undefined}
        onClick={() => setFitMode('fit-width')}
      >
        Fit width
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={fitMode === 'fit-height'}
        disabled={onFitModeChange === undefined}
        onClick={() => setFitMode('fit-height')}
      >
        Fit height
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={fitMode === 'fit-page'}
        disabled={onFitModeChange === undefined}
        onClick={() => setFitMode('fit-page')}
      >
        Fit page
      </Button>
      {actions}
    </div>
  );
}
