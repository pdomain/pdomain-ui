import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-konva', () => ({
  Rect: ({
    x,
    y,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    opacity,
    'data-testid': testId,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    'data-testid'?: string;
  }) => (
    <div
      data-testid={testId ?? 'konva-rect'}
      data-x={x}
      data-y={y}
      data-width={width}
      data-height={height}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-opacity={opacity}
    />
  ),
}));

import { RectOverlayLayer } from '../../src/canvas/layers/RectOverlayLayer';

const colors = {
  fill: 'rgba(1,2,3,0.2)',
  stroke: 'rgba(1,2,3,0.8)',
  strokeWidth: 1,
};

describe('RectOverlayLayer', () => {
  it('renders one rect per item with supplied color spec', () => {
    render(
      <RectOverlayLayer
        layer="words"
        colors={colors}
        items={[{ id: 'w0', bbox: { x: 10, y: 20, width: 30, height: 40 } }]}
      />,
    );

    const rect = screen.getByTestId('rect-overlay-words-w0');
    expect(rect).toHaveAttribute('data-x', '10');
    expect(rect).toHaveAttribute('data-y', '20');
    expect(rect).toHaveAttribute('data-width', '30');
    expect(rect).toHaveAttribute('data-height', '40');
    expect(rect).toHaveAttribute('data-fill', colors.fill);
    expect(rect).toHaveAttribute('data-stroke', colors.stroke);
    expect(rect).toHaveAttribute('data-stroke-width', '1');
  });

  it('uses the selection stroke width for selected items', () => {
    render(
      <RectOverlayLayer
        layer="selection-words"
        colors={colors}
        selectionStrokeWidth={3}
        items={[{ id: 'w0', bbox: { x: 10, y: 20, width: 30, height: 40 }, selected: true }]}
      />,
    );

    expect(screen.getByTestId('rect-overlay-selection-words-w0')).toHaveAttribute(
      'data-stroke-width',
      '3',
    );
  });

  it('renders the dev/test sidecar with item count', () => {
    render(
      <RectOverlayLayer
        layer="words"
        colors={colors}
        items={[
          { id: 'w0', bbox: { x: 10, y: 20, width: 30, height: 40 } },
          { id: 'w1', bbox: { x: 50, y: 60, width: 70, height: 80 } },
        ]}
      />,
    );

    expect(screen.getByTestId('bbox-overlay-words')).toHaveAttribute('data-item-count', '2');
  });

  it('does not render when hidden', () => {
    render(
      <RectOverlayLayer
        layer="words"
        colors={colors}
        items={[{ id: 'w0', bbox: { x: 10, y: 20, width: 30, height: 40 } }]}
        visible={false}
      />,
    );

    expect(screen.queryByTestId('rect-overlay-words-w0')).toBeNull();
    expect(screen.queryByTestId('bbox-overlay-words')).toBeNull();
  });
});
