import type { CanvasRect } from './types';

export interface EncodedImageDims {
  src_width: number;
  src_height: number;
  display_width: number;
  display_height: number;
  scale: number;
}

export function isNormalizedRect(rect: CanvasRect): boolean {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.width >= 0 &&
    rect.height >= 0 &&
    rect.x <= 1 &&
    rect.y <= 1 &&
    rect.width <= 1 &&
    rect.height <= 1 &&
    rect.x + rect.width <= 1.000_001 &&
    rect.y + rect.height <= 1.000_001
  );
}

export function srcToDisplayRect(rect: CanvasRect, scale: number): CanvasRect {
  return {
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

export function displayToSrcRect(rect: CanvasRect, scale: number): CanvasRect {
  return {
    x: rect.x / scale,
    y: rect.y / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

export function rectToDisplay(rect: CanvasRect, encoded: EncodedImageDims): CanvasRect {
  if (isNormalizedRect(rect)) {
    return {
      x: rect.x * encoded.display_width,
      y: rect.y * encoded.display_height,
      width: rect.width * encoded.display_width,
      height: rect.height * encoded.display_height,
    };
  }

  return srcToDisplayRect(rect, encoded.scale);
}

export function rectItemsToDisplay<T extends { bbox: CanvasRect }>(
  items: readonly T[],
  encoded: EncodedImageDims | null,
): T[] {
  if (!encoded) return [...items];
  return items.map((item) => ({ ...item, bbox: rectToDisplay(item.bbox, encoded) }));
}
