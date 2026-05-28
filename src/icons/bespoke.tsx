/**
 * Bespoke OCR-domain SVG icon components.
 *
 * Each component accepts:
 *   - size?: number  (default 24) — rendered as width + height attributes
 *   - className?: string
 *   - ...rest: React.SVGProps<SVGSVGElement>  (all standard SVG props pass through)
 *
 * All shapes use currentColor for stroke/fill so the icon inherits the
 * surrounding CSS color (no hex literals).
 */
import React from 'react';

/**
 * Shared props for all bespoke icon components.
 *
 * Icons are decorative by default: when no `aria-label` is provided,
 * `aria-hidden="true"` is applied so screen readers skip the icon (audit
 * WS6 / P2). Pass `aria-label` to make an icon meaningful.
 *
 * All standard SVG props are forwarded, so callers can override
 * `aria-hidden` or set `role` explicitly when needed.
 */
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/** Resolve aria accessibility props: hidden by default, labeled when aria-label is set. */
function a11yProps(rest: React.SVGProps<SVGSVGElement>): React.SVGProps<SVGSVGElement> {
  if (rest['aria-label'] !== undefined && rest['aria-label'] !== null) {
    return rest;
  }
  // Default: decorative icon
  return { 'aria-hidden': true, ...rest };
}

// ---------------------------------------------------------------------------
// Layer icons — represent document structure hierarchy layers
// ---------------------------------------------------------------------------

/** Represents a block-level layout layer (coarse structure). */
export function LayerBlock({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  );
}

/** Represents a paragraph-level layout layer. */
export function LayerPara({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );
}

/** Represents a line-level layout layer. */
export function LayerLine({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="16" x2="21" y2="16" />
    </svg>
  );
}

/** Represents a word-level layout layer (finest structure granularity). */
export function LayerWord({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <rect x="3" y="9" width="5" height="6" rx="1" />
      <rect x="10" y="9" width="4" height="6" rx="1" />
      <rect x="16" y="9" width="5" height="6" rx="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Mode icons — represent editor interaction modes
// ---------------------------------------------------------------------------

/** Select / pointer mode. */
export function ModeSelect({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      {/* Arrow cursor shape */}
      <polyline points="4,4 4,20 9,15 12,21 14,20 11,14 18,14 4,4" />
    </svg>
  );
}

/** Rebox mode — redraw bounding boxes. */
export function ModeRebox({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <rect x="5" y="5" width="14" height="14" rx="1" strokeDasharray="3 2" />
      <circle cx="5" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Erase mode — erase / delete words. */
export function ModeErase({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <path d="M20 20H7L3 16l10-10 7 7-3 3" />
      <line x1="6" y1="17" x2="14" y2="9" />
    </svg>
  );
}

/** CharFixer mode — fix individual character recognition errors. */
export function ModeCharFixer({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      {/* Text "T" with a wrench underneath */}
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="12" y1="6" x2="12" y2="14" />
      <path d="M8 19 Q10 17 12 19 Q14 21 16 19" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MatchStatus icons — represent OCR match quality states
// ---------------------------------------------------------------------------

/** Exact match — OCR text matches reference exactly. */
export function MatchStatusExact({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="8,12 11,15 16,9" />
    </svg>
  );
}

/** Fuzzy match — OCR text approximately matches reference. */
export function MatchStatusFuzzy({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10 Q12 8 15 10 Q12 12 12 14" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Mismatch — OCR text does not match reference. */
export function MatchStatusMismatch({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(rest)}
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}
