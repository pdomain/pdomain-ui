import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageThumb } from './PageThumb.js';
import { QUALITY_PAGE_THUMB, qualityPageThumbTestId } from '../../testids/index.js';

const page = { id: 'p1', number: 3, thumbnailUrl: 'http://example.com/p1.png' };

describe('PageThumb', () => {
  it('renders thumbnail image with correct src', () => {
    render(<PageThumb page={page} flags={[]} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'http://example.com/p1.png');
  });

  it('renders page number in bottom bar', () => {
    render(<PageThumb page={page} flags={[]} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders a flag chip for each flag', () => {
    const flags = [
      { id: 'f1', label: 'blurry' },
      { id: 'f2', label: 'skew' },
      { id: 'f3', label: 'dark' },
    ];
    render(<PageThumb page={page} flags={flags} />);
    expect(screen.getByText('blurry')).toBeInTheDocument();
    expect(screen.getByText('skew')).toBeInTheDocument();
    expect(screen.getByText('dark')).toBeInTheDocument();
  });

  it('renders an overflow badge when flags exceed max', () => {
    const flags = Array.from({ length: 5 }, (_, i) => ({
      id: `f${i}`,
      label: `flag-${i}`,
    }));
    render(<PageThumb page={page} flags={flags} />);
    // Default maxFlags is 3 — so we expect a +2 overflow badge
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('unselected: root is a div, no selection ring', () => {
    const { container } = render(<PageThumb page={page} flags={[]} />);
    // No onSelect — should be a div
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).not.toHaveAttribute('aria-pressed');
  });

  it('selected: data-selected attribute is set', () => {
    const { container } = render(<PageThumb page={page} flags={[]} selected />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-selected', 'true');
  });

  it('when onSelect provided, root becomes a button with aria-pressed', () => {
    const { container } = render(<PageThumb page={page} flags={[]} onSelect={() => undefined} />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('aria-pressed', 'false');
  });

  it('when onSelect provided and selected, aria-pressed is true', () => {
    const { container } = render(
      <PageThumb page={page} flags={[]} selected onSelect={() => undefined} />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<PageThumb page={page} flags={[]} onSelect={onSelect} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('applies QUALITY_PAGE_THUMB testid to root', () => {
    render(<PageThumb page={page} flags={[]} />);
    expect(screen.getByTestId(QUALITY_PAGE_THUMB)).toBeInTheDocument();
  });

  it('applies qualityPageThumbTestId helper to root', () => {
    render(<PageThumb page={page} flags={[]} />);
    expect(screen.getByTestId(qualityPageThumbTestId('p1'))).toBeInTheDocument();
  });

  // ── WS5: placeholder for empty imageUrl ──────────────────────────────────

  it('renders a placeholder div (no broken img) when thumbnailUrl is empty string', () => {
    const emptyPage = { id: 'p-empty', number: 99, thumbnailUrl: '' };
    const { container } = render(<PageThumb page={emptyPage} flags={[]} />);
    // No <img> element should be present
    expect(container.querySelector('img')).toBeNull();
    // Placeholder div should have the correct testid
    expect(screen.getByTestId(QUALITY_PAGE_THUMB)).toBeInTheDocument();
  });

  it('renders a placeholder div when thumbnailUrl is undefined', () => {
    const noUrlPage = { id: 'p-nurl', number: 5 };
    const { container } = render(<PageThumb page={noUrlPage} flags={[]} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByTestId(QUALITY_PAGE_THUMB)).toBeInTheDocument();
  });

  it('renders img when thumbnailUrl is provided', () => {
    const { container } = render(<PageThumb page={page} flags={[]} />);
    expect(container.querySelector('img')).not.toBeNull();
  });
});
