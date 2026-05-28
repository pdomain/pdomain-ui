import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CropToolbar } from './CropToolbar.js';
import type { CropFilterCounts, CropFlagDrillCounts } from './CropToolbar.js';

const COUNTS: CropFilterCounts = {
  all: 200,
  flagged: 42,
  clean: 130,
  reviewed: 25,
  errors: 3,
};

const FLAG_COUNTS: CropFlagDrillCounts = {
  overCrop: 15,
  underCrop: 10,
  deskewFail: 12,
  edgeNoise: 5,
};

describe('CropToolbar', () => {
  it('renders 5 filter chips with counts', () => {
    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Flagged')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Clean')).toBeInTheDocument();
    expect(screen.getByText('130')).toBeInTheDocument();
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('active filter chip has aria-pressed=true; others have aria-pressed=false', () => {
    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.getByTestId('crop-toolbar-filter-flagged')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('crop-toolbar-filter-all')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('crop-toolbar-filter-clean')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByTestId('crop-toolbar-filter-reviewed')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByTestId('crop-toolbar-filter-errors')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('flag drill chips do not appear when filter is not flagged', () => {
    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        flagCounts={FLAG_COUNTS}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.queryByTestId('crop-toolbar-flag-overCrop')).not.toBeInTheDocument();
    expect(screen.queryByTestId('crop-toolbar-flag-underCrop')).not.toBeInTheDocument();
    expect(screen.queryByTestId('crop-toolbar-flag-deskewFail')).not.toBeInTheDocument();
    expect(screen.queryByTestId('crop-toolbar-flag-edgeNoise')).not.toBeInTheDocument();
  });

  it('flag drill chips appear when filter=flagged and flagCounts is provided', () => {
    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        flagCounts={FLAG_COUNTS}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.getByTestId('crop-toolbar-flag-overCrop')).toBeInTheDocument();
    expect(screen.getByTestId('crop-toolbar-flag-underCrop')).toBeInTheDocument();
    expect(screen.getByTestId('crop-toolbar-flag-deskewFail')).toBeInTheDocument();
    expect(screen.getByTestId('crop-toolbar-flag-edgeNoise')).toBeInTheDocument();
  });

  it('flag drill chips do not appear when filter=flagged but flagCounts is absent', () => {
    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.queryByTestId('crop-toolbar-flag-overCrop')).not.toBeInTheDocument();
  });

  it('active flag drill chip has aria-pressed=true', () => {
    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        flagCounts={FLAG_COUNTS}
        activeFlagDrill="overCrop"
        onFlagDrillChange={() => undefined}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.getByTestId('crop-toolbar-flag-overCrop')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('crop-toolbar-flag-underCrop')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onFlagDrillChange with kind when inactive flag chip clicked', async () => {
    const user = userEvent.setup();
    const onFlagDrillChange = vi.fn();

    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        flagCounts={FLAG_COUNTS}
        activeFlagDrill={null}
        onFlagDrillChange={onFlagDrillChange}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    await user.click(screen.getByTestId('crop-toolbar-flag-deskewFail'));
    expect(onFlagDrillChange).toHaveBeenCalledWith('deskewFail');
  });

  it('calls onFlagDrillChange with null when active flag chip clicked (toggle off)', async () => {
    const user = userEvent.setup();
    const onFlagDrillChange = vi.fn();

    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        flagCounts={FLAG_COUNTS}
        activeFlagDrill="underCrop"
        onFlagDrillChange={onFlagDrillChange}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    await user.click(screen.getByTestId('crop-toolbar-flag-underCrop'));
    expect(onFlagDrillChange).toHaveBeenCalledWith(null);
  });

  it('"Clear drill" button appears when activeFlagDrill is set and calls onFlagDrillChange(null)', async () => {
    const user = userEvent.setup();
    const onFlagDrillChange = vi.fn();

    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        flagCounts={FLAG_COUNTS}
        activeFlagDrill="edgeNoise"
        onFlagDrillChange={onFlagDrillChange}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    const clearBtn = screen.getByTestId('crop-toolbar-flag-clear');
    expect(clearBtn).toBeInTheDocument();
    await user.click(clearBtn);
    expect(onFlagDrillChange).toHaveBeenCalledWith(null);
  });

  it('"Clear drill" button absent when activeFlagDrill is null', () => {
    render(
      <CropToolbar
        filter="flagged"
        onFilterChange={() => undefined}
        counts={COUNTS}
        flagCounts={FLAG_COUNTS}
        activeFlagDrill={null}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.queryByTestId('crop-toolbar-flag-clear')).not.toBeInTheDocument();
  });

  it('density Segmented is rendered', () => {
    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="l"
        onDensityChange={() => undefined}
      />,
    );

    // The density wrapper uses a stable testid (not density-suffixed)
    expect(screen.getByTestId('crop-toolbar-density')).toBeInTheDocument();
  });

  it('Re-run button appears and fires onRerun', async () => {
    const user = userEvent.setup();
    const onRerun = vi.fn();

    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="m"
        onDensityChange={() => undefined}
        onRerun={onRerun}
      />,
    );

    const rerunBtn = screen.getByTestId('crop-toolbar-rerun');
    expect(rerunBtn).toBeInTheDocument();
    await user.click(rerunBtn);
    expect(onRerun).toHaveBeenCalledOnce();
  });

  it('Re-run button absent when onRerun is not provided', () => {
    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="m"
        onDensityChange={() => undefined}
      />,
    );

    expect(screen.queryByTestId('crop-toolbar-rerun')).not.toBeInTheDocument();
  });

  it('forwards data-testid to toolbar wrapper', () => {
    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="m"
        onDensityChange={() => undefined}
        data-testid="my-crop-toolbar"
      />,
    );

    expect(screen.getByTestId('my-crop-toolbar')).toBeInTheDocument();
  });
});

// ── TDD: stable density testid (WS6) ─────────────────────────────────────────

describe('CropToolbar — stable density testid', () => {
  it('density wrapper has stable testid "crop-toolbar-density" regardless of density value', () => {
    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="s"
        onDensityChange={() => undefined}
      />,
    );
    expect(screen.getByTestId('crop-toolbar-density')).toBeInTheDocument();
  });

  it('stable testid present for density m', () => {
    render(
      <CropToolbar
        filter="all"
        onFilterChange={() => undefined}
        counts={COUNTS}
        density="m"
        onDensityChange={() => undefined}
      />,
    );
    expect(screen.getByTestId('crop-toolbar-density')).toBeInTheDocument();
  });
});
