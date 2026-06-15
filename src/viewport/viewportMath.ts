import type { ViewportSize, ZoomFitMode } from './types.js';

export function clampZoom(value: number, minZoom: number, maxZoom: number) {
  return Math.min(maxZoom, Math.max(minZoom, value));
}

export function resolveFitZoom(mode: ZoomFitMode, content: ViewportSize, container: ViewportSize) {
  if (mode === 'none' || content.width <= 0 || content.height <= 0) return 1;
  const widthZoom = container.width / content.width;
  const heightZoom = container.height / content.height;
  if (mode === 'fit-width') return widthZoom;
  if (mode === 'fit-height') return heightZoom;
  return Math.min(widthZoom, heightZoom);
}
