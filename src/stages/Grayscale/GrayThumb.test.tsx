import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GrayThumb } from './GrayThumb.js';
import type { GrayPage } from './GrayThumb.js';

const PAGE: GrayPage = {
  id: 'page-1',
  pageNumber: 42,
  thumbnailUrl: 'https://example.com/thumb/42.jpg',
  status: 'pending',
};

describe('GrayThumb', () => {
  it('renders the thumbnail image', () => {
    render(<GrayThumb page={PAGE} estimatedSeconds={10} />);
    const img = screen.getByRole('img', { name: /page 42/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', PAGE.thumbnailUrl);
  });

  it('shows the page number', () => {
    render(<GrayThumb page={PAGE} estimatedSeconds={10} />);
    expect(screen.getByLabelText(/page 42/i)).toBeInTheDocument();
  });

  it('shows the time estimate text', () => {
    render(<GrayThumb page={PAGE} estimatedSeconds={15} />);
    expect(screen.getByText('~15s')).toBeInTheDocument();
  });

  it('applies data-status attribute when status is present', () => {
    const { container } = render(
      <GrayThumb page={{ ...PAGE, status: 'processing' }} estimatedSeconds={5} />,
    );
    const article = container.querySelector('article.gray-thumb');
    expect(article).toHaveAttribute('data-status', 'processing');
  });

  it('omits data-status attribute when status is undefined', () => {
    const pageNoStatus: GrayPage = { id: 'p2', pageNumber: 1, thumbnailUrl: '/t.jpg' };
    const { container } = render(<GrayThumb page={pageNoStatus} estimatedSeconds={5} />);
    const article = container.querySelector('article.gray-thumb');
    expect(article).not.toHaveAttribute('data-status');
  });

  it('does not fire onClick when not interactive', async () => {
    const handler = vi.fn();
    render(<GrayThumb page={PAGE} estimatedSeconds={10} onClick={handler} />);
    // body is a div, not a button — clicking should not trigger handler
    const body = document.querySelector('.gray-thumb__body')!;
    await userEvent.click(body);
    expect(handler).not.toHaveBeenCalled();
  });

  it('fires onClick(id) when interactive=true and clicked', async () => {
    const handler = vi.fn();
    render(<GrayThumb page={PAGE} estimatedSeconds={10} onClick={handler} interactive={true} />);
    const btn = screen.getByRole('button', { name: /process page 42/i });
    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith('page-1');
  });

  it('does not fire onClick when interactive=true but onClick is not provided', () => {
    // Should not throw; body is a button but no handler
    const { container } = render(
      <GrayThumb page={PAGE} estimatedSeconds={10} interactive={true} />,
    );
    // When interactive=true but no onClick, renders a div (not a button)
    const button = container.querySelector('button.gray-thumb__body');
    expect(button).not.toBeInTheDocument();
  });

  it('forwards data-testid to the article element', () => {
    const { container } = render(
      <GrayThumb page={PAGE} estimatedSeconds={10} data-testid="custom-testid" />,
    );
    const article = container.querySelector('article.gray-thumb');
    expect(article).toHaveAttribute('data-testid', 'custom-testid');
  });

  it('uses default data-testid when none is provided', () => {
    const { container } = render(<GrayThumb page={PAGE} estimatedSeconds={10} />);
    const article = container.querySelector('article.gray-thumb');
    expect(article).toHaveAttribute('data-testid', 'gray-thumb');
  });
});

// ─── TDD: require onClick when interactive (WS5) ──────────────────────────────

describe('GrayThumb — onClick requirement when interactive', () => {
  it('renders a div (not button) when interactive=true but onClick is undefined', () => {
    const { container } = render(
      <GrayThumb page={PAGE} estimatedSeconds={10} interactive={true} />,
    );
    // Must NOT render a dead interactive button
    expect(container.querySelector('button.gray-thumb__body')).not.toBeInTheDocument();
    // Body still renders as div
    expect(container.querySelector('.gray-thumb__body')).toBeInTheDocument();
  });

  it('renders button when both interactive=true and onClick are provided', () => {
    const { container } = render(
      <GrayThumb page={PAGE} estimatedSeconds={10} interactive={true} onClick={vi.fn()} />,
    );
    expect(container.querySelector('button.gray-thumb__body')).toBeInTheDocument();
  });
});
