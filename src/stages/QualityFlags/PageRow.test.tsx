/**
 * PageRow — QualityFlags list-mode row tests.
 *
 * Covers:
 *  1. Root testid present
 *  2. data-page-id attribute echoes page.id
 *  3. Multiple flag chips render
 *  4. No-flags case renders fallback
 *  5. Score cells render with tone class via Badge
 *  6. Score tone thresholds: good (≥0.8 → exact), warn (≥0.5 → fuzzy), error (<0.5 → mismatch)
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageRow } from './PageRow.js';
import type { QualityPage, QualityPageFlag } from './PageRow.js';
import { QUALITY_PAGE_ROW, qualityPageRowScoreTestId } from '../../testids/index.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makePage = (overrides: Partial<QualityPage> = {}): QualityPage => ({
  id: 'p42',
  number: 42,
  ...overrides,
});

const makeFlag = (id: string, label?: string): QualityPageFlag => ({
  id,
  ...(label != null ? { label } : {}),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PageRow', () => {
  it('renders with root testid', () => {
    render(<PageRow page={makePage()} />);
    expect(screen.getByTestId(QUALITY_PAGE_ROW)).toBeTruthy();
  });

  it('data-page-id attribute echoes page.id', () => {
    render(<PageRow page={makePage({ id: 'abc-123' })} />);
    const root = screen.getByTestId(QUALITY_PAGE_ROW);
    expect(root.getAttribute('data-page-id')).toBe('abc-123');
  });

  it('renders page number', () => {
    render(<PageRow page={makePage({ number: 77 })} />);
    expect(screen.getByText('77')).toBeTruthy();
  });

  it('renders multiple flag chips', () => {
    const flags: QualityPageFlag[] = [
      makeFlag('blurry'),
      makeFlag('skew'),
      makeFlag('dark', 'Dark page'),
    ];
    render(<PageRow page={makePage()} flags={flags} />);
    // FlagChip renders a label span — check label text or kind fallback
    expect(screen.getByText('blurry')).toBeTruthy();
    expect(screen.getByText('skew')).toBeTruthy();
    expect(screen.getByText('Dark page')).toBeTruthy();
  });

  it('renders fallback dash when no flags provided', () => {
    render(<PageRow page={makePage()} flags={[]} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('renders fallback dash when flags prop omitted', () => {
    render(<PageRow page={makePage()} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  describe('score cells', () => {
    it('renders score cells when page has scores', () => {
      const page = makePage({ id: 'p1', scores: { ocr: 0.95 } });
      render(<PageRow page={page} />);
      const cell = screen.getByTestId(qualityPageRowScoreTestId('p1', 'ocr'));
      expect(cell).toBeTruthy();
      expect(cell.textContent).toBe('95%');
    });

    it('applies exact tone for score >= 0.8', () => {
      const page = makePage({ id: 'p1', scores: { quality: 0.9 } });
      render(<PageRow page={page} />);
      const cell = screen.getByTestId(qualityPageRowScoreTestId('p1', 'quality'));
      expect(cell.className).toContain('badge--tone-exact');
    });

    it('applies fuzzy tone for score >= 0.5 and < 0.8', () => {
      const page = makePage({ id: 'p1', scores: { quality: 0.6 } });
      render(<PageRow page={page} />);
      const cell = screen.getByTestId(qualityPageRowScoreTestId('p1', 'quality'));
      expect(cell.className).toContain('badge--tone-fuzzy');
    });

    it('applies mismatch tone for score < 0.5', () => {
      const page = makePage({ id: 'p1', scores: { quality: 0.3 } });
      render(<PageRow page={page} />);
      const cell = screen.getByTestId(qualityPageRowScoreTestId('p1', 'quality'));
      expect(cell.className).toContain('badge--tone-mismatch');
    });

    it('renders multiple score cells', () => {
      const page = makePage({ id: 'p1', scores: { ocr: 0.9, deskew: 0.7, noise: 0.2 } });
      render(<PageRow page={page} />);
      expect(screen.getByTestId(qualityPageRowScoreTestId('p1', 'ocr'))).toBeTruthy();
      expect(screen.getByTestId(qualityPageRowScoreTestId('p1', 'deskew'))).toBeTruthy();
      expect(screen.getByTestId(qualityPageRowScoreTestId('p1', 'noise'))).toBeTruthy();
    });

    it('does not render score section when no scores', () => {
      const page = makePage({ id: 'p1' });
      render(<PageRow page={page} />);
      // Should not find any score testid
      expect(document.querySelector('[data-testid^="quality-page-row-score-"]')).toBeNull();
    });
  });

  // ── WS6: valid ARIA — listitem not bare role=row ──────────────────────────

  it('root has role=listitem (valid ARIA — not bare role=row)', () => {
    render(<PageRow page={makePage()} />);
    expect(screen.getByRole('listitem')).toBeTruthy();
  });

  it('root does NOT have role=row (invalid without grid/rowgroup)', () => {
    const { container } = render(<PageRow page={makePage()} />);
    const rowEl = container.querySelector('[role="row"]');
    expect(rowEl).toBeNull();
  });
});
