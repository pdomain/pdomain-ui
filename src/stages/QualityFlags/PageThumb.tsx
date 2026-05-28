import * as React from 'react';
import { Thumbnail } from '../../primitives/Thumbnail.js';
import { FlagChip } from '../../primitives/FlagChip.js';
import type { FlagKind } from '../../primitives/FlagChip.js';
import { QUALITY_PAGE_THUMB, qualityPageThumbTestId } from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A flag entry for the QualityFlags PageThumb overlay. */
export interface PageThumbFlag {
  /** Stable unique identifier for this flag instance. */
  id: string;
  /** Display label — passed to FlagChip as `label`. Defaults to `kind` if omitted. */
  label?: string;
  /**
   * FlagChip `kind` — used to derive tone via CSS `data-kind` attribute.
   * Defaults to the `id` value when not supplied so arbitrary flag ids still render.
   */
  kind?: FlagKind;
  /**
   * Override CSS custom property for the dot/border tone color.
   * Omit to let FlagChip derive tone from `kind`.
   */
  tone?: string;
}

/** Minimal page shape for QualityFlags PageThumb. */
export interface PageThumbPage {
  id: string;
  number: number | string;
  thumbnailUrl?: string;
}

export interface PageThumbProps {
  /** Page data. */
  page: PageThumbPage;
  /** Flag pills to overlay in the top-right corner. */
  flags: PageThumbFlag[];
  /**
   * Maximum number of flag pills to show before collapsing into an overflow badge.
   * Defaults to 3.
   */
  maxFlags?: number;
  /** Whether this thumb is currently selected. */
  selected?: boolean;
  /**
   * Selection callback.
   * When provided, the root element is rendered as a `<button>`
   * with `aria-pressed={selected ?? false}`.
   * When absent, the root is a `<div>` (non-interactive).
   */
  onSelect?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PageThumb (QualityFlags variant) — per-page thumbnail with quality flag pills
 * overlaid in the top-right corner. Distinct from Source's `ThumbCard` (no role
 * segment) and PageReorder's `PageThumb` (different stage context).
 *
 * Composed from `Thumbnail` (layout chrome) + `FlagChip` (overlay pills).
 * Token-only styling; no hex literals.
 */
export function PageThumb({
  page,
  flags,
  maxFlags = 3,
  selected,
  onSelect,
}: PageThumbProps): React.ReactElement {
  const visibleFlags = flags.slice(0, maxFlags);
  const overflowCount = flags.length - visibleFlags.length;

  // Build the flag-chip stack rendered in the top-right overlay slot.
  const flagOverlay: React.ReactNode =
    visibleFlags.length > 0 || overflowCount > 0 ? (
      <div className="quality-page-thumb__flags">
        {visibleFlags.map((f) => (
          <FlagChip
            key={f.id}
            kind={f.kind ?? f.id}
            {...(f.label !== undefined ? { label: f.label } : {})}
            {...(f.tone !== undefined ? { tone: f.tone } : {})}
          />
        ))}
        {overflowCount > 0 && (
          <span className="quality-page-thumb__overflow">+{overflowCount}</span>
        )}
      </div>
    ) : undefined;

  const isInteractive = onSelect != null;
  const hasImage = page.thumbnailUrl !== undefined && page.thumbnailUrl !== '';

  // Inner Thumbnail always gets QUALITY_PAGE_THUMB testid (generic constant).
  // When imageUrl is absent, render a skeleton placeholder to avoid a broken <img>.
  const innerThumbnail = hasImage ? (
    <Thumbnail
      imageUrl={page.thumbnailUrl as string}
      imageAlt={`Page ${String(page.number)}`}
      pageNumber={String(page.number)}
      {...(selected !== undefined ? { selected } : {})}
      {...(flagOverlay !== undefined ? { overlayTopRight: flagOverlay } : {})}
      className="quality-page-thumb__inner"
      data-testid={QUALITY_PAGE_THUMB}
    />
  ) : (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-sunk)',
        borderRadius: 'var(--radius-md)',
        aspectRatio: '3/4',
        width: '100%',
        color: 'var(--ink-4)',
        fontSize: 'var(--text-sm)',
      }}
      aria-label={`Page ${String(page.number)} — image loading`}
      data-testid={QUALITY_PAGE_THUMB}
    >
      {page.number}
    </div>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className="quality-page-thumb quality-page-thumb--interactive"
        aria-pressed={selected ?? false}
        data-testid={qualityPageThumbTestId(page.id)}
        {...(selected ? { 'data-selected': 'true' as const } : {})}
        onClick={onSelect}
      >
        {innerThumbnail}
      </button>
    );
  }

  return (
    <div
      className="quality-page-thumb"
      data-testid={qualityPageThumbTestId(page.id)}
      {...(selected ? { 'data-selected': 'true' as const } : {})}
    >
      {innerThumbnail}
    </div>
  );
}

PageThumb.displayName = 'PageThumb';
