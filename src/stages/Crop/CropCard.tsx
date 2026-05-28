import * as React from 'react';
import { Thumbnail } from '../../primitives/Thumbnail.js';
import { CROP_CARD, cropCardTestId, cropCardFlagTestId } from '../../testids/index.js';
import type { CropFlagKind } from './types.js';

export type { CropFlagKind };

/** Density of the crop grid. */
export type CropDensity = 's' | 'm' | 'l';

/** Processing status of a crop page. */
export type CropStatus = 'clean' | 'flagged' | 'reviewed' | 'error';

/** Bounding-box overlay coordinates (normalized). */
export interface CropBbox {
  /** Normalized [x, y, w, h] (0-1). */
  bbox: [number, number, number, number];
}

/** A single page in the Crop stage. */
export interface CropPage {
  id: string;
  pageNumber: number;
  thumbnailUrl: string;
  status: CropStatus;
  /** Flag kinds detected on this page. */
  flags: ReadonlyArray<CropFlagKind>;
  /** Optional bbox overlay coordinates. */
  bbox?: CropBbox;
}

/** Props for the CropCard component. */
export interface CropCardProps {
  page: CropPage;
  density: CropDensity;
  selected?: boolean;
  onSelect?: (id: string) => void;
  'data-testid'?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** How many flag chips to show per density before "+N" overflow. */
const MAX_FLAGS: Record<CropDensity, number> = {
  s: 0,
  m: 2,
  l: 4,
};

/** Human-readable labels for each flag kind. */
const FLAG_LABELS: Record<CropFlagKind, string> = {
  overCrop: 'over',
  underCrop: 'under',
  deskewFail: 'deskew',
  edgeNoise: 'edge',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BboxOverlayProps {
  bbox: CropBbox;
}

function BboxOverlay({ bbox }: BboxOverlayProps): React.ReactElement {
  const [x, y, w, h] = bbox.bbox;
  return (
    <div
      className="crop-card__bbox"
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
        border: '2px solid var(--accent)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    />
  );
}

interface FlagChipsProps {
  flags: ReadonlyArray<CropFlagKind>;
  density: CropDensity;
  pageId: string;
}

function FlagChips({ flags, density, pageId }: FlagChipsProps): React.ReactElement | null {
  const max = MAX_FLAGS[density];

  if (flags.length === 0) {
    return null;
  }

  // density 's': show only the count badge, no chips
  if (max === 0) {
    return (
      <span className="crop-card__flag-count" aria-label={`${flags.length} flags`}>
        {flags.length}
      </span>
    );
  }

  const visible = flags.slice(0, max);
  const overflow = flags.length - visible.length;

  return (
    <div className="crop-card__flags">
      {visible.map((kind) => (
        <span
          key={kind}
          className="crop-card__flag-chip"
          data-flag={kind}
          data-testid={cropCardFlagTestId(pageId, kind)}
        >
          {FLAG_LABELS[kind]}
        </span>
      ))}
      {overflow > 0 && (
        <span className="crop-card__flag-overflow" aria-label={`${overflow} more flags`}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CropCard — per-page crop thumbnail card for the Crop stage grid.
 *
 * Composes the `Thumbnail` primitive with:
 *   - Status dot (statusSlot)
 *   - Bbox overlay (imageOverlay) when page.bbox present
 *   - Flag chip pills with "+N" overflow (overlayBottomLeft)
 *   - Checkbox (overlayTopLeft) when density !== 's' and onSelect provided
 *
 * No role badge (Crop is role-free unlike Source).
 */
export function CropCard({
  page,
  density,
  selected,
  onSelect,
  'data-testid': testId = CROP_CARD,
}: CropCardProps): React.ReactElement {
  const handleClick = React.useCallback(() => {
    if (onSelect !== undefined) {
      onSelect(page.id);
    }
  }, [onSelect, page.id]);

  const handleCheckboxChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (onSelect !== undefined) {
        onSelect(page.id);
      }
    },
    [onSelect, page.id],
  );

  const statusSlot = (
    <span className="crop-card__status" data-status={page.status} aria-label={page.status} />
  );

  const bboxOverlay = page.bbox !== undefined ? <BboxOverlay bbox={page.bbox} /> : undefined;

  const flagChipsNode = <FlagChips flags={page.flags} density={density} pageId={page.id} />;

  const checkbox =
    density !== 's' && onSelect !== undefined ? (
      <input
        type="checkbox"
        className="crop-card__checkbox"
        checked={selected === true}
        aria-label={`Select page ${page.pageNumber}`}
        onChange={handleCheckboxChange}
        data-testid={`${cropCardTestId(page.id)}-checkbox`}
      />
    ) : undefined;

  return (
    <Thumbnail
      imageUrl={page.thumbnailUrl}
      imageAlt={`page ${page.pageNumber}`}
      pageNumber={page.pageNumber}
      density={density}
      {...(selected !== undefined ? { selected } : {})}
      {...(onSelect !== undefined ? { onClick: handleClick } : {})}
      onClickLabel={`Select page ${page.pageNumber}`}
      statusSlot={statusSlot}
      {...(bboxOverlay !== undefined ? { imageOverlay: bboxOverlay } : {})}
      {...(flagChipsNode !== null ? { overlayBottomLeft: flagChipsNode } : {})}
      {...(checkbox !== undefined ? { overlayTopLeft: checkbox } : {})}
      className="crop-card"
      data-testid={testId ?? cropCardTestId(page.id)}
    />
  );
}
