import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CropBanner } from './CropBanner.js';
import type { CropFlagCounts } from './CropBanner.js';
import { CROP_BANNER, CROP_BANNER_RERUN } from '../../testids/index.js';

// ── helpers ───────────────────────────────────────────────────────────────────

const defaultFlags: CropFlagCounts = {
  overCrop: 3,
  underCrop: 1,
  deskewFail: 2,
  edgeNoise: 0,
};

// ── running state ─────────────────────────────────────────────────────────────

describe('CropBanner — running state', () => {
  it('renders "Cropping pages…" headline', () => {
    render(<CropBanner state="running" />);
    expect(screen.getByText('Cropping pages…')).toBeInTheDocument();
  });

  it('shows progress percentage in subtext (default 0%)', () => {
    render(<CropBanner state="running" />);
    expect(screen.getByText('0% complete')).toBeInTheDocument();
  });

  it('shows rounded progress percentage', () => {
    render(<CropBanner state="running" progress={0.75} />);
    expect(screen.getByText('75% complete')).toBeInTheDocument();
  });

  it('renders inline progress bar via role=progressbar', () => {
    render(<CropBanner state="running" progress={0.4} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '40');
  });

  it('uses info Banner tone (data-tone=info)', () => {
    render(<CropBanner state="running" data-testid={CROP_BANNER} />);
    const banner = screen.getByTestId(CROP_BANNER);
    expect(banner).toHaveAttribute('data-tone', 'info');
  });

  it('does not render Re-run button', () => {
    render(<CropBanner state="running" onRerun={vi.fn()} />);
    expect(screen.queryByTestId(CROP_BANNER_RERUN)).not.toBeInTheDocument();
  });
});

// ── review state ──────────────────────────────────────────────────────────────

describe('CropBanner — review state', () => {
  it('renders "Review crops" headline', () => {
    render(<CropBanner state="review" flagCounts={defaultFlags} />);
    expect(screen.getByText('Review crops')).toBeInTheDocument();
  });

  it('uses warning Banner tone (data-tone=warning)', () => {
    render(<CropBanner state="review" flagCounts={defaultFlags} data-testid={CROP_BANNER} />);
    const banner = screen.getByTestId(CROP_BANNER);
    expect(banner).toHaveAttribute('data-tone', 'warning');
  });

  it('shows over-crop count in flag summary', () => {
    render(<CropBanner state="review" flagCounts={defaultFlags} />);
    expect(screen.getByText(/3 over-crop/)).toBeInTheDocument();
  });

  it('shows deskew fail count in flag summary', () => {
    render(<CropBanner state="review" flagCounts={defaultFlags} />);
    expect(screen.getByText(/2 deskew fail/)).toBeInTheDocument();
  });

  it('omits zero-count flag types from summary', () => {
    render(<CropBanner state="review" flagCounts={defaultFlags} />);
    expect(screen.queryByText(/edge noise/)).not.toBeInTheDocument();
  });

  it('shows fallback text when flagCounts is omitted', () => {
    render(<CropBanner state="review" />);
    expect(screen.getByText('Flags detected.')).toBeInTheDocument();
  });

  it('shows "No flags." when all counts are zero', () => {
    const zero: CropFlagCounts = { overCrop: 0, underCrop: 0, deskewFail: 0, edgeNoise: 0 };
    render(<CropBanner state="review" flagCounts={zero} />);
    expect(screen.getByText('No flags.')).toBeInTheDocument();
  });

  it('renders Re-run button when onRerun is provided', () => {
    render(<CropBanner state="review" flagCounts={defaultFlags} onRerun={vi.fn()} />);
    expect(screen.getByTestId(CROP_BANNER_RERUN)).toBeInTheDocument();
    expect(screen.getByTestId(CROP_BANNER_RERUN)).toHaveTextContent('Re-run');
  });

  it('does not render Re-run button when onRerun is omitted', () => {
    render(<CropBanner state="review" flagCounts={defaultFlags} />);
    expect(screen.queryByTestId(CROP_BANNER_RERUN)).not.toBeInTheDocument();
  });

  it('calls onRerun when Re-run is clicked', async () => {
    const user = userEvent.setup();
    const onRerun = vi.fn();
    render(<CropBanner state="review" flagCounts={defaultFlags} onRerun={onRerun} />);
    await user.click(screen.getByTestId(CROP_BANNER_RERUN));
    expect(onRerun).toHaveBeenCalledTimes(1);
  });
});

// ── done state ────────────────────────────────────────────────────────────────

describe('CropBanner — done state', () => {
  it('renders "Crops ready" headline', () => {
    render(<CropBanner state="done" />);
    expect(screen.getByText('Crops ready')).toBeInTheDocument();
  });

  it('uses success Banner tone (data-tone=success)', () => {
    render(<CropBanner state="done" data-testid={CROP_BANNER} />);
    const banner = screen.getByTestId(CROP_BANNER);
    expect(banner).toHaveAttribute('data-tone', 'success');
  });

  it('renders "No flags to review." subtext', () => {
    render(<CropBanner state="done" />);
    expect(screen.getByText('No flags to review.')).toBeInTheDocument();
  });

  it('renders Re-run button when onRerun is provided', () => {
    render(<CropBanner state="done" onRerun={vi.fn()} />);
    expect(screen.getByTestId(CROP_BANNER_RERUN)).toBeInTheDocument();
  });

  it('does not render Re-run button when onRerun is omitted', () => {
    render(<CropBanner state="done" />);
    expect(screen.queryByTestId(CROP_BANNER_RERUN)).not.toBeInTheDocument();
  });

  it('calls onRerun when Re-run is clicked', async () => {
    const user = userEvent.setup();
    const onRerun = vi.fn();
    render(<CropBanner state="done" onRerun={onRerun} />);
    await user.click(screen.getByTestId(CROP_BANNER_RERUN));
    expect(onRerun).toHaveBeenCalledTimes(1);
  });
});

// ── data-testid forwarding ────────────────────────────────────────────────────

describe('CropBanner — data-testid forwarding', () => {
  it('uses the default CROP_BANNER testid', () => {
    render(<CropBanner state="done" />);
    expect(screen.getByTestId(CROP_BANNER)).toBeInTheDocument();
  });

  it('forwards a custom data-testid to the root element', () => {
    render(<CropBanner state="done" data-testid="my-crop-banner" />);
    expect(screen.getByTestId('my-crop-banner')).toBeInTheDocument();
    expect(screen.queryByTestId(CROP_BANNER)).not.toBeInTheDocument();
  });
});

// ── distinct content per state ────────────────────────────────────────────────

describe('CropBanner — each state renders distinct content', () => {
  it('running headline is distinct from review headline', () => {
    const { rerender } = render(<CropBanner state="running" />);
    expect(screen.getByText('Cropping pages…')).toBeInTheDocument();
    rerender(<CropBanner state="review" />);
    expect(screen.queryByText('Cropping pages…')).not.toBeInTheDocument();
    expect(screen.getByText('Review crops')).toBeInTheDocument();
  });

  it('review headline is distinct from done headline', () => {
    const { rerender } = render(<CropBanner state="review" />);
    expect(screen.getByText('Review crops')).toBeInTheDocument();
    rerender(<CropBanner state="done" />);
    expect(screen.queryByText('Review crops')).not.toBeInTheDocument();
    expect(screen.getByText('Crops ready')).toBeInTheDocument();
  });
});

// ── TDD: error state (WS5) ────────────────────────────────────────────────────

describe('CropBanner — error state', () => {
  it('renders in error state with danger tone', () => {
    render(<CropBanner state="error" data-testid={CROP_BANNER} />);
    const banner = screen.getByTestId(CROP_BANNER);
    expect(banner).toHaveAttribute('data-tone', 'danger');
  });

  it('renders a meaningful error headline', () => {
    render(<CropBanner state="error" />);
    expect(screen.getByText(/pipeline/i)).toBeInTheDocument();
  });

  it('renders Re-run button in error state when onRerun is provided', () => {
    render(<CropBanner state="error" onRerun={vi.fn()} />);
    expect(screen.getByTestId(CROP_BANNER_RERUN)).toBeInTheDocument();
  });

  it('does not render Re-run button in error state when onRerun is absent', () => {
    render(<CropBanner state="error" />);
    expect(screen.queryByTestId(CROP_BANNER_RERUN)).not.toBeInTheDocument();
  });

  it('error state has optional errorMessage in subtext', () => {
    render(<CropBanner state="error" errorMessage="Disk full" />);
    expect(screen.getByText('Disk full')).toBeInTheDocument();
  });
});
