import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QualityBanner } from './QualityBanner.js';

const DEFAULT_FLAGS = [
  { kind: 'blurry' as const, count: 22 },
  { kind: 'skew' as const, count: 11 },
];

describe('QualityBanner', () => {
  it('renders the title in the headline', () => {
    render(
      <QualityBanner
        title="Source quality issues"
        flagged={33}
        total={100}
        flags={DEFAULT_FLAGS}
      />,
    );
    // Headline template: "{flagged} pages flagged · {title.toLowerCase()}"
    expect(screen.getByText(/source quality issues/i)).toBeTruthy();
  });

  it('renders the flagged count in the headline', () => {
    render(
      <QualityBanner
        title="Source quality issues"
        flagged={22}
        total={200}
        flags={DEFAULT_FLAGS}
      />,
    );
    // Headline contains "22 pages flagged · ..."
    expect(screen.getByText(/22 pages flagged/)).toBeTruthy();
  });

  it('renders flag chips for each flag entry', () => {
    render(<QualityBanner title="Issues" flagged={5} total={100} flags={DEFAULT_FLAGS} />);
    expect(screen.getByText('blurry')).toBeTruthy();
    expect(screen.getByText('skew')).toBeTruthy();
  });

  it('renders sub text when provided', () => {
    render(
      <QualityBanner
        title="Issues"
        flagged={5}
        total={100}
        flags={DEFAULT_FLAGS}
        sub="Additional detail text"
      />,
    );
    expect(screen.getByText('Additional detail text')).toBeTruthy();
  });

  it('applies extreme modifier when severe=true', () => {
    const { container } = render(
      <QualityBanner title="Issues" flagged={80} total={100} flags={DEFAULT_FLAGS} severe />,
    );
    expect(container.querySelector('.quality-banner--extreme')).toBeTruthy();
  });

  it('applies extreme modifier when flagged ratio > 0.7', () => {
    const { container } = render(
      <QualityBanner title="Issues" flagged={75} total={100} flags={DEFAULT_FLAGS} />,
    );
    expect(container.querySelector('.quality-banner--extreme')).toBeTruthy();
  });

  it('renders primary action button when onAction provided', () => {
    render(
      <QualityBanner
        title="Issues"
        flagged={5}
        total={100}
        flags={DEFAULT_FLAGS}
        actionLabel="View flagged"
        onAction={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /View flagged/i })).toBeTruthy();
  });

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn();
    render(
      <QualityBanner
        title="Issues"
        flagged={5}
        total={100}
        flags={DEFAULT_FLAGS}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('omits dismiss button when onDismiss not provided', () => {
    render(<QualityBanner title="Issues" flagged={5} total={100} flags={DEFAULT_FLAGS} />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).toBeNull();
  });

  it('forwards className', () => {
    const { container } = render(
      <QualityBanner
        title="Issues"
        flagged={5}
        total={100}
        flags={DEFAULT_FLAGS}
        className="custom"
      />,
    );
    expect(container.querySelector('.custom')).toBeTruthy();
  });

  it('has aria-live polite for dynamic updates (WS6)', () => {
    const { container } = render(
      <QualityBanner title="Issues" flagged={5} total={100} flags={DEFAULT_FLAGS} />,
    );
    const banner = container.querySelector('.quality-banner');
    expect(banner?.getAttribute('aria-live')).toBe('polite');
  });

  it('decorative dots are aria-hidden (WS6)', () => {
    const { container } = render(
      <QualityBanner title="Issues" flagged={5} total={100} flags={DEFAULT_FLAGS} />,
    );
    // The stripe and icon elements should be aria-hidden decorative
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThan(0);
  });
});
