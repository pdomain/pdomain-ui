import * as React from 'react';
import { Badge } from '../../primitives/Badge.js';
import type { BadgeTone } from '../../primitives/Badge.js';
import { THUMB_CARD, thumbCardTestId } from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Role of a page in the source stage. */
export type SourcePageRole = 'page' | 'cover' | 'back' | 'blank' | 'duplicate' | 'removed';

/** Processing status of a source page. */
export type SourcePageStatus = 'ok' | 'warn' | 'error' | 'pending';

/** A single page in the Source stage. */
export interface SourcePage {
  id: string;
  pageNumber: number;
  thumbnailUrl: string;
  status: SourcePageStatus;
  role: SourcePageRole;
}

/**
 * Density of the thumbnail grid.
 * Matches the SourceDensity type in FileToolbar — kept in sync by contract.
 * 's' = small (no checkbox); 'm' = medium; 'l' = large.
 */
export type ThumbDensity = 's' | 'm' | 'l';

/** Props for the ThumbCard component. */
export interface ThumbCardProps {
  page: SourcePage;
  density: ThumbDensity;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onRoleChange?: (id: string, role: SourcePageRole) => void;
  'data-testid'?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maps each SourcePageRole to a Badge tone. */
const ROLE_TONE: Record<SourcePageRole, BadgeTone> = {
  page: 'neutral',
  cover: 'brand',
  back: 'neutral',
  blank: 'fuzzy',
  duplicate: 'ocr',
  removed: 'mismatch',
};

const ALL_ROLES: SourcePageRole[] = ['page', 'cover', 'back', 'blank', 'duplicate', 'removed'];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ThumbCard — per-page thumbnail card for the Source stage grid.
 *
 * Shows a thumbnail image, page number overlay, status dot, role badge,
 * and (for medium/large density) a selection checkbox.
 *
 * Clicking the card body fires onSelect; changing the role select fires onRoleChange.
 */
export const ThumbCard = React.forwardRef<HTMLElement, ThumbCardProps>(function ThumbCard(
  { page, density, selected, onSelect, onRoleChange, 'data-testid': testId = THUMB_CARD },
  ref,
) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  /**
   * Single selection path — all selection events funnel here.
   * When a checkbox is present (density !== 's'), the body button
   * forwards its click to the checkbox so there is exactly one
   * onSelect call per user interaction.
   */
  const handleSelect = () => {
    if (onSelect !== undefined) {
      onSelect(page.id);
    }
  };

  const handleBodyClick = () => {
    if (density !== 's' && checkboxRef.current !== null) {
      // Delegate to the checkbox — the checkbox onChange will call handleSelect.
      checkboxRef.current.click();
    } else {
      handleSelect();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent the change event from bubbling further; selection is handled here.
    e.stopPropagation();
    handleSelect();
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onRoleChange !== undefined) {
      onRoleChange(page.id, e.target.value as SourcePageRole);
    }
  };

  return (
    <article
      ref={ref}
      className="thumb-card"
      data-density={density}
      {...(selected !== undefined ? { 'data-selected': selected } : {})}
      data-testid={testId}
    >
      {density !== 's' && (
        <input
          ref={checkboxRef}
          type="checkbox"
          className="thumb-card__checkbox"
          checked={selected === true}
          aria-label={`Select page ${page.pageNumber}`}
          onChange={handleCheckboxChange}
          data-testid={`${thumbCardTestId(page.id)}-checkbox`}
        />
      )}

      {/* Clickable image body — keyboard-accessible button */}
      <button
        type="button"
        className="thumb-card__body"
        aria-pressed={selected === true}
        onClick={handleBodyClick}
      >
        <img
          src={page.thumbnailUrl}
          alt={`page ${page.pageNumber}`}
          className="thumb-card__image"
        />
        <span className="thumb-card__pageno">{page.pageNumber}</span>
        <span className="thumb-card__status" data-status={page.status} aria-label={page.status} />
      </button>

      <div className="thumb-card__footer">
        <Badge tone={ROLE_TONE[page.role]} className="thumb-card__role-badge">
          {page.role}
        </Badge>

        <select
          className="thumb-card__role-select"
          value={page.role}
          aria-label="Change page role"
          data-testid={`${thumbCardTestId(page.id)}-role-select`}
          onChange={handleRoleChange}
        >
          {ALL_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
});

ThumbCard.displayName = 'ThumbCard';
