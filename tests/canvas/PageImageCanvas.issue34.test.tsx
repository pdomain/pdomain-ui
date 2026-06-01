/**
 * Tests for PageImageCanvas image-load lifecycle — issue #34.
 *
 * Verifies:
 *   - Image renders when src loads successfully
 *   - Canvas clears (no stale image) immediately when src changes
 *   - Late-arriving loads from a prior src are ignored (source token)
 *   - Load errors clear the image (no stale image on error)
 *
 * react-konva is mocked (jsdom can't run canvas renderer).
 * window.Image is mocked to control load/error timing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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
    x,
    y,
    width,
    height,
    'data-testid': tid,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    'data-testid'?: string;
  }) => (
    <div
      data-testid={tid ?? 'konva-rect'}
      data-x={x}
      data-y={y}
      data-width={width}
      data-height={height}
    />
  ),
  Image: ({ image, 'data-testid': tid }: { image?: HTMLImageElement; 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-image'} data-src={image?.src} />
  ),
}));

// ── Controlled Image mock ─────────────────────────────────────────────────────

/**
 * Captures every `new Image()` call so tests can trigger load/error manually.
 * Returns the list of captured mock instances.
 */
type MockImageInstance = {
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  triggerLoad: () => void;
  triggerError: () => void;
};

let capturedImages: MockImageInstance[] = [];
let OriginalImage: typeof window.Image;

function setupImageMock() {
  capturedImages = [];
  OriginalImage = window.Image;

  class MockImage implements MockImageInstance {
    src = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor() {
      capturedImages.push(this);
    }

    triggerLoad() {
      this.onload?.();
    }

    triggerError() {
      this.onerror?.();
    }
  }

  window.Image = MockImage as unknown as typeof window.Image;
  return capturedImages;
}

function teardownImageMock() {
  window.Image = OriginalImage;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const page = {
  width: 400,
  height: 600,
  page_index: 0,
  name: 'page-0',
  image_path: '/page.png',
  items: [],
  review: null,
};

const words: never[] = [];

// ── Tests ─────────────────────────────────────────────────────────────────────

import { PageImageCanvas } from '../../src/canvas/PageImageCanvas';

describe('PageImageCanvas — image-load lifecycle (issue #34)', () => {
  beforeEach(() => {
    setupImageMock();
  });

  afterEach(() => {
    teardownImageMock();
  });

  it('renders the Konva Image after a successful load', () => {
    render(<PageImageCanvas src="/page-a.png" page={page} words={words} />);

    // Before load completes: no image element visible
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();

    // Trigger load
    const [img] = capturedImages;
    expect(img).toBeDefined();
    act(() => {
      img!.triggerLoad();
    });

    // After load: image is rendered
    expect(screen.getByTestId('konva-image')).toBeInTheDocument();
  });

  it('clears the image immediately when src changes before new load resolves', () => {
    const { rerender } = render(<PageImageCanvas src="/page-a.png" page={page} words={words} />);

    // Load first src
    act(() => {
      capturedImages[0]!.triggerLoad();
    });
    expect(screen.getByTestId('konva-image')).toBeInTheDocument();

    // Change src — image must be cleared immediately (stale image gone)
    rerender(<PageImageCanvas src="/page-b.png" page={page} words={words} />);

    // Image should be gone while the new src is still loading
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();
  });

  it('ignores a late load from a previous src (source token)', () => {
    const { rerender } = render(<PageImageCanvas src="/page-a.png" page={page} words={words} />);

    // Don't trigger load for /page-a.png yet — simulate in-flight
    const imgA = capturedImages[0]!;

    // Change src to /page-b.png
    rerender(<PageImageCanvas src="/page-b.png" page={page} words={words} />);

    // Now the stale load from /page-a.png arrives
    act(() => {
      imgA.triggerLoad();
    });

    // The image should NOT appear — it belongs to the old src
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();
  });

  it('clears the image when a load error occurs', () => {
    const { rerender } = render(<PageImageCanvas src="/page-a.png" page={page} words={words} />);

    // Load first src successfully
    act(() => {
      capturedImages[0]!.triggerLoad();
    });
    expect(screen.getByTestId('konva-image')).toBeInTheDocument();

    // Load a new src — immediately after change the image is cleared
    rerender(<PageImageCanvas src="/page-broken.png" page={page} words={words} />);
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();

    // The new load fails
    act(() => {
      capturedImages[1]!.triggerError();
    });

    // Image must remain absent after error — no stale image shown
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();
  });

  it('renders the correct image after src changes and new load succeeds', () => {
    const { rerender } = render(<PageImageCanvas src="/page-a.png" page={page} words={words} />);

    act(() => {
      capturedImages[0]!.triggerLoad();
    });
    expect(screen.getByTestId('konva-image')).toBeInTheDocument();

    rerender(<PageImageCanvas src="/page-b.png" page={page} words={words} />);

    // New image loads
    act(() => {
      capturedImages[1]!.triggerLoad();
    });

    // Now the image is back
    expect(screen.getByTestId('konva-image')).toBeInTheDocument();
  });
});
