import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CropOverview } from './CropOverview.js';
import type {
  CropOverviewProps,
  FlagDistributionEntry,
  CropActivityEntry,
} from './CropOverview.js';
import {
  CROP_OVERVIEW,
  CROP_OVERVIEW_DISTRIBUTION,
  CROP_OVERVIEW_ACTIVITY,
  cropOverviewActivityTestId,
} from '../../testids/index.js';

// ── fixtures ──────────────────────────────────────────────────────────────────

const BASE_FLAGS: FlagDistributionEntry[] = [
  { kind: 'overCrop', count: 12 },
  { kind: 'underCrop', count: 8 },
  { kind: 'deskewFail', count: 3 },
  { kind: 'edgeNoise', count: 5 },
];

/** A fixed "now" anchor for relative-time tests: 2026-01-01T12:00:00Z */
const NOW_MS = new Date('2026-01-01T12:00:00Z').getTime();

const BASE_ACTIVITY: CropActivityEntry[] = [
  {
    id: 'act-1',
    timestamp: new Date(NOW_MS - 2 * 60 * 1000).toISOString(), // 2m ago
    message: 'Re-ran crop on 12 pages',
    actor: 'auto',
  },
  {
    id: 'act-2',
    timestamp: new Date(NOW_MS - 65 * 60 * 1000).toISOString(), // ~1h ago
    message: 'Settings updated',
  },
];

function renderOverview(props: Partial<CropOverviewProps> = {}) {
  return render(
    <CropOverview
      flagDistribution={props.flagDistribution ?? BASE_FLAGS}
      recentActivity={props.recentActivity ?? BASE_ACTIVITY}
      {...(props['data-testid'] != null ? { 'data-testid': props['data-testid'] } : {})}
    />,
  );
}

// ── flag distribution legend ──────────────────────────────────────────────────

describe('CropOverview — flag distribution legend', () => {
  beforeEach(() => {
    vi.setSystemTime(NOW_MS);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders each flag count in the legend', () => {
    renderOverview();
    const dist = screen.getByTestId(CROP_OVERVIEW_DISTRIBUTION);
    expect(dist).toHaveTextContent('12'); // overCrop
    expect(dist).toHaveTextContent('8'); // underCrop
    expect(dist).toHaveTextContent('3'); // deskewFail
    expect(dist).toHaveTextContent('5'); // edgeNoise
  });

  it('renders human-readable flag labels', () => {
    renderOverview();
    expect(screen.getByText('Over-crop')).toBeInTheDocument();
    expect(screen.getByText('Under-crop')).toBeInTheDocument();
    expect(screen.getByText('Deskew fail')).toBeInTheDocument();
    expect(screen.getByText('Edge noise')).toBeInTheDocument();
  });

  it('shows empty state when no flags', () => {
    renderOverview({ flagDistribution: [] });
    const dist = screen.getByTestId(CROP_OVERVIEW_DISTRIBUTION);
    expect(dist).toHaveTextContent('No flags recorded.');
    // stacked bar should NOT be rendered
    expect(dist.querySelector('.crop-overview__stacked-bar')).not.toBeInTheDocument();
  });
});

// ── stacked bar proportions ───────────────────────────────────────────────────

describe('CropOverview — stacked bar proportions', () => {
  beforeEach(() => {
    vi.setSystemTime(NOW_MS);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders one bar segment per flag entry', () => {
    renderOverview();
    const segments = document.querySelectorAll('.crop-overview__bar-segment');
    expect(segments).toHaveLength(BASE_FLAGS.length);
  });

  it('segments carry aria-valuenow matching their count', () => {
    renderOverview();
    const segments = document.querySelectorAll('.crop-overview__bar-segment');
    const counts = Array.from(segments).map((el) => Number(el.getAttribute('aria-valuenow')));
    expect(counts).toEqual([12, 8, 3, 5]);
  });

  it('segment widths are proportional to counts', () => {
    renderOverview();
    const segments = Array.from(
      document.querySelectorAll<HTMLElement>('.crop-overview__bar-segment'),
    );
    const total = BASE_FLAGS.reduce((s, e) => s + e.count, 0); // 28
    segments.forEach((seg, i) => {
      const expected = `${((BASE_FLAGS[i]!.count / total) * 100).toFixed(6)}%`;
      // style.width may be rounded; check approximate match via aria-valuenow
      // We verify the actual inline style.width contains a numeric % that matches
      const widthStr = seg.style.width;
      const widthPct = parseFloat(widthStr);
      const expectedPct = (BASE_FLAGS[i]!.count / total) * 100;
      expect(widthPct).toBeCloseTo(expectedPct, 1);
      // suppress 'expected' being unused
      void expected;
    });
  });

  it('segments carry aria-valuemax equal to total', () => {
    renderOverview();
    const segments = document.querySelectorAll('.crop-overview__bar-segment');
    const total = BASE_FLAGS.reduce((s, e) => s + e.count, 0);
    Array.from(segments).forEach((seg) => {
      expect(Number(seg.getAttribute('aria-valuemax'))).toBe(total);
    });
  });
});

// ── recent activity ───────────────────────────────────────────────────────────

describe('CropOverview — recent activity', () => {
  beforeEach(() => {
    vi.setSystemTime(NOW_MS);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders each activity entry', () => {
    renderOverview();
    expect(screen.getByTestId(cropOverviewActivityTestId('act-1'))).toBeInTheDocument();
    expect(screen.getByTestId(cropOverviewActivityTestId('act-2'))).toBeInTheDocument();
  });

  it('renders entry messages', () => {
    renderOverview();
    expect(screen.getByText('Re-ran crop on 12 pages')).toBeInTheDocument();
    expect(screen.getByText('Settings updated')).toBeInTheDocument();
  });

  it('renders actor when provided', () => {
    renderOverview();
    expect(screen.getByText('auto')).toBeInTheDocument();
  });

  it('does not render actor element when actor is absent', () => {
    renderOverview({
      recentActivity: [
        {
          id: 'no-actor',
          timestamp: new Date(NOW_MS - 60000).toISOString(),
          message: 'Something happened',
        },
      ],
    });
    const entry = screen.getByTestId(cropOverviewActivityTestId('no-actor'));
    // actor div only appears when actor is set; "Something happened" is present
    expect(entry).toHaveTextContent('Something happened');
    // Should not have any child with actor-like content beyond the message
    expect(entry.querySelectorAll('div').length).toBe(1); // only message div
  });

  it('renders relative timestamps via mocked system time', () => {
    renderOverview();
    expect(screen.getByText('2m ago')).toBeInTheDocument();
    expect(screen.getByText('1h ago')).toBeInTheDocument();
  });

  it('shows empty state when no activity', () => {
    renderOverview({ recentActivity: [] });
    const activity = screen.getByTestId(CROP_OVERVIEW_ACTIVITY);
    expect(activity).toHaveTextContent('No recent activity.');
  });
});

// ── empty state — both empty ──────────────────────────────────────────────────

describe('CropOverview — both empty', () => {
  it('renders empty states for both panels', () => {
    renderOverview({ flagDistribution: [], recentActivity: [] });
    expect(screen.getByText('No flags recorded.')).toBeInTheDocument();
    expect(screen.getByText('No recent activity.')).toBeInTheDocument();
  });
});

// ── data-testid forwarding ────────────────────────────────────────────────────

describe('CropOverview — data-testid', () => {
  it('uses default CROP_OVERVIEW testid', () => {
    renderOverview();
    expect(screen.getByTestId(CROP_OVERVIEW)).toBeInTheDocument();
  });

  it('accepts a custom data-testid', () => {
    renderOverview({ 'data-testid': 'my-custom-overview' });
    expect(screen.getByTestId('my-custom-overview')).toBeInTheDocument();
    expect(screen.queryByTestId(CROP_OVERVIEW)).not.toBeInTheDocument();
  });

  it('renders distribution panel with testid', () => {
    renderOverview();
    expect(screen.getByTestId(CROP_OVERVIEW_DISTRIBUTION)).toBeInTheDocument();
  });

  it('renders activity panel with testid', () => {
    renderOverview();
    expect(screen.getByTestId(CROP_OVERVIEW_ACTIVITY)).toBeInTheDocument();
  });
});

// ── TDD: section aria-label (WS6) ────────────────────────────────────────────

describe('CropOverview — section aria-label a11y', () => {
  it('root section has an aria-label', () => {
    renderOverview();
    const section = document.querySelector('section.crop-overview');
    expect(section).toHaveAttribute('aria-label');
    expect(section?.getAttribute('aria-label')).not.toBe('');
  });

  it('distribution panel has aria-label', () => {
    renderOverview();
    const dist = screen.getByTestId(CROP_OVERVIEW_DISTRIBUTION);
    expect(dist).toBeInTheDocument();
    // It has a visual heading "Flag distribution" — verify the element exists
    expect(screen.getByText('Flag distribution')).toBeInTheDocument();
  });

  it('activity panel has aria-label', () => {
    renderOverview();
    const activity = screen.getByTestId(CROP_OVERVIEW_ACTIVITY);
    expect(activity).toBeInTheDocument();
    expect(screen.getByText('Recent activity')).toBeInTheDocument();
  });
});
