import * as React from 'react';
import { cn } from './cn.js';

export interface PageChipProps {
  /** Mono-font page prefix label, e.g. `"p019"`. */
  prefix: string;
  /** Click handler — makes the chip interactive (renders as `<button>`). */
  onClick?: () => void;
  /** Visual highlight when this chip is the active/selected page. */
  selected?: boolean;
  /** Forwarded to the root element for Playwright targeting. */
  'data-testid'?: string;
  className?: string;
}

/**
 * PageChip — mono-font navigation chip for page prefixes (e.g. `p019`).
 *
 * Renders as a `<button>` when `onClick` is provided, otherwise as a `<span>`.
 * Font is driven by `var(--mono-font)`; colors are CSS custom properties only.
 *
 * Promoted to `src/primitives/` in Phase 2 M2 — generic enough to be shared
 * across every pdomain-* app that needs page navigation chips.
 */
export function PageChip({
  prefix,
  onClick,
  selected,
  className,
  'data-testid': testId,
}: PageChipProps): React.ReactElement {
  const classes = cn('page-chip', selected ? 'page-chip--selected' : undefined, className);

  if (onClick != null) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-pressed={selected}
        data-testid={testId}
      >
        {prefix}
      </button>
    );
  }

  return (
    <span className={classes} data-testid={testId}>
      {prefix}
    </span>
  );
}

PageChip.displayName = 'PageChip';
