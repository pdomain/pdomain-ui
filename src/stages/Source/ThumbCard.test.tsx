import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThumbCard } from './ThumbCard.js';
import type { SourcePage } from './ThumbCard.js';

const makePage = (overrides: Partial<SourcePage> = {}): SourcePage => ({
  id: 'p1',
  pageNumber: 42,
  thumbnailUrl: 'https://example.com/thumb.jpg',
  status: 'ok',
  role: 'page',
  ...overrides,
});

describe('ThumbCard', () => {
  it('renders thumbnail image with correct alt text', () => {
    render(<ThumbCard page={makePage()} density="m" />);
    const img = screen.getByAltText('page 42');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/thumb.jpg');
  });

  it('renders page number', () => {
    render(<ThumbCard page={makePage({ pageNumber: 7 })} density="m" />);
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('renders role badge', () => {
    const { container } = render(<ThumbCard page={makePage({ role: 'cover' })} density="m" />);
    const badge = container.querySelector('.thumb-card__role-badge');
    expect(badge?.textContent).toBe('cover');
  });

  it('renders status dot with correct data-status attribute', () => {
    const { container } = render(<ThumbCard page={makePage({ status: 'error' })} density="m" />);
    const dot = container.querySelector('.thumb-card__status');
    expect(dot).toBeTruthy();
    expect(dot?.getAttribute('data-status')).toBe('error');
  });

  it('density="s" hides checkbox', () => {
    const { container } = render(<ThumbCard page={makePage()} density="s" />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeNull();
  });

  it('density="m" shows checkbox', () => {
    const { container } = render(<ThumbCard page={makePage()} density="m" />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('density="l" shows checkbox', () => {
    const { container } = render(<ThumbCard page={makePage()} density="l" />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('selected prop drives data-selected attribute', () => {
    const { container } = render(<ThumbCard page={makePage()} density="m" selected={true} />);
    const card = container.querySelector('.thumb-card');
    expect(card?.getAttribute('data-selected')).toBe('true');
  });

  it('selected=false sets data-selected to false', () => {
    const { container } = render(<ThumbCard page={makePage()} density="m" selected={false} />);
    const card = container.querySelector('.thumb-card');
    expect(card?.getAttribute('data-selected')).toBe('false');
  });

  it('no selected prop means no data-selected attribute', () => {
    const { container } = render(<ThumbCard page={makePage()} density="m" />);
    const card = container.querySelector('.thumb-card');
    expect(card?.hasAttribute('data-selected')).toBe(false);
  });

  it('checkbox change fires onSelect with page id', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ThumbCard page={makePage({ id: 'abc' })} density="m" selected={false} onSelect={onSelect} />,
    );
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(onSelect).toHaveBeenCalledWith('abc');
  });

  it('role select change fires onRoleChange with id and new role', () => {
    const onRoleChange = vi.fn();
    const { container } = render(
      <ThumbCard
        page={makePage({ id: 'p99', role: 'page' })}
        density="m"
        onRoleChange={onRoleChange}
      />,
    );
    const select = container.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'cover' } });
    expect(onRoleChange).toHaveBeenCalledWith('p99', 'cover');
  });

  it('role select renders all 6 role options', () => {
    const { container } = render(<ThumbCard page={makePage()} density="m" />);
    const options = container.querySelectorAll('select option');
    expect(options).toHaveLength(6);
    const values = Array.from(options).map((o) => o.getAttribute('value'));
    expect(values).toEqual(['page', 'cover', 'back', 'blank', 'duplicate', 'removed']);
  });

  it('data-testid forwards to article element', () => {
    const { container } = render(
      <ThumbCard page={makePage()} density="m" data-testid="custom-id" />,
    );
    const card = container.querySelector('.thumb-card');
    expect(card?.getAttribute('data-testid')).toBe('custom-id');
  });

  it('role select has correct testid based on page id', () => {
    const { container } = render(<ThumbCard page={makePage({ id: 'pg5' })} density="m" />);
    const select = container.querySelector('select');
    expect(select?.getAttribute('data-testid')).toBe('thumb-card-pg5-role-select');
  });

  it('checkbox has correct testid based on page id', () => {
    const { container } = render(
      <ThumbCard page={makePage({ id: 'pg3' })} density="m" selected={false} />,
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.getAttribute('data-testid')).toBe('thumb-card-pg3-checkbox');
  });

  it('does not call onSelect when role select is changed', () => {
    const onSelect = vi.fn();
    const { container } = render(<ThumbCard page={makePage()} density="m" onSelect={onSelect} />);
    const select = container.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'blank' } });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('data-density attribute reflects density prop', () => {
    const { container: c1 } = render(<ThumbCard page={makePage()} density="s" />);
    const { container: c2 } = render(<ThumbCard page={makePage()} density="l" />);
    expect(c1.querySelector('.thumb-card')?.getAttribute('data-density')).toBe('s');
    expect(c2.querySelector('.thumb-card')?.getAttribute('data-density')).toBe('l');
  });

  // ── WS5: single select path — no double-fire ──────────────────────────────

  it('body click fires onSelect exactly once (no double-fire with checkbox)', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ThumbCard
        page={makePage({ id: 'p-double' })}
        density="m"
        selected={false}
        onSelect={onSelect}
      />,
    );
    const bodyBtn = container.querySelector('.thumb-card__body') as HTMLButtonElement;
    fireEvent.click(bodyBtn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('p-double');
  });

  it('density="s" body click fires onSelect once (no checkbox path)', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ThumbCard page={makePage({ id: 'p-small' })} density="s" onSelect={onSelect} />,
    );
    const bodyBtn = container.querySelector('.thumb-card__body') as HTMLButtonElement;
    fireEvent.click(bodyBtn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('p-small');
  });
});
