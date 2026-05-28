import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CropCard } from './CropCard.js';
import type { CropPage, CropBbox } from './CropCard.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BBOX: CropBbox = { bbox: [0.1, 0.2, 0.6, 0.5] };

const makePage = (overrides: Partial<CropPage> = {}): CropPage => ({
  id: 'page-1',
  pageNumber: 5,
  thumbnailUrl: 'https://example.com/thumb/5.jpg',
  status: 'clean',
  flags: [],
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CropCard', () => {
  describe('basic rendering', () => {
    it('renders the thumbnail image with page data', () => {
      const page = makePage();
      render(<CropCard page={page} density="m" />);
      const img = screen.getByRole('img', { name: /page 5/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', page.thumbnailUrl);
    });

    it('shows the page number', () => {
      render(<CropCard page={makePage({ pageNumber: 42 })} density="m" />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('forwards data-testid', () => {
      const { container } = render(
        <CropCard page={makePage()} density="m" data-testid="my-crop-card" />,
      );
      expect(container.querySelector('[data-testid="my-crop-card"]')).toBeInTheDocument();
    });

    it('uses default data-testid when none is provided', () => {
      const { container } = render(<CropCard page={makePage()} density="m" />);
      expect(container.querySelector('[data-testid="crop-card"]')).toBeInTheDocument();
    });
  });

  describe('status dot', () => {
    it('renders status dot with data-status attribute', () => {
      const { container } = render(<CropCard page={makePage({ status: 'flagged' })} density="m" />);
      const dot = container.querySelector('.crop-card__status');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveAttribute('data-status', 'flagged');
    });

    it('status dot reflects each status value', () => {
      for (const status of ['clean', 'flagged', 'reviewed', 'error'] as const) {
        const { container } = render(<CropCard page={makePage({ status })} density="m" />);
        const dot = container.querySelector('.crop-card__status');
        expect(dot).toHaveAttribute('data-status', status);
        container.remove();
      }
    });
  });

  describe('bbox overlay', () => {
    it('renders bbox overlay when page.bbox is present', () => {
      const { container } = render(<CropCard page={makePage({ bbox: BBOX })} density="m" />);
      const overlay = container.querySelector('.crop-card__bbox');
      expect(overlay).toBeInTheDocument();
    });

    it('does not render bbox overlay when page.bbox is absent', () => {
      const { container } = render(<CropCard page={makePage()} density="m" />);
      const overlay = container.querySelector('.crop-card__bbox');
      expect(overlay).not.toBeInTheDocument();
    });

    it('applies normalized bbox coordinates as percentage styles', () => {
      const { container } = render(<CropCard page={makePage({ bbox: BBOX })} density="m" />);
      const overlay = container.querySelector<HTMLElement>('.crop-card__bbox');
      expect(overlay).not.toBeNull();
      expect(overlay!.style.left).toBe('10%');
      expect(overlay!.style.top).toBe('20%');
      expect(overlay!.style.width).toBe('60%');
      expect(overlay!.style.height).toBe('50%');
    });
  });

  describe('flag chip overflow per density', () => {
    const pageWithFlags = makePage({
      flags: ['overCrop', 'underCrop', 'deskewFail', 'edgeNoise', 'overCrop'] as const,
      status: 'flagged',
    });

    it('density s: shows only count badge, no individual chips', () => {
      const { container } = render(
        <CropCard page={makePage({ flags: ['overCrop', 'underCrop'] })} density="s" />,
      );
      expect(container.querySelector('.crop-card__flag-count')).toBeInTheDocument();
      expect(container.querySelectorAll('.crop-card__flag-chip')).toHaveLength(0);
    });

    it('density s: count badge shows total number of flags', () => {
      const { container } = render(
        <CropCard
          page={makePage({ flags: ['overCrop', 'deskewFail', 'edgeNoise'] })}
          density="s"
        />,
      );
      const count = container.querySelector('.crop-card__flag-count');
      expect(count).toHaveTextContent('3');
    });

    it('density s: no chips or count when flags is empty', () => {
      const { container } = render(<CropCard page={makePage({ flags: [] })} density="s" />);
      expect(container.querySelector('.crop-card__flag-count')).not.toBeInTheDocument();
      expect(container.querySelectorAll('.crop-card__flag-chip')).toHaveLength(0);
    });

    it('density m: shows up to 2 chips', () => {
      const { container } = render(
        <CropCard
          page={makePage({ flags: ['overCrop', 'underCrop', 'deskewFail'] })}
          density="m"
        />,
      );
      const chips = container.querySelectorAll('.crop-card__flag-chip');
      expect(chips).toHaveLength(2);
    });

    it('density m: shows +N overflow when more than 2 flags', () => {
      const { container } = render(
        <CropCard
          page={makePage({ flags: ['overCrop', 'underCrop', 'deskewFail'] })}
          density="m"
        />,
      );
      const overflow = container.querySelector('.crop-card__flag-overflow');
      expect(overflow).toBeInTheDocument();
      expect(overflow).toHaveTextContent('+1');
    });

    it('density m: no overflow when exactly 2 flags', () => {
      const { container } = render(
        <CropCard page={makePage({ flags: ['overCrop', 'underCrop'] })} density="m" />,
      );
      expect(container.querySelector('.crop-card__flag-overflow')).not.toBeInTheDocument();
    });

    it('density l: shows up to 4 chips', () => {
      const { container } = render(<CropCard page={pageWithFlags} density="l" />);
      const chips = container.querySelectorAll('.crop-card__flag-chip');
      expect(chips).toHaveLength(4);
    });

    it('density l: shows +N overflow when more than 4 flags', () => {
      const { container } = render(<CropCard page={pageWithFlags} density="l" />);
      const overflow = container.querySelector('.crop-card__flag-overflow');
      expect(overflow).toBeInTheDocument();
      expect(overflow).toHaveTextContent('+1');
    });

    it('density l: no overflow when exactly 4 flags', () => {
      const { container } = render(
        <CropCard
          page={makePage({ flags: ['overCrop', 'underCrop', 'deskewFail', 'edgeNoise'] })}
          density="l"
        />,
      );
      expect(container.querySelector('.crop-card__flag-overflow')).not.toBeInTheDocument();
    });

    it('renders flag chip testids with correct format', () => {
      const { container } = render(
        <CropCard page={makePage({ id: 'pg1', flags: ['overCrop'] })} density="m" />,
      );
      expect(
        container.querySelector('[data-testid="crop-card-flag-pg1-overCrop"]'),
      ).toBeInTheDocument();
    });
  });

  describe('checkbox', () => {
    it('checkbox absent on density s', () => {
      render(<CropCard page={makePage()} density="s" onSelect={vi.fn()} />);
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('checkbox absent when onSelect not provided (density m)', () => {
      render(<CropCard page={makePage()} density="m" />);
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('checkbox present on density m with onSelect', () => {
      render(<CropCard page={makePage()} density="m" onSelect={vi.fn()} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('checkbox present on density l with onSelect', () => {
      render(<CropCard page={makePage()} density="l" onSelect={vi.fn()} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('checkbox reflects selected state', () => {
      render(<CropCard page={makePage()} density="m" onSelect={vi.fn()} selected={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('checkbox fires onSelect(id) when changed', async () => {
      const handler = vi.fn();
      render(
        <CropCard
          page={makePage({ id: 'pg-5' })}
          density="m"
          onSelect={handler}
          selected={false}
        />,
      );
      await userEvent.click(screen.getByRole('checkbox'));
      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith('pg-5');
    });
  });

  describe('selection', () => {
    it('selected=true drives aria-pressed on the Thumbnail button', () => {
      render(<CropCard page={makePage()} density="m" onSelect={vi.fn()} selected={true} />);
      const btn = screen.getByRole('button', { name: /select page 5/i });
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    it('selected=false drives aria-pressed false', () => {
      render(<CropCard page={makePage()} density="m" onSelect={vi.fn()} selected={false} />);
      const btn = screen.getByRole('button', { name: /select page 5/i });
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('fires onSelect(id) when card body is clicked', async () => {
      const handler = vi.fn();
      render(<CropCard page={makePage({ id: 'pg-7' })} density="m" onSelect={handler} />);
      const btn = screen.getByRole('button', { name: /select page 5/i });
      await userEvent.click(btn);
      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith('pg-7');
    });

    it('no button rendered when onSelect is not provided', () => {
      render(<CropCard page={makePage()} density="m" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});

// ─── TDD: flag-render guard (WS5) ─────────────────────────────────────────────

describe('CropCard — flag overlayBottomLeft guard', () => {
  it('does not render overlayBottomLeft container when flags is empty (density m)', () => {
    const { container } = render(<CropCard page={makePage({ flags: [] })} density="m" />);
    // Neither the chips div nor the count badge should be present
    expect(container.querySelector('.crop-card__flags')).not.toBeInTheDocument();
    expect(container.querySelector('.crop-card__flag-count')).not.toBeInTheDocument();
  });

  it('does not pass overlayBottomLeft when flags is empty (density l)', () => {
    const { container } = render(<CropCard page={makePage({ flags: [] })} density="l" />);
    expect(container.querySelector('.crop-card__flags')).not.toBeInTheDocument();
    expect(container.querySelector('.crop-card__flag-overflow')).not.toBeInTheDocument();
  });
});

// ─── A11y: status dot has human-readable aria-label (WS6) ────────────────────

describe('CropCard — status dot a11y', () => {
  it('status dot has aria-label matching status value', () => {
    const { container } = render(<CropCard page={makePage({ status: 'flagged' })} density="m" />);
    const dot = container.querySelector('.crop-card__status');
    expect(dot).toHaveAttribute('aria-label', 'flagged');
  });

  it('status dot is NOT aria-hidden (must be announced)', () => {
    const { container } = render(<CropCard page={makePage({ status: 'clean' })} density="m" />);
    const dot = container.querySelector('.crop-card__status');
    expect(dot).not.toHaveAttribute('aria-hidden', 'true');
  });
});
