import { describe, expect, it } from 'vitest';

import {
  displayToSrcRect,
  isNormalizedRect,
  rectItemsToDisplay,
  rectToDisplay,
  srcToDisplayRect,
} from '../../src/canvas/geometry';

const encoded = {
  src_width: 1600,
  src_height: 2000,
  display_width: 800,
  display_height: 1000,
  scale: 0.5,
};

describe('canvas geometry helpers', () => {
  it('detects normalized rects', () => {
    expect(isNormalizedRect({ x: 0.25, y: 0.5, width: 0.25, height: 0.25 })).toBe(true);
    expect(isNormalizedRect({ x: 100, y: 200, width: 50, height: 20 })).toBe(false);
  });

  it('projects source-image rects into display space', () => {
    expect(srcToDisplayRect({ x: 100, y: 200, width: 50, height: 20 }, 0.5)).toEqual({
      x: 50,
      y: 100,
      width: 25,
      height: 10,
    });
  });

  it('projects display-space rects back into source-image space', () => {
    expect(displayToSrcRect({ x: 50, y: 100, width: 25, height: 10 }, 0.5)).toEqual({
      x: 100,
      y: 200,
      width: 50,
      height: 20,
    });
  });

  it('projects normalized rects directly against display dimensions', () => {
    expect(rectToDisplay({ x: 0.25, y: 0.5, width: 0.25, height: 0.25 }, encoded)).toEqual({
      x: 200,
      y: 500,
      width: 200,
      height: 250,
    });
  });

  it('projects item bboxes without mutating the input objects', () => {
    const item = { id: 'w0', bbox: { x: 100, y: 200, width: 50, height: 20 }, selected: true };
    const projected = rectItemsToDisplay([item], encoded);

    expect(projected).toEqual([
      { id: 'w0', bbox: { x: 50, y: 100, width: 25, height: 10 }, selected: true },
    ]);
    expect(projected[0]).not.toBe(item);
    expect(item.bbox).toEqual({ x: 100, y: 200, width: 50, height: 20 });
  });
});
