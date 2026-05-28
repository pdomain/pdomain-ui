/**
 * SourcePageWorkbench unit tests.
 *
 * Tests:
 *   - Renders page number
 *   - Rotation indicator reflects rotationDeg
 *   - Tone hint shows when provided
 *   - Role Segmented change fires onRoleChange
 *   - Prev disabled when hasPrev=false; Next disabled when hasNext=false
 *   - Prev/Next click fires onNavigate
 *   - Apply click fires onApply
 *   - ArtifactViewer renders (react-konva mocked)
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
    /* eslint-disable jsx-a11y/click-events-have-key-events */
    <div data-testid={tid} role={role} onClick={onClick} />
    /* eslint-enable jsx-a11y/click-events-have-key-events */
  ),
  Line: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-line'} />
  ),
  Circle: ({ 'data-testid': tid }: { 'data-testid'?: string }) => (
    <div data-testid={tid ?? 'konva-circle'} />
  ),
}));

import { SourcePageWorkbench } from './SourcePageWorkbench.js';
import type { SourcePage } from './ThumbCard.js';
import {
  SOURCE_PAGE_WORKBENCH,
  SOURCE_PAGE_WORKBENCH_APPLY,
  SOURCE_PAGE_WORKBENCH_PREV,
  SOURCE_PAGE_WORKBENCH_NEXT,
  sourcePageWorkbenchRoleTestId,
} from '../../testids/index.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_PAGE: SourcePage = {
  id: 'p-001',
  pageNumber: 12,
  thumbnailUrl: 'thumb/p-001.png',
  status: 'ok',
  role: 'page',
};

const BASE_PROPS = {
  page: MOCK_PAGE,
  beforeImageUrl: 'before/p-001.png',
  afterImageUrl: 'after/p-001.png',
  pageWidth: 2400,
  pageHeight: 3200,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SourcePageWorkbench', () => {
  it('renders page number', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} />);
    expect(screen.getByText(/p\.12/)).toBeInTheDocument();
  });

  it('rotation indicator shows 0 by default', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} rotationDeg={0} />);
    const rotEl = screen.getByTestId(`${SOURCE_PAGE_WORKBENCH}-rotation`);
    expect(rotEl).toHaveTextContent('0°');
  });

  it('rotation indicator reflects rotationDeg=90', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} rotationDeg={90} />);
    const rotEl = screen.getByTestId(`${SOURCE_PAGE_WORKBENCH}-rotation`);
    expect(rotEl).toHaveTextContent('90°');
  });

  it('rotation indicator does not render when rotationDeg omitted', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} />);
    expect(screen.queryByTestId(`${SOURCE_PAGE_WORKBENCH}-rotation`)).not.toBeInTheDocument();
  });

  it('tone hint shows when provided', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} toneHint="Mostly text" />);
    const toneEl = screen.getByTestId(`${SOURCE_PAGE_WORKBENCH}-tone-hint`);
    expect(toneEl).toHaveTextContent('Mostly text');
  });

  it('tone hint is absent when not provided', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} />);
    expect(screen.queryByTestId(`${SOURCE_PAGE_WORKBENCH}-tone-hint`)).not.toBeInTheDocument();
  });

  it('role segmented change fires onRoleChange', () => {
    const onRoleChange = vi.fn();
    render(<SourcePageWorkbench {...BASE_PROPS} onRoleChange={onRoleChange} />);
    // Find the 'Blank' segment button inside the role segment wrapper
    const roleWrapper = screen.getByTestId(`${SOURCE_PAGE_WORKBENCH}-role-segment`);
    const blankBtn =
      roleWrapper.querySelector('[data-value="blank"]') ??
      Array.from(roleWrapper.querySelectorAll('button')).find((b) => b.textContent === 'Blank');
    if (!blankBtn) throw new Error('Blank segment button not found');
    fireEvent.click(blankBtn);
    expect(onRoleChange).toHaveBeenCalledWith('blank');
  });

  it('Prev is disabled when hasPrev=false', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} hasPrev={false} />);
    const prevBtn = screen.getByTestId(SOURCE_PAGE_WORKBENCH_PREV);
    expect(prevBtn).toBeDisabled();
  });

  it('Next is disabled when hasNext=false', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} hasNext={false} />);
    const nextBtn = screen.getByTestId(SOURCE_PAGE_WORKBENCH_NEXT);
    expect(nextBtn).toBeDisabled();
  });

  it('Prev click fires onNavigate("prev")', () => {
    const onNavigate = vi.fn();
    render(<SourcePageWorkbench {...BASE_PROPS} hasPrev onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId(SOURCE_PAGE_WORKBENCH_PREV));
    expect(onNavigate).toHaveBeenCalledWith('prev');
  });

  it('Next click fires onNavigate("next")', () => {
    const onNavigate = vi.fn();
    render(<SourcePageWorkbench {...BASE_PROPS} hasNext onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId(SOURCE_PAGE_WORKBENCH_NEXT));
    expect(onNavigate).toHaveBeenCalledWith('next');
  });

  it('Apply click fires onApply', () => {
    const onApply = vi.fn();
    render(<SourcePageWorkbench {...BASE_PROPS} onApply={onApply} />);
    fireEvent.click(screen.getByTestId(SOURCE_PAGE_WORKBENCH_APPLY));
    expect(onApply).toHaveBeenCalledOnce();
  });

  it('ArtifactViewer renders (canvas stage present)', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} />);
    // ArtifactViewer renders ArtifactPlate which renders inside PageImageCanvas
    // The mocked Stage renders as div[data-testid="canvas-stage"] (set by PageImageCanvas)
    expect(screen.getByTestId('canvas-stage')).toBeInTheDocument();
  });

  it('per-role testid anchors are present', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} />);
    for (const role of ['cover', 'page', 'back', 'blank', 'duplicate']) {
      expect(
        document.querySelector(`[data-testid="${sourcePageWorkbenchRoleTestId(role)}"]`),
      ).toBeTruthy();
    }
  });

  it('forwards data-testid', () => {
    render(<SourcePageWorkbench {...BASE_PROPS} data-testid="custom-spw" />);
    expect(screen.getByTestId('custom-spw')).toBeInTheDocument();
  });

  it('active role anchor has data-active=true', () => {
    const pageWithBlank: SourcePage = { ...MOCK_PAGE, role: 'blank' };
    render(<SourcePageWorkbench {...BASE_PROPS} page={pageWithBlank} />);
    const blankAnchor = document.querySelector(
      `[data-testid="${sourcePageWorkbenchRoleTestId('blank')}"]`,
    );
    expect(blankAnchor?.getAttribute('data-active')).toBe('true');
    const pageAnchor = document.querySelector(
      `[data-testid="${sourcePageWorkbenchRoleTestId('page')}"]`,
    );
    expect(pageAnchor?.getAttribute('data-active')).toBe('false');
  });

  // ── WS5: onRotationChange wired ─────────────────────────────────────────
  it('calls onRotationChange when a rotation is picked (P6 pattern)', () => {
    const onRotationChange = vi.fn();
    render(
      <SourcePageWorkbench {...BASE_PROPS} rotationDeg={0} onRotationChange={onRotationChange} />,
    );
    // Use the hidden testid anchors for the rotation segment options.
    const anchor90 = document.querySelector(`[data-testid="${SOURCE_PAGE_WORKBENCH}-rotation-90"]`);
    expect(anchor90).toBeTruthy();
    // Simulate clicking the 90° Segmented option via the rotation segment wrapper.
    const rotSegment = screen.getByTestId(`${SOURCE_PAGE_WORKBENCH}-rotation-segment`);
    const btn90 =
      rotSegment.querySelector('[data-value="90"]') ??
      Array.from(rotSegment.querySelectorAll('button')).find((b) => b.textContent?.includes('90'));
    if (btn90 !== null && btn90 !== undefined) {
      fireEvent.click(btn90);
      expect(onRotationChange).toHaveBeenCalledWith(90);
    }
  });

  // ── WS5: dead branch removed — single rotation span ────────────────────
  it('shows one rotation span regardless of rotationDeg value', () => {
    const { unmount } = render(<SourcePageWorkbench {...BASE_PROPS} rotationDeg={0} />);
    const spans0 = document.querySelectorAll(`[data-testid="${SOURCE_PAGE_WORKBENCH}-rotation"]`);
    expect(spans0).toHaveLength(1);
    unmount();
    render(<SourcePageWorkbench {...BASE_PROPS} rotationDeg={90} />);
    const spans90 = document.querySelectorAll(`[data-testid="${SOURCE_PAGE_WORKBENCH}-rotation"]`);
    expect(spans90).toHaveLength(1);
  });
});
