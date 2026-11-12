/**
 * ArtifactViewer cross-consumer integration test.
 *
 * Exercises both consumer shapes as defined in spec §8:
 *   - pdomain-prep-for-pgdp: overlayMode='split' with splitProposal
 *   - pdomain-ocr-labeler-spa: overlayMode='words' with wordBboxes + onWordClick
 *
 * Uses the standard react-konva mock pattern (vi.mock before imports).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    /* eslint-disable jsx-a11y/click-events-have-key-events -- Konva test double needs a click handler, not keyboard behavior */
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
  Line: () => <div data-testid="konva-line" />,
  Circle: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-circle'} />
  ),
}));

import { ArtifactViewer } from './ArtifactViewer.js';

describe('ArtifactViewer cross-consumer integration', () => {
  it('pdomain-prep-for-pgdp shape: split mode renders role="separator"', () => {
    render(
      <ArtifactViewer
        imageSrc="mock.png"
        pageWidth={2400}
        pageHeight={3200}
        overlayMode="split"
        splitProposal={{ splitX: 0.5 }}
      />,
    );
    // Spec §8 exact assertion:
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('pdomain-ocr-labeler-spa shape: words mode renders word-bbox-{id}', () => {
    render(
      <ArtifactViewer
        imageSrc="mock.png"
        pageWidth={2400}
        pageHeight={3200}
        overlayMode="words"
        wordBboxes={[{ id: 'w1', bbox: [0.1, 0.1, 0.05, 0.02], confidence: 0.95 }]}
        onWordClick={vi.fn()}
      />,
    );
    // Spec §8 exact assertion:
    expect(screen.getByTestId('word-bbox-w1')).toBeInTheDocument();
  });

  it('both consumers can render in the same test run without interference', () => {
    const { unmount } = render(
      <ArtifactViewer
        imageSrc="a.png"
        pageWidth={2400}
        pageHeight={3200}
        overlayMode="split"
        splitProposal={{ splitX: 0.3 }}
      />,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
    unmount();

    render(
      <ArtifactViewer
        imageSrc="b.png"
        pageWidth={2400}
        pageHeight={3200}
        overlayMode="words"
        wordBboxes={[{ id: 'abc', bbox: [0.0, 0.0, 0.1, 0.1] }]}
      />,
    );
    expect(screen.getByTestId('word-bbox-abc')).toBeInTheDocument();
  });
});
