/**
 * Tests for canvas slot helper layers (M5.4):
 *   - BBoxLayer
 *   - WordHitLayer
 *   - MarqueeSelectLayer
 *
 * react-konva is mocked.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-konva', () => ({
  Stage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Layer: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Rect: ({
    x,
    y,
    width,
    height,
    opacity,
    strokeWidth,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
    strokeWidth?: number;
  }) => (
    <div
      data-testid="konva-rect"
      data-x={x}
      data-y={y}
      data-width={width}
      data-height={height}
      data-opacity={opacity}
      data-stroke-width={strokeWidth}
    />
  ),
}));

import { BBoxLayer } from '../../src/canvas/layers/BBoxLayer';
import { WordHitLayer } from '../../src/canvas/layers/WordHitLayer';
import { MarqueeSelectLayer } from '../../src/canvas/layers/MarqueeSelectLayer';
import type { SlotRenderProps, WordSlotProps, CanvasWord } from '../../src/canvas/types';

// ── Shared fixtures ───────────────────────────────────────────────────────────

const makeWord = (x: number, y: number, w: number, h: number) => ({
  bounding_box: {
    is_normalized: false,
    top_left: { is_normalized: false, x, y },
    bottom_right: { is_normalized: false, x: x + w, y: y + h },
  },
  text: 'test',
  ocr_confidence: 0.9,
  review: null,
  word_labels: [],
  text_style_labels: [],
});

const mockCoords = {
  scale: 1,
  stageWidth: 400,
  stageHeight: 600,
  pageWidth: 400,
  pageHeight: 600,
};

// pan and hover removed from SlotRenderProps (audit WS5 — not yet implemented).
const mockSlotProps: SlotRenderProps = {
  coords: mockCoords,
  selection: { ids: new Set() },
  zoom: 1,
};

function makeWordSlotProps(
  x: number,
  y: number,
  w: number,
  h: number,
  isSelected = false,
): WordSlotProps {
  return {
    ...mockSlotProps,
    word: makeWord(x, y, w, h),
    isSelected,
  };
}

// ── BBoxLayer ─────────────────────────────────────────────────────────────────

describe('BBoxLayer', () => {
  it('renders a Konva Rect at the word bounding_box coords', () => {
    render(<BBoxLayer {...makeWordSlotProps(10, 20, 50, 30)} />);
    const rect = screen.getByTestId('konva-rect');
    expect(rect.getAttribute('data-x')).toBe('10');
    expect(rect.getAttribute('data-y')).toBe('20');
    expect(rect.getAttribute('data-width')).toBe('50');
    expect(rect.getAttribute('data-height')).toBe('30');
  });

  it('renders at normal opacity when not dimmed', () => {
    render(<BBoxLayer {...makeWordSlotProps(0, 0, 40, 20)} />);
    const rect = screen.getByTestId('konva-rect');
    expect(rect.getAttribute('data-opacity')).toBe('1');
  });

  it('renders at dimmedOpacity when dimmed=true', () => {
    render(<BBoxLayer {...makeWordSlotProps(0, 0, 40, 20)} dimmed />);
    const rect = screen.getByTestId('konva-rect');
    expect(rect.getAttribute('data-opacity')).toBe('0.2');
  });

  it('uses selectedStrokeWidth when isSelected=true', () => {
    render(<BBoxLayer {...makeWordSlotProps(0, 0, 40, 20, true)} />);
    const rect = screen.getByTestId('konva-rect');
    expect(rect.getAttribute('data-stroke-width')).toBe('3');
  });

  it('uses normal strokeWidth when isSelected=false', () => {
    render(<BBoxLayer {...makeWordSlotProps(0, 0, 40, 20, false)} />);
    const rect = screen.getByTestId('konva-rect');
    expect(rect.getAttribute('data-stroke-width')).toBe('1');
  });

  it('returns null when bounding_box is null', () => {
    const wordWithNullBbox = {
      bounding_box: null as unknown as {
        is_normalized: boolean;
        top_left: { is_normalized: boolean; x: number; y: number };
        bottom_right: { is_normalized: boolean; x: number; y: number };
      },
      text: 'oops',
      ocr_confidence: null,
      review: null,
      word_labels: [],
      text_style_labels: [],
    };
    const { container } = render(
      <BBoxLayer {...mockSlotProps} word={wordWithNullBbox} isSelected={false} />,
    );
    expect(container.querySelector('[data-testid="konva-rect"]')).toBeNull();
  });
});

// ── WordHitLayer ──────────────────────────────────────────────────────────────

describe('WordHitLayer', () => {
  it('renders a Konva Rect at the word bounding_box coords', () => {
    render(<WordHitLayer {...makeWordSlotProps(5, 10, 80, 25)} />);
    const rect = screen.getByTestId('konva-rect');
    expect(rect.getAttribute('data-x')).toBe('5');
    expect(rect.getAttribute('data-y')).toBe('10');
    expect(rect.getAttribute('data-width')).toBe('80');
    expect(rect.getAttribute('data-height')).toBe('25');
  });
});

// ── MarqueeSelectLayer ────────────────────────────────────────────────────────

describe('MarqueeSelectLayer', () => {
  const w1 = makeWord(10, 20, 50, 20);
  const w2 = makeWord(100, 50, 60, 25);
  const words = [w1, w2];

  it('renders no rects when selection is empty', () => {
    const { container } = render(<MarqueeSelectLayer {...mockSlotProps} words={words} />);
    expect(container.querySelectorAll('[data-testid="konva-rect"]').length).toBe(0);
  });

  it('renders rects only for selected word IDs', () => {
    // default getWordId = "top_left.x,top_left.y"
    const sel = { ids: new Set(['10,20']) };
    render(<MarqueeSelectLayer {...mockSlotProps} selection={sel} words={words} />);
    const rects = screen.getAllByTestId('konva-rect');
    expect(rects.length).toBe(1);
    expect(rects[0]!.getAttribute('data-x')).toBe('10');
    expect(rects[0]!.getAttribute('data-y')).toBe('20');
  });

  it('renders all words when all are selected', () => {
    const sel = { ids: new Set(['10,20', '100,50']) };
    render(<MarqueeSelectLayer {...mockSlotProps} selection={sel} words={words} />);
    const rects = screen.getAllByTestId('konva-rect');
    expect(rects.length).toBe(2);
  });

  it('uses custom getWordId', () => {
    const getWordId = (w: CanvasWord) => w.text ?? '';
    const sel = { ids: new Set(['test']) };
    render(
      <MarqueeSelectLayer {...mockSlotProps} selection={sel} words={words} getWordId={getWordId} />,
    );
    // Both words have text='test', so both are "selected"
    const rects = screen.getAllByTestId('konva-rect');
    expect(rects.length).toBe(2);
  });
});
