/**
 * PageViewer unit tests.
 *
 * Tests:
 *   - Renders with default testid
 *   - Mode toggle fires onModeChange (before → split → after)
 *   - ArtifactViewer renders (canvas-stage present via react-konva mock)
 *   - Re-run button fires onRerun when provided
 *   - Re-run button absent when onRerun not provided
 *   - Thumb click fires onThumbClick(id)
 *   - Active thumb has data-active='true'
 *   - Inactive thumb has data-active='false'
 *   - Thumb scroller absent when thumbs not provided
 *   - data-testid forwards
 *
 * react-konva is mocked (jsdom cannot run canvas renderer).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── react-konva mock (jsdom cannot run canvas renderer) ───────────────────────
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
  }: {
    'data-testid'?: string;
    role?: string;
    onClick?: () => void;
  }) => (
    /* eslint-disable jsx-a11y/click-events-have-key-events -- Konva test double needs a click handler, not keyboard behavior */
    <div data-testid={tid} role={role} onClick={onClick} />
    /* eslint-enable jsx-a11y/click-events-have-key-events */
  ),
  Line: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-line'} />
  ),
  Circle: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-circle'} />
  ),
  Image: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-image'} />
  ),
  Text: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-text'} />
  ),
}));

import { PageViewer } from './PageViewer.js';
import type { PageViewerPage, PageViewerThumb, PageViewerMode } from './PageViewer.js';
import { PAGE_VIEWER, PAGE_VIEWER_RERUN, pageViewerThumbTestId } from '../../testids/index.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_PAGE: PageViewerPage = {
  id: 'p-001',
  pageNumber: 5,
  beforeImageUrl: 'https://picsum.photos/seed/before/800/1040',
  afterImageUrl: 'https://picsum.photos/seed/after/800/1040',
  pageWidth: 2400,
  pageHeight: 3120,
};

const MOCK_THUMBS: PageViewerThumb[] = [
  { id: 'p-003', pageNumber: 3, thumbnailUrl: 'https://picsum.photos/seed/t3/120/160' },
  { id: 'p-004', pageNumber: 4, thumbnailUrl: 'https://picsum.photos/seed/t4/120/160' },
  { id: 'p-005', pageNumber: 5, thumbnailUrl: 'https://picsum.photos/seed/t5/120/160' },
  { id: 'p-006', pageNumber: 6, thumbnailUrl: 'https://picsum.photos/seed/t6/120/160' },
  { id: 'p-007', pageNumber: 7, thumbnailUrl: 'https://picsum.photos/seed/t7/120/160' },
];

const BASE_PROPS = {
  page: MOCK_PAGE,
  mode: 'after' as PageViewerMode,
  onModeChange: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PageViewer', () => {
  it('renders with default testid', () => {
    render(<PageViewer {...BASE_PROPS} />);
    expect(screen.getByTestId(PAGE_VIEWER)).toBeInTheDocument();
  });

  it('ArtifactViewer renders (canvas-stage present)', () => {
    render(<PageViewer {...BASE_PROPS} />);
    // PageImageCanvas's Stage renders as div[data-testid="canvas-stage"]
    expect(screen.getByTestId('canvas-stage')).toBeInTheDocument();
  });

  it('mode toggle fires onModeChange when Before clicked', () => {
    const onModeChange = vi.fn();
    render(<PageViewer {...BASE_PROPS} mode="after" onModeChange={onModeChange} />);
    const modeWrapper = screen.getByTestId(`${PAGE_VIEWER}-mode-toggle`);
    const beforeBtn = Array.from(modeWrapper.querySelectorAll('button')).find(
      (b) => b.textContent === 'Before',
    );
    if (!beforeBtn) throw new Error('Before button not found');
    fireEvent.click(beforeBtn);
    expect(onModeChange).toHaveBeenCalledWith('before');
  });

  it('mode toggle fires onModeChange when Split clicked', () => {
    const onModeChange = vi.fn();
    render(<PageViewer {...BASE_PROPS} mode="before" onModeChange={onModeChange} />);
    const modeWrapper = screen.getByTestId(`${PAGE_VIEWER}-mode-toggle`);
    const splitBtn = Array.from(modeWrapper.querySelectorAll('button')).find(
      (b) => b.textContent === 'Split',
    );
    if (!splitBtn) throw new Error('Split button not found');
    fireEvent.click(splitBtn);
    expect(onModeChange).toHaveBeenCalledWith('split');
  });

  it('mode toggle fires onModeChange when After clicked', () => {
    const onModeChange = vi.fn();
    render(<PageViewer {...BASE_PROPS} mode="split" onModeChange={onModeChange} />);
    const modeWrapper = screen.getByTestId(`${PAGE_VIEWER}-mode-toggle`);
    const afterBtn = Array.from(modeWrapper.querySelectorAll('button')).find(
      (b) => b.textContent === 'After',
    );
    if (!afterBtn) throw new Error('After button not found');
    fireEvent.click(afterBtn);
    expect(onModeChange).toHaveBeenCalledWith('after');
  });

  it('Re-run button fires onRerun when provided', () => {
    const onRerun = vi.fn();
    render(<PageViewer {...BASE_PROPS} onRerun={onRerun} />);
    const rerunBtn = screen.getByTestId(PAGE_VIEWER_RERUN);
    fireEvent.click(rerunBtn);
    expect(onRerun).toHaveBeenCalledOnce();
  });

  it('Re-run button absent when onRerun not provided', () => {
    render(<PageViewer {...BASE_PROPS} />);
    expect(screen.queryByTestId(PAGE_VIEWER_RERUN)).not.toBeInTheDocument();
  });

  it('thumb click fires onThumbClick with thumb id', () => {
    const onThumbClick = vi.fn();
    render(
      <PageViewer
        {...BASE_PROPS}
        thumbs={MOCK_THUMBS}
        activeThumbId="p-005"
        onThumbClick={onThumbClick}
      />,
    );
    const thumb4 = screen.getByTestId(pageViewerThumbTestId('p-004'));
    fireEvent.click(thumb4);
    expect(onThumbClick).toHaveBeenCalledWith('p-004');
  });

  it('active thumb has data-active=true', () => {
    render(<PageViewer {...BASE_PROPS} thumbs={MOCK_THUMBS} activeThumbId="p-005" />);
    const activeThumb = screen.getByTestId(pageViewerThumbTestId('p-005'));
    expect(activeThumb.getAttribute('data-active')).toBe('true');
  });

  it('inactive thumb has data-active=false', () => {
    render(<PageViewer {...BASE_PROPS} thumbs={MOCK_THUMBS} activeThumbId="p-005" />);
    const inactiveThumb = screen.getByTestId(pageViewerThumbTestId('p-004'));
    expect(inactiveThumb.getAttribute('data-active')).toBe('false');
  });

  it('thumb scroller absent when thumbs not provided', () => {
    render(<PageViewer {...BASE_PROPS} />);
    expect(screen.queryByTestId(`${PAGE_VIEWER}-thumb-scroller`)).not.toBeInTheDocument();
  });

  it('thumb scroller absent when thumbs is empty array', () => {
    render(<PageViewer {...BASE_PROPS} thumbs={[]} />);
    expect(screen.queryByTestId(`${PAGE_VIEWER}-thumb-scroller`)).not.toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    render(<PageViewer {...BASE_PROPS} data-testid="custom-pv" />);
    expect(screen.getByTestId('custom-pv')).toBeInTheDocument();
  });

  it('mode-toggle wrapper testid uses forwarded testid prefix', () => {
    render(<PageViewer {...BASE_PROPS} data-testid="custom-pv" />);
    expect(screen.getByTestId('custom-pv-mode-toggle')).toBeInTheDocument();
  });

  it('all thumbs render in scroller', () => {
    render(<PageViewer {...BASE_PROPS} thumbs={MOCK_THUMBS} activeThumbId="p-005" />);
    for (const thumb of MOCK_THUMBS) {
      expect(screen.getByTestId(pageViewerThumbTestId(thumb.id))).toBeInTheDocument();
    }
  });
});
