import { describe, expect, it } from 'vitest';
import { clampZoom, resolveFitZoom } from './viewportMath.js';

describe('viewport math', () => {
  it('clamps zoom', () => {
    expect(clampZoom(0.1, 0.25, 4)).toBe(0.25);
    expect(clampZoom(8, 0.25, 4)).toBe(4);
    expect(clampZoom(1.5, 0.25, 4)).toBe(1.5);
  });

  it('resolves fit zoom', () => {
    expect(resolveFitZoom('none', { width: 100, height: 100 }, { width: 500, height: 300 })).toBe(
      1,
    );
    expect(
      resolveFitZoom('fit-width', { width: 100, height: 50 }, { width: 500, height: 300 }),
    ).toBe(5);
    expect(
      resolveFitZoom('fit-height', { width: 100, height: 50 }, { width: 500, height: 300 }),
    ).toBe(6);
    expect(
      resolveFitZoom('fit-page', { width: 100, height: 50 }, { width: 500, height: 300 }),
    ).toBe(5);
  });
});
