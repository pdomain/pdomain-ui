import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Banner } from './Banner.js';

describe('Banner', () => {
  it('renders headline when provided', () => {
    render(<Banner headline="Alert: something happened" />);
    expect(screen.getByText('Alert: something happened')).toBeTruthy();
  });

  it('renders subtext when provided', () => {
    render(<Banner headline="Headline" subtext="Some supporting detail" />);
    expect(screen.getByText('Some supporting detail')).toBeTruthy();
  });

  it('renders leadingSlot when provided', () => {
    render(<Banner leadingSlot={<span data-testid="lead-icon">●</span>} />);
    expect(screen.getByTestId('lead-icon')).toBeTruthy();
  });

  it('renders actions slot when provided', () => {
    render(
      <Banner
        actions={
          <button type="button" data-testid="action-btn">
            Retry
          </button>
        }
      />,
    );
    expect(screen.getByTestId('action-btn')).toBeTruthy();
  });

  it('renders footer slot when provided', () => {
    render(<Banner footer={<div data-testid="footer-content">Progress bar</div>} />);
    expect(screen.getByTestId('footer-content')).toBeTruthy();
  });

  it('renders children in body when provided', () => {
    render(
      <Banner>
        <span data-testid="free-body">Free content</span>
      </Banner>,
    );
    expect(screen.getByTestId('free-body')).toBeTruthy();
  });

  it('sets data-tone attribute from tone prop', () => {
    const { container } = render(<Banner tone="success" />);
    expect(container.querySelector('[data-tone="success"]')).toBeTruthy();
  });

  it('defaults data-tone to neutral when tone not provided', () => {
    const { container } = render(<Banner headline="Test" />);
    expect(container.querySelector('[data-tone="neutral"]')).toBeTruthy();
  });

  it('sets data-tone for each tone variant', () => {
    const tones = ['info', 'success', 'warning', 'danger', 'neutral'] as const;
    for (const tone of tones) {
      const { container } = render(<Banner tone={tone} />);
      expect(container.querySelector(`[data-tone="${tone}"]`)).toBeTruthy();
    }
  });

  it('defaults role to status for non-danger tones', () => {
    const { container } = render(<Banner tone="info" />);
    const el = container.querySelector('[role="status"]');
    expect(el).toBeTruthy();
  });

  it('defaults role to alert for tone=danger', () => {
    const { container } = render(<Banner tone="danger" />);
    const el = container.querySelector('[role="alert"]');
    expect(el).toBeTruthy();
  });

  it('overrides role when explicitly provided', () => {
    const { container } = render(<Banner tone="danger" role="status" />);
    expect(container.querySelector('[role="status"]')).toBeTruthy();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('defaults aria-live to polite for non-danger tones', () => {
    const { container } = render(<Banner tone="warning" />);
    const el = container.querySelector('[aria-live="polite"]');
    expect(el).toBeTruthy();
  });

  it('defaults aria-live to assertive for tone=danger', () => {
    const { container } = render(<Banner tone="danger" />);
    const el = container.querySelector('[aria-live="assertive"]');
    expect(el).toBeTruthy();
  });

  it('overrides aria-live when explicitly provided', () => {
    const { container } = render(<Banner tone="danger" aria-live="off" />);
    expect(container.querySelector('[aria-live="off"]')).toBeTruthy();
    expect(container.querySelector('[aria-live="assertive"]')).toBeNull();
  });

  it('forwards data-testid', () => {
    render(<Banner data-testid="my-banner" />);
    expect(screen.getByTestId('my-banner')).toBeTruthy();
  });

  it('composes className with default banner class', () => {
    const { container } = render(<Banner className="custom-class" />);
    const el = container.querySelector('.banner.custom-class');
    expect(el).toBeTruthy();
  });

  it('omits leadingSlot wrapper when not provided', () => {
    const { container } = render(<Banner headline="No leading" />);
    expect(container.querySelector('.banner__leading')).toBeNull();
  });

  it('omits actions wrapper when not provided', () => {
    const { container } = render(<Banner headline="No actions" />);
    expect(container.querySelector('.banner__actions')).toBeNull();
  });

  it('omits footer wrapper when not provided', () => {
    const { container } = render(<Banner headline="No footer" />);
    expect(container.querySelector('.banner__footer')).toBeNull();
  });

  it('renders a div root (not section) to avoid spurious landmarks (WS6)', () => {
    const { container } = render(<Banner headline="Test" />);
    // <section> makes every banner a landmark, polluting the page outline.
    // The root element should be a <div> with an explicit role attribute instead.
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe('div');
  });
});
