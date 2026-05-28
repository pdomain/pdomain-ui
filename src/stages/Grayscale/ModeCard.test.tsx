import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ModeCard } from './ModeCard.js';
import type { ModeCardProps } from './ModeCard.js';
import { MODE_CARD_GROUP, modeCardTestId } from '../../testids/index.js';

// ── helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_ESTIMATES: ModeCardProps['estimates'] = {
  standard: { secondsPerPage: 2, tone: 'exact' },
  perceptual: { secondsPerPage: 5, tone: 'fuzzy' },
};

function renderModeCard(overrides: Partial<ModeCardProps> = {}) {
  const props: ModeCardProps = {
    selectedMode: 'standard',
    onModeChange: vi.fn(),
    estimates: DEFAULT_ESTIMATES,
    ...overrides,
  };
  return render(<ModeCard {...props} />);
}

// ── rendering ─────────────────────────────────────────────────────────────────

describe('ModeCard — rendering', () => {
  it('renders both Standard and Perceptual cards', () => {
    renderModeCard();
    expect(screen.getByTestId(modeCardTestId('standard'))).toBeInTheDocument();
    expect(screen.getByTestId(modeCardTestId('perceptual'))).toBeInTheDocument();
  });

  it('renders mode names as headings', () => {
    renderModeCard();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Perceptual')).toBeInTheDocument();
  });

  it('renders mode descriptions', () => {
    renderModeCard();
    expect(
      screen.getByText('Linear luminance — fastest, suitable for clean text scans.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tonal compression — preserves detail in halftones and illustrations.'),
    ).toBeInTheDocument();
  });

  it('renders estimate badges with seconds-per-page', () => {
    renderModeCard({
      estimates: {
        standard: { secondsPerPage: 3, tone: 'exact' },
        perceptual: { secondsPerPage: 7, tone: 'fuzzy' },
      },
    });
    expect(screen.getByText('~3s/page')).toBeInTheDocument();
    expect(screen.getByText('~7s/page')).toBeInTheDocument();
  });
});

// ── aria-checked ──────────────────────────────────────────────────────────────

describe('ModeCard — aria-checked', () => {
  it('sets aria-checked=true on the selected Standard card', () => {
    renderModeCard({ selectedMode: 'standard' });
    expect(screen.getByTestId(modeCardTestId('standard'))).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId(modeCardTestId('perceptual'))).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('sets aria-checked=true on the selected Perceptual card', () => {
    renderModeCard({ selectedMode: 'perceptual' });
    expect(screen.getByTestId(modeCardTestId('perceptual'))).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByTestId(modeCardTestId('standard'))).toHaveAttribute('aria-checked', 'false');
  });

  it('role=radiogroup is present on outer wrapper', () => {
    renderModeCard();
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
  });
});

// ── interaction ───────────────────────────────────────────────────────────────

describe('ModeCard — interaction', () => {
  it('fires onModeChange with "perceptual" when Perceptual card is clicked', async () => {
    const onModeChange = vi.fn();
    renderModeCard({ selectedMode: 'standard', onModeChange });
    await userEvent.click(screen.getByTestId(modeCardTestId('perceptual')));
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith('perceptual');
  });

  it('fires onModeChange with "standard" when Standard card is clicked', async () => {
    const onModeChange = vi.fn();
    renderModeCard({ selectedMode: 'perceptual', onModeChange });
    await userEvent.click(screen.getByTestId(modeCardTestId('standard')));
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith('standard');
  });

  it('fires onModeChange even when clicking already-selected card', async () => {
    const onModeChange = vi.fn();
    renderModeCard({ selectedMode: 'standard', onModeChange });
    await userEvent.click(screen.getByTestId(modeCardTestId('standard')));
    expect(onModeChange).toHaveBeenCalledWith('standard');
  });
});

// ── estimate badge tone ───────────────────────────────────────────────────────

describe('ModeCard — estimate badge tone', () => {
  it('applies exact tone class to Standard badge when tone=exact', () => {
    renderModeCard({
      estimates: {
        standard: { secondsPerPage: 2, tone: 'exact' },
        perceptual: { secondsPerPage: 5, tone: 'fuzzy' },
      },
    });
    const standardBadge = screen.getByText('~2s/page');
    expect(standardBadge).toHaveClass('badge--tone-exact');
  });

  it('applies fuzzy tone class to Perceptual badge when tone=fuzzy', () => {
    renderModeCard({
      estimates: {
        standard: { secondsPerPage: 2, tone: 'exact' },
        perceptual: { secondsPerPage: 5, tone: 'fuzzy' },
      },
    });
    const perceptualBadge = screen.getByText('~5s/page');
    expect(perceptualBadge).toHaveClass('badge--tone-fuzzy');
  });

  it('applies exact tone class to Perceptual badge when both are exact', () => {
    renderModeCard({
      estimates: {
        standard: { secondsPerPage: 2, tone: 'exact' },
        perceptual: { secondsPerPage: 4, tone: 'exact' },
      },
    });
    const perceptualBadge = screen.getByText('~4s/page');
    expect(perceptualBadge).toHaveClass('badge--tone-exact');
  });
});

// ── data-testid forwarding ────────────────────────────────────────────────────

describe('ModeCard — data-testid', () => {
  it('forwards data-testid to outer wrapper', () => {
    renderModeCard({ 'data-testid': 'custom-mode-card' });
    expect(screen.getByTestId('custom-mode-card')).toBeInTheDocument();
  });

  it('defaults to MODE_CARD_GROUP testid when not specified', () => {
    renderModeCard();
    expect(screen.getByTestId(MODE_CARD_GROUP)).toBeInTheDocument();
  });
});

// ── TDD: radiogroup arrow-key nav (WS6) ──────────────────────────────────────

describe('ModeCard — radiogroup arrow-key navigation', () => {
  it('ArrowRight on Standard card moves focus to Perceptual and calls onModeChange', async () => {
    const onModeChange = vi.fn();
    renderModeCard({ selectedMode: 'standard', onModeChange });

    const standardCard = screen.getByTestId(modeCardTestId('standard'));
    standardCard.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onModeChange).toHaveBeenCalledWith('perceptual');
  });

  it('ArrowLeft on Perceptual card moves focus to Standard and calls onModeChange', async () => {
    const onModeChange = vi.fn();
    renderModeCard({ selectedMode: 'perceptual', onModeChange });

    const perceptualCard = screen.getByTestId(modeCardTestId('perceptual'));
    perceptualCard.focus();
    await userEvent.keyboard('{ArrowLeft}');

    expect(onModeChange).toHaveBeenCalledWith('standard');
  });

  it('ArrowRight on last card wraps to first and calls onModeChange', async () => {
    const onModeChange = vi.fn();
    renderModeCard({ selectedMode: 'perceptual', onModeChange });

    const perceptualCard = screen.getByTestId(modeCardTestId('perceptual'));
    perceptualCard.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onModeChange).toHaveBeenCalledWith('standard');
  });

  it('selected card has tabIndex=0; non-selected has tabIndex=-1', () => {
    renderModeCard({ selectedMode: 'standard' });
    expect(screen.getByTestId(modeCardTestId('standard'))).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId(modeCardTestId('perceptual'))).toHaveAttribute('tabindex', '-1');
  });
});
