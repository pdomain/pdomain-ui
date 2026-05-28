import * as React from 'react';
import { Button } from '../../primitives/Button.js';
import { Segmented } from '../../primitives/Segmented.js';
import { StageToolbar } from '../../primitives/StageToolbar.js';
import type { SegmentedOption } from '../../primitives/Segmented.js';
import type { CropFlagKind } from './types.js';

export type { CropFlagKind };

// ─── Types ────────────────────────────────────────────────────────────────────

export type CropFilter = 'all' | 'flagged' | 'clean' | 'reviewed' | 'errors';
export type CropDensity = 's' | 'm' | 'l';

export interface CropFilterCounts {
  all: number;
  flagged: number;
  clean: number;
  reviewed: number;
  errors: number;
}

export interface CropFlagDrillCounts {
  overCrop: number;
  underCrop: number;
  deskewFail: number;
  edgeNoise: number;
}

export interface CropToolbarProps {
  filter: CropFilter;
  onFilterChange: (next: CropFilter) => void;
  counts: CropFilterCounts;
  /** When filter='flagged', show flag drill-down chips. */
  activeFlagDrill?: CropFlagKind | null;
  onFlagDrillChange?: (next: CropFlagKind | null) => void;
  flagCounts?: CropFlagDrillCounts;
  density: CropDensity;
  onDensityChange: (next: CropDensity) => void;
  onRerun?: () => void;
  'data-testid'?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_LABELS: Record<CropFilter, string> = {
  all: 'All',
  flagged: 'Flagged',
  clean: 'Clean',
  reviewed: 'Reviewed',
  errors: 'Errors',
};

const FLAG_LABELS: Record<CropFlagKind, string> = {
  overCrop: 'Over-crop',
  underCrop: 'Under-crop',
  deskewFail: 'Deskew fail',
  edgeNoise: 'Edge noise',
};

const ALL_FILTERS: CropFilter[] = ['all', 'flagged', 'clean', 'reviewed', 'errors'];
const ALL_FLAG_KINDS: CropFlagKind[] = ['overCrop', 'underCrop', 'deskewFail', 'edgeNoise'];

const DENSITY_OPTIONS: SegmentedOption[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CropToolbar — Crop-stage filter/density/rerun toolbar.
 *
 * Composes `StageToolbar` (leftSlot / centerSlot / rightSlot):
 * - Left: five filter chips (All / Flagged / Clean / Reviewed / Errors) with
 *   per-filter counts. When filter='flagged' and `flagCounts` is present,
 *   flag drill-down chips are shown below with an optional "Clear drill" button.
 * - Center: density Segmented (S / M / L).
 * - Right: optional Re-run CTA.
 *
 * All colors use CSS custom properties — no hex literals.
 */
export function CropToolbar({
  filter,
  onFilterChange,
  counts,
  activeFlagDrill,
  onFlagDrillChange,
  flagCounts,
  density,
  onDensityChange,
  onRerun,
  'data-testid': testId,
}: CropToolbarProps): React.ReactElement {
  const showFlagDrill = filter === 'flagged' && flagCounts !== undefined;

  const leftSlot = (
    <div className="crop-toolbar__left-group">
      {/* Primary filter chips */}
      <div className="crop-toolbar__filters" role="group" aria-label="Filter crop results">
        {ALL_FILTERS.map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              type="button"
              className={`crop-toolbar__chip${isActive ? ' crop-toolbar__chip--active' : ''}`}
              aria-pressed={isActive}
              data-testid={`crop-toolbar-filter-${f}`}
              onClick={() => {
                onFilterChange(f);
              }}
            >
              <span className="crop-toolbar__chip-label">{FILTER_LABELS[f]}</span>
              <span className="crop-toolbar__chip-count">{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {/* Flag drill-down chips — only when filter='flagged' */}
      {showFlagDrill ? (
        <div className="crop-toolbar__flag-drills" role="group" aria-label="Filter by flag type">
          {ALL_FLAG_KINDS.map((kind) => {
            const isActive = activeFlagDrill === kind;
            return (
              <button
                key={kind}
                type="button"
                className={`crop-toolbar__chip crop-toolbar__chip--flag${isActive ? ' crop-toolbar__chip--active' : ''}`}
                aria-pressed={isActive}
                data-testid={`crop-toolbar-flag-${kind}`}
                onClick={() => {
                  if (onFlagDrillChange !== undefined) {
                    onFlagDrillChange(isActive ? null : kind);
                  }
                }}
              >
                <span className="crop-toolbar__chip-label">{FLAG_LABELS[kind]}</span>
                {flagCounts !== undefined ? (
                  <span className="crop-toolbar__chip-count">{flagCounts[kind]}</span>
                ) : null}
              </button>
            );
          })}
          {activeFlagDrill !== null && activeFlagDrill !== undefined ? (
            <button
              type="button"
              className="crop-toolbar__chip crop-toolbar__chip--clear"
              data-testid="crop-toolbar-flag-clear"
              onClick={() => {
                if (onFlagDrillChange !== undefined) {
                  onFlagDrillChange(null);
                }
              }}
            >
              Clear drill
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const centerSlot = (
    <div data-testid="crop-toolbar-density">
      <Segmented
        options={DENSITY_OPTIONS}
        value={density}
        onChange={(val) => {
          onDensityChange(val as CropDensity);
        }}
        size="sm"
      />
    </div>
  );

  const rightSlot =
    onRerun !== undefined ? (
      <Button variant="primary" size="sm" onClick={onRerun} data-testid="crop-toolbar-rerun">
        Re-run
      </Button>
    ) : undefined;

  return (
    <StageToolbar
      leftSlot={leftSlot}
      centerSlot={centerSlot}
      rightSlot={rightSlot}
      aria-label="Crop toolbar"
      {...(testId !== undefined ? { 'data-testid': testId } : {})}
    />
  );
}

CropToolbar.displayName = 'CropToolbar';
