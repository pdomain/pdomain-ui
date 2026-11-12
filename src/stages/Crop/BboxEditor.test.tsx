/**
 * BboxEditor unit tests.
 *
 * Tests:
 *   - All 4 margin inputs render with correct values
 *   - Editing a margin fires onMarginsChange with updated margins
 *   - Unit toggle fires onUnitChange
 *   - Scope toggle fires onScopeChange
 *   - Apply button fires onApply
 *   - Delta-from-default text reflects margins - defaultMargins
 *   - ArtifactViewer mock renders (canvas-stage present via react-konva mock)
 *   - Selected (N) scope label uses selectedCount
 *   - All flagged (N) scope label uses flaggedCount
 *   - data-testid forwards
 *   - No change delta when margins === defaultMargins
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
}));

// ── useImage mock ──────────────────────────────────────────────────────────────
vi.mock('use-image', () => ({
  default: () => [null, 'loading'] as const,
}));

import { BboxEditor } from './BboxEditor.js';
import type { BboxEditorPage, BboxMargins } from './BboxEditor.js';
import { bboxEditorMarginTestId, BBOX_EDITOR, BBOX_EDITOR_APPLY } from '../../testids/index.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DEFAULT_MARGINS: BboxMargins = { top: 10, right: 10, bottom: 10, left: 10 };

const PAGE: BboxEditorPage = {
  id: 'p1',
  pageNumber: 1,
  imageUrl: 'https://example.com/page1.png',
  pageWidth: 800,
  pageHeight: 1100,
  defaultMargins: DEFAULT_MARGINS,
};

const MARGINS: BboxMargins = { top: 20, right: 15, bottom: 12, left: 8 };

function renderEditor(overrides: Partial<React.ComponentProps<typeof BboxEditor>> = {}) {
  const onMarginsChange = vi.fn();
  const onUnitChange = vi.fn();
  const onScopeChange = vi.fn();
  const onApply = vi.fn();

  const utils = render(
    <BboxEditor
      page={PAGE}
      margins={MARGINS}
      onMarginsChange={onMarginsChange}
      unit="px"
      onUnitChange={onUnitChange}
      scope="thisPage"
      onScopeChange={onScopeChange}
      onApply={onApply}
      {...overrides}
    />,
  );

  return { ...utils, onMarginsChange, onUnitChange, onScopeChange, onApply };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BboxEditor', () => {
  it('renders all 4 margin inputs with correct values', () => {
    renderEditor();

    const topInput = screen.getByTestId(bboxEditorMarginTestId('top'));
    const rightInput = screen.getByTestId(bboxEditorMarginTestId('right'));
    const bottomInput = screen.getByTestId(bboxEditorMarginTestId('bottom'));
    const leftInput = screen.getByTestId(bboxEditorMarginTestId('left'));

    expect((topInput as HTMLInputElement).value).toBe('20');
    expect((rightInput as HTMLInputElement).value).toBe('15');
    expect((bottomInput as HTMLInputElement).value).toBe('12');
    expect((leftInput as HTMLInputElement).value).toBe('8');
  });

  it('fires onMarginsChange with updated top margin', () => {
    const { onMarginsChange } = renderEditor();
    const topInput = screen.getByTestId(bboxEditorMarginTestId('top'));
    fireEvent.change(topInput, { target: { value: '30' } });
    expect(onMarginsChange).toHaveBeenCalledWith({
      top: 30,
      right: 15,
      bottom: 12,
      left: 8,
    });
  });

  it('fires onMarginsChange with updated right margin', () => {
    const { onMarginsChange } = renderEditor();
    const rightInput = screen.getByTestId(bboxEditorMarginTestId('right'));
    fireEvent.change(rightInput, { target: { value: '25' } });
    expect(onMarginsChange).toHaveBeenCalledWith({
      top: 20,
      right: 25,
      bottom: 12,
      left: 8,
    });
  });

  it('fires onMarginsChange with updated bottom margin', () => {
    const { onMarginsChange } = renderEditor();
    const bottomInput = screen.getByTestId(bboxEditorMarginTestId('bottom'));
    fireEvent.change(bottomInput, { target: { value: '5' } });
    expect(onMarginsChange).toHaveBeenCalledWith({
      top: 20,
      right: 15,
      bottom: 5,
      left: 8,
    });
  });

  it('fires onMarginsChange with updated left margin', () => {
    const { onMarginsChange } = renderEditor();
    const leftInput = screen.getByTestId(bboxEditorMarginTestId('left'));
    fireEvent.change(leftInput, { target: { value: '3' } });
    expect(onMarginsChange).toHaveBeenCalledWith({
      top: 20,
      right: 15,
      bottom: 12,
      left: 3,
    });
  });

  it('does not fire onMarginsChange for non-numeric input', () => {
    const { onMarginsChange } = renderEditor();
    const topInput = screen.getByTestId(bboxEditorMarginTestId('top'));
    fireEvent.change(topInput, { target: { value: 'abc' } });
    expect(onMarginsChange).not.toHaveBeenCalled();
  });

  it('fires onUnitChange when unit toggle is clicked', () => {
    const { onUnitChange } = renderEditor();
    // Click the % segment
    const percentBtn = screen.getByRole('radio', { name: '%' });
    fireEvent.click(percentBtn);
    expect(onUnitChange).toHaveBeenCalledWith('percent');
  });

  it('fires onScopeChange when scope toggle changes', () => {
    const { onScopeChange } = renderEditor();
    const selectedBtn = screen.getByRole('radio', { name: 'Selected' });
    fireEvent.click(selectedBtn);
    expect(onScopeChange).toHaveBeenCalledWith('selectedN');
  });

  it('fires onApply when apply button is clicked', () => {
    const { onApply } = renderEditor();
    const applyBtn = screen.getByTestId(BBOX_EDITOR_APPLY);
    fireEvent.click(applyBtn);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('shows delta text reflecting margins - defaultMargins', () => {
    renderEditor();
    // MARGINS = { top:20, right:15, bottom:12, left:8 }
    // DEFAULT_MARGINS = { top:10, right:10, bottom:10, left:10 }
    // deltas: top+10px, right+5px, bottom+2px, left-2px
    const deltaEl = screen.getByText(/Δ/);
    expect(deltaEl.textContent).toContain('+10px top');
    expect(deltaEl.textContent).toContain('+5px right');
    expect(deltaEl.textContent).toContain('+2px bottom');
    expect(deltaEl.textContent).toContain('-2px left');
  });

  it('shows "No change from default" when margins equal defaultMargins', () => {
    renderEditor({ margins: DEFAULT_MARGINS });
    expect(screen.getByText('No change from default')).toBeDefined();
  });

  it('renders delta with percent suffix when unit=percent', () => {
    renderEditor({ unit: 'percent', margins: { top: 15, right: 10, bottom: 10, left: 10 } });
    const deltaEl = screen.getByText(/Δ/);
    expect(deltaEl.textContent).toContain('+5% top');
  });

  it('renders ArtifactViewer (image-viewport present via react-konva mock)', () => {
    renderEditor();
    // PageImageCanvas renders a div[data-testid="image-viewport"] even with the
    // react-konva Stage mock in place.
    expect(screen.getByTestId('image-viewport')).toBeDefined();
  });

  it('uses selectedCount in scope label', () => {
    renderEditor({ selectedCount: 5 });
    expect(screen.getByRole('radio', { name: 'Selected (5)' })).toBeDefined();
  });

  it('uses flaggedCount in scope label', () => {
    renderEditor({ flaggedCount: 12 });
    expect(screen.getByRole('radio', { name: 'All flagged (12)' })).toBeDefined();
  });

  it('forwards data-testid', () => {
    renderEditor({ 'data-testid': 'custom-editor' });
    expect(screen.getByTestId('custom-editor')).toBeDefined();
  });

  it('uses default data-testid when not provided', () => {
    renderEditor();
    expect(screen.getByTestId(BBOX_EDITOR)).toBeDefined();
  });

  it('renders 8 handle dots', () => {
    renderEditor();
    const handles = document.querySelectorAll('[data-handle]');
    expect(handles).toHaveLength(8);
  });
});
