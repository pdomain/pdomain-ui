/**
 * LabelerCanvas unit tests.
 *
 * Tests:
 *   - Renders the underlying PageImageCanvas (image-viewport testid present)
 *   - Block rects render in underlay when layerVisibility.blocks=true
 *   - layerVisibility.blocks=false hides block rects
 *   - Clicking a block rect fires onSelectBlock(id)
 *   - LayerToggle renders all 3 toggles (blocks/words/detections)
 *   - Toggling a layer fires onLayerVisibilityChange with updated map
 *   - data-testid forwards to outer wrapper
 *   - HUD shows visible block count
 *
 * react-konva is mocked (jsdom cannot run canvas renderer).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('react-konva', () => ({
  Stage: ({
    children,
    width,
    height,
    'data-testid': tid,
  }: {
    children?: React.ReactNode;
    width?: number;
    height?: number;
    'data-testid'?: string;
  }) => (
    <div data-testid={tid ?? 'konva-stage'} data-width={width} data-height={height}>
      {children}
    </div>
  ),
  Layer: ({ children, name }: { children?: React.ReactNode; name?: string }) => (
    <div data-layer-name={name}>{children}</div>
  ),
  Rect: ({
    'data-testid': tid,
    onClick,
    x,
    y,
    width,
    height,
  }: {
    'data-testid'?: string;
    onClick?: () => void;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => {
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Konva test double needs a click handler, not keyboard behavior */
    return (
      <div
        data-testid={tid}
        data-x={x}
        data-y={y}
        data-width={width}
        data-height={height}
        onClick={onClick}
      />
    );
    /* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  },
  Circle: ({ 'data-testid': tid, x, y }: { 'data-testid'?: string; x?: number; y?: number }) => (
    <div data-testid={tid ?? 'konva-circle'} data-x={x} data-y={y} />
  ),
  Image: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-image'} />
  ),
  Line: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-line'} />
  ),
}));

import { LabelerCanvas } from './LabelerCanvas.js';
import type { LabelerBlock, LayerVisibility } from './LabelerCanvas.js';

const ALL_LAYERS_ON: LayerVisibility = { blocks: true, words: true, detections: true };
const BLOCKS_OFF: LayerVisibility = { blocks: false, words: true, detections: true };

const SAMPLE_BLOCKS: LabelerBlock[] = [
  { id: 'b1', bbox: [0.1, 0.1, 0.3, 0.2], type: 'text' },
  { id: 'b2', bbox: [0.5, 0.4, 0.2, 0.15], type: 'heading' },
  { id: 'b3', bbox: [0.2, 0.7, 0.4, 0.1] },
];

const MIN_PROPS = {
  imageUrl: 'mock.png',
  pageWidth: 2400,
  pageHeight: 3200,
  blocks: SAMPLE_BLOCKS,
  layerVisibility: ALL_LAYERS_ON,
  onLayerVisibilityChange: vi.fn(),
};

describe('LabelerCanvas', () => {
  it('renders the underlying PageImageCanvas (image-viewport testid)', () => {
    render(<LabelerCanvas {...MIN_PROPS} />);
    expect(screen.getByTestId('image-viewport')).toBeInTheDocument();
  });

  it('renders outer wrapper with default data-testid', () => {
    render(<LabelerCanvas {...MIN_PROPS} />);
    expect(screen.getByTestId('labeler-canvas')).toBeInTheDocument();
  });

  it('forwards custom data-testid', () => {
    render(<LabelerCanvas {...MIN_PROPS} data-testid="my-labeler" />);
    expect(screen.getByTestId('my-labeler')).toBeInTheDocument();
    expect(screen.queryByTestId('labeler-canvas')).not.toBeInTheDocument();
  });

  it('block rects render when layerVisibility.blocks=true', () => {
    render(<LabelerCanvas {...MIN_PROPS} />);
    expect(screen.getByTestId('labeler-block-b1')).toBeInTheDocument();
    expect(screen.getByTestId('labeler-block-b2')).toBeInTheDocument();
    expect(screen.getByTestId('labeler-block-b3')).toBeInTheDocument();
  });

  it('block rects are hidden when layerVisibility.blocks=false', () => {
    render(<LabelerCanvas {...MIN_PROPS} layerVisibility={BLOCKS_OFF} />);
    expect(screen.queryByTestId('labeler-block-b1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('labeler-block-b2')).not.toBeInTheDocument();
  });

  it('clicking a block rect fires onSelectBlock with the block id', () => {
    const handleSelectBlock = vi.fn();
    render(<LabelerCanvas {...MIN_PROPS} onSelectBlock={handleSelectBlock} />);
    fireEvent.click(screen.getByTestId('labeler-block-b2'));
    expect(handleSelectBlock).toHaveBeenCalledWith('b2');
    expect(handleSelectBlock).toHaveBeenCalledTimes(1);
  });

  it('LayerToggle renders all 3 layer toggles', () => {
    render(<LabelerCanvas {...MIN_PROPS} />);
    expect(screen.getByTestId('labeler-layer-toggle-blocks')).toBeInTheDocument();
    expect(screen.getByTestId('labeler-layer-toggle-words')).toBeInTheDocument();
    expect(screen.getByTestId('labeler-layer-toggle-detections')).toBeInTheDocument();
  });

  it('toggling blocks layer fires onLayerVisibilityChange with updated map', () => {
    const handleChange = vi.fn();
    render(<LabelerCanvas {...MIN_PROPS} onLayerVisibilityChange={handleChange} />);
    // The Radix Switch renders as role="switch"
    // Find the switch inside the blocks toggle wrapper
    const blocksToggleWrapper = screen.getByTestId('labeler-layer-toggle-blocks');
    const switchEl = blocksToggleWrapper.querySelector('[role="switch"]');
    expect(switchEl).not.toBeNull();
    if (switchEl) {
      fireEvent.click(switchEl);
      expect(handleChange).toHaveBeenCalledTimes(1);
      const [nextVisibility] = handleChange.mock.calls[0] as [LayerVisibility];
      expect(nextVisibility.blocks).toBe(false);
      expect(nextVisibility.words).toBe(true);
      expect(nextVisibility.detections).toBe(true);
    }
  });

  it('HUD shows visible block count when blocks are on', () => {
    render(<LabelerCanvas {...MIN_PROPS} />);
    const hud = screen.getByTestId('labeler-canvas-hud-status');
    expect(hud.textContent).toContain('3');
  });

  it('HUD shows 0 blocks when layerVisibility.blocks=false', () => {
    render(<LabelerCanvas {...MIN_PROPS} layerVisibility={BLOCKS_OFF} />);
    const hud = screen.getByTestId('labeler-canvas-hud-status');
    expect(hud.textContent).toContain('0');
  });

  it('renders selection handles when selectedBlockId is set', () => {
    render(<LabelerCanvas {...MIN_PROPS} selectedBlockId="b1" />);
    // 8 handles: nw, n, ne, e, se, s, sw, w
    const handleKeys = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    for (const k of handleKeys) {
      expect(screen.getByTestId(`labeler-handle-b1-${k}`)).toBeInTheDocument();
    }
  });

  it('does not render selection handles when no selectedBlockId', () => {
    render(<LabelerCanvas {...MIN_PROPS} />);
    expect(screen.queryByTestId('labeler-handle-b1-nw')).not.toBeInTheDocument();
  });

  it('does not render selection handles for non-existent selectedBlockId', () => {
    render(<LabelerCanvas {...MIN_PROPS} selectedBlockId="nonexistent" />);
    expect(screen.queryByTestId('labeler-handle-nonexistent-nw')).not.toBeInTheDocument();
  });
});
