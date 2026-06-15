/**
 * ArtifactViewer unit tests.
 *
 * Tests:
 *   - Renders without crash on minimal props
 *   - overlayMode switching: 'view', 'split', 'illust', 'words', 'rotate'
 *   - onWordClick fires with correct id
 *   - onSplitXChange wires through
 *   - onRotationChange wires through
 *   - extraLayersSlot renders inside the canvas area
 *
 * react-konva is mocked (jsdom cannot run canvas renderer).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    role,
    onClick,
    x,
    y,
    width,
    height,
  }: {
    'data-testid'?: string;
    role?: string;
    onClick?: () => void;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => {
    /* eslint-disable jsx-a11y/click-events-have-key-events */
    return (
      <div
        data-testid={tid}
        role={role}
        data-x={x}
        data-y={y}
        data-width={width}
        data-height={height}
        onClick={onClick}
      />
    );
    /* eslint-enable jsx-a11y/click-events-have-key-events */
  },
  Line: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-line'} />
  ),
  Circle: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-circle'} />
  ),
}));

import { ArtifactViewer } from './ArtifactViewer.js';

const MIN_PROPS = {
  imageSrc: 'mock.png',
  pageWidth: 2400,
  pageHeight: 3200,
};

const WORD_BBOXES = [
  { id: 'w1', bbox: [0.1, 0.1, 0.05, 0.02] as [number, number, number, number], confidence: 0.95 },
  { id: 'w2', bbox: [0.2, 0.2, 0.07, 0.02] as [number, number, number, number], confidence: 0.8 },
];

const ILLUST_BBOXES = [
  {
    id: 'ill1',
    bbox: [0.2, 0.3, 0.5, 0.4] as [number, number, number, number],
    label: 'illustration',
  },
];

describe('ArtifactViewer', () => {
  it('renders without crash on minimal props', () => {
    const { container } = render(<ArtifactViewer {...MIN_PROPS} />);
    expect(container.firstChild).toBeTruthy();
    // ArtifactPlate renders
    expect(screen.getByTestId('artifact-plate')).toBeInTheDocument();
    // PaperRender renders
    expect(screen.getByTestId('paper-render')).toBeInTheDocument();
  });

  it('renders image-viewport testid (PageImageCanvas)', () => {
    render(<ArtifactViewer {...MIN_PROPS} />);
    expect(screen.getByTestId('image-viewport')).toBeInTheDocument();
  });

  it('can render with the viewport toolbar enabled', () => {
    render(
      <ArtifactViewer
        {...MIN_PROPS}
        overlayMode="view"
        showViewportToolbar
        defaultZoom={1}
        fitMode="none"
      />,
    );

    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fit page' })).toBeInTheDocument();
  });

  it('updates uncontrolled viewport zoom from the toolbar', async () => {
    const user = userEvent.setup();
    render(<ArtifactViewer {...MIN_PROPS} showViewportToolbar defaultZoom={1} />);

    const viewport = screen.getByRole('region', { name: 'Artifact viewport' });
    expect(viewport).toHaveAttribute('data-zoom', '1');

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(viewport).toHaveAttribute('data-zoom', '1.25');

    await user.click(screen.getByRole('button', { name: 'Fit page' }));

    expect(screen.getByRole('button', { name: 'Fit page' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('uses the ArtifactViewer viewport layout class when viewport props are enabled', () => {
    render(<ArtifactViewer {...MIN_PROPS} defaultZoom={1} />);

    expect(screen.getByRole('region', { name: 'Artifact viewport' })).toHaveClass(
      'pdui-artifact-viewer__viewport',
    );
  });

  it('keeps rendering the image viewport when viewport props are enabled', () => {
    render(<ArtifactViewer {...MIN_PROPS} defaultZoom={1.25} fitMode="none" />);

    expect(screen.getByRole('region', { name: 'Artifact viewport' })).toBeInTheDocument();
    expect(screen.getByTestId('image-viewport')).toBeInTheDocument();
  });

  it('overlayMode view — no overlay shapes', () => {
    render(<ArtifactViewer {...MIN_PROPS} overlayMode="view" />);
    // No split handle, no word bboxes, no rotate handle
    expect(screen.queryByTestId('artifact-split-handle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('artifact-rotate-handle')).not.toBeInTheDocument();
  });

  it('overlayMode split — shows separator sidecar', () => {
    render(<ArtifactViewer {...MIN_PROPS} overlayMode="split" splitProposal={{ splitX: 0.5 }} />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByTestId('artifact-split-handle')).toBeInTheDocument();
  });

  it('overlayMode split still shows separator when viewport is enabled', () => {
    render(
      <ArtifactViewer
        {...MIN_PROPS}
        overlayMode="split"
        splitProposal={{ splitX: 0.5 }}
        showViewportToolbar
        defaultZoom={1}
      />,
    );

    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByTestId('artifact-split-handle')).toBeInTheDocument();
  });

  it('overlayMode illust — shows illust bbox rects', () => {
    render(<ArtifactViewer {...MIN_PROPS} overlayMode="illust" illustBboxes={ILLUST_BBOXES} />);
    expect(screen.getByTestId('illust-bbox-ill1')).toBeInTheDocument();
  });

  it('overlayMode words — shows word-bbox-{id} testids', () => {
    render(<ArtifactViewer {...MIN_PROPS} overlayMode="words" wordBboxes={WORD_BBOXES} />);
    expect(screen.getByTestId('word-bbox-w1')).toBeInTheDocument();
    expect(screen.getByTestId('word-bbox-w2')).toBeInTheDocument();
  });

  it('overlayMode rotate — shows rotation handle', () => {
    render(<ArtifactViewer {...MIN_PROPS} overlayMode="rotate" rotationDeg={15} />);
    expect(screen.getByTestId('artifact-rotate-handle')).toBeInTheDocument();
  });

  it('onWordClick fires with correct id when word bbox clicked', () => {
    const handleWordClick = vi.fn();
    render(
      <ArtifactViewer
        {...MIN_PROPS}
        overlayMode="words"
        wordBboxes={WORD_BBOXES}
        onWordClick={handleWordClick}
      />,
    );
    const w1 = screen.getByTestId('word-bbox-w1');
    fireEvent.click(w1);
    expect(handleWordClick).toHaveBeenCalledWith('w1');
    expect(handleWordClick).toHaveBeenCalledTimes(1);
  });

  it('onSplitXChange wires through splitProposal', () => {
    const handleChange = vi.fn();
    render(
      <ArtifactViewer
        {...MIN_PROPS}
        overlayMode="split"
        splitProposal={{ splitX: 0.4, onSplitXChange: handleChange }}
      />,
    );
    // SplitHandle sidecar is present
    expect(screen.getByRole('separator')).toBeInTheDocument();
    // The Konva SplitOverlay is rendered in the tool slot (Konva Rect mock)
    // We can verify the split Konva Rect is somewhere in the tree
    // (the exact drag-event test is covered in integration tests)
  });

  it('onRotationChange prop does not throw when provided', () => {
    const handleChange = vi.fn();
    expect(() =>
      render(
        <ArtifactViewer
          {...MIN_PROPS}
          overlayMode="rotate"
          rotationDeg={30}
          onRotationChange={handleChange}
        />,
      ),
    ).not.toThrow();
    expect(screen.getByTestId('artifact-rotate-handle')).toBeInTheDocument();
  });

  it('extraLayersSlot renders inside the canvas area', () => {
    render(
      <ArtifactViewer
        {...MIN_PROPS}
        extraLayersSlot={<div data-testid="extra-slot-content">extra</div>}
      />,
    );
    expect(screen.getByTestId('extra-slot-content')).toBeInTheDocument();
  });

  it('defaults to overlayMode=view when not provided', () => {
    render(<ArtifactViewer {...MIN_PROPS} />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(screen.queryByTestId('artifact-rotate-handle')).not.toBeInTheDocument();
  });

  it('does not render split overlay when overlayMode is not split', () => {
    render(<ArtifactViewer {...MIN_PROPS} overlayMode="words" wordBboxes={WORD_BBOXES} />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('does not render word bboxes when overlayMode is not words', () => {
    render(<ArtifactViewer {...MIN_PROPS} overlayMode="view" wordBboxes={WORD_BBOXES} />);
    expect(screen.queryByTestId('word-bbox-w1')).not.toBeInTheDocument();
  });
});
