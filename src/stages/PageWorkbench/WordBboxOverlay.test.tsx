/**
 * WordBboxOverlay unit tests.
 *
 * Regression-guards against CSS-expression colors (var(--…) / color-mix(…))
 * being passed to Konva. Konva renders to HTML Canvas via the Canvas API,
 * which cannot parse CSS custom properties or color-mix(); unparseable colors
 * fall back to opaque black, obscuring the page underneath.
 *
 * react-konva is mocked (jsdom cannot run the canvas renderer).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-konva', () => ({
  Rect: ({
    'data-testid': tid,
    fill,
    stroke,
    x,
    y,
    width,
    height,
  }: {
    'data-testid'?: string;
    fill?: string;
    stroke?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => (
    <div
      data-testid={tid}
      data-fill={fill}
      data-stroke={stroke}
      data-x={x}
      data-y={y}
      data-w={width}
      data-h={height}
    />
  ),
}));

import { WordBboxOverlay, type WordBbox } from './WordBboxOverlay.js';
import type { CoordContext } from '../../canvas/types.js';

const COORDS: CoordContext = {
  pageWidth: 1000,
  pageHeight: 1200,
  scale: 1,
  stageWidth: 1000,
  stageHeight: 1200,
};

// Valid Canvas color strings: rgba(...), rgb(...), #rgb, #rrggbb, #rrggbbaa.
// Anything else (var(--…), color-mix(…), named colors that Konva strips, etc.)
// is rejected by this regex. This is the regression guard.
const CANVAS_COLOR_RE = /^(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})$/;

describe('WordBboxOverlay — Canvas-parseable colors', () => {
  const bboxes: WordBbox[] = [
    { id: 'a', bbox: [0.1, 0.1, 0.2, 0.05] },
    { id: 'b', bbox: [0.4, 0.2, 0.2, 0.05], selected: true },
  ];

  it('emits Canvas-parseable fill and stroke colors for unselected rects', () => {
    render(<WordBboxOverlay coords={COORDS} wordBboxes={bboxes} />);
    const rect = screen.getByTestId('word-bbox-a');
    expect(rect.dataset.fill).toMatch(CANVAS_COLOR_RE);
    expect(rect.dataset.stroke).toMatch(CANVAS_COLOR_RE);
    // Must not contain a CSS expression Konva cannot parse.
    expect(rect.dataset.fill ?? '').not.toMatch(/var\(|color-mix\(/);
    expect(rect.dataset.stroke ?? '').not.toMatch(/var\(|color-mix\(/);
  });

  it('emits Canvas-parseable fill and stroke colors for selected rects', () => {
    render(<WordBboxOverlay coords={COORDS} wordBboxes={bboxes} />);
    const rect = screen.getByTestId('word-bbox-b');
    expect(rect.dataset.fill).toMatch(CANVAS_COLOR_RE);
    expect(rect.dataset.stroke).toMatch(CANVAS_COLOR_RE);
    expect(rect.dataset.fill ?? '').not.toMatch(/var\(|color-mix\(/);
    expect(rect.dataset.stroke ?? '').not.toMatch(/var\(|color-mix\(/);
  });

  it('scales bbox geometry by pageWidth/pageHeight', () => {
    render(<WordBboxOverlay coords={COORDS} wordBboxes={bboxes} />);
    const rect = screen.getByTestId('word-bbox-a');
    expect(rect.dataset.x).toBe('100');
    expect(rect.dataset.y).toBe('120');
    expect(rect.dataset.w).toBe('200');
    expect(rect.dataset.h).toBe('60');
  });
});
