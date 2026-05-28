import * as React from 'react';
import { cn } from './cn.js';

export type ViewMode = 'list' | 'thumb';

export interface ViewToggleProps {
  /** Currently active view mode. Defaults to `"list"`. */
  mode?: ViewMode;
  /** Called with the new mode when the user selects an option. */
  onChange: (mode: ViewMode) => void;
  className?: string;
}

interface ViewOption {
  id: ViewMode;
  label: string;
}

const OPTIONS: ViewOption[] = [
  { id: 'list', label: 'List' },
  { id: 'thumb', label: 'Thumbnails' },
];

/**
 * ViewToggle — segmented pill for switching between list and thumbnail views.
 *
 * Used in wf03/05/05b/11/wf-pw page-list stages.
 * Icon rendering is deferred to CSS `::before` content on `.view-toggle__option-icon`
 * so no icon import is needed inside this primitive.
 *
 * WS6: implements roving-tabindex (P3) with Arrow-key nav.
 * Active option has tabIndex=0; inactive has tabIndex=-1.
 */
export function ViewToggle({
  mode = 'list',
  onChange,
  className,
}: ViewToggleProps): React.ReactElement {
  const groupRef = React.useRef<HTMLDivElement>(null);

  // WS6 P3: arrow-key navigation within the group
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      const last = OPTIONS.length - 1;
      let next: number | null = null;

      if (e.key === 'ArrowRight') {
        next = idx === last ? 0 : idx + 1;
      } else if (e.key === 'ArrowLeft') {
        next = idx === 0 ? last : idx - 1;
      } else {
        return;
      }

      e.preventDefault();
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('button');
      buttons?.[next]?.focus();
    },
    [],
  );

  return (
    <div
      ref={groupRef}
      className={cn('view-toggle', className)}
      role="group"
      aria-label="View mode"
    >
      {OPTIONS.map((opt, idx) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            data-id={opt.id}
            // WS6: roving tabIndex — only active option in tab sequence
            tabIndex={active ? 0 : -1}
            className={cn(
              'view-toggle__option',
              active ? 'view-toggle__option--active' : undefined,
            )}
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            <span
              className={cn('view-toggle__option-icon', `view-toggle__option-icon--${opt.id}`)}
              aria-hidden="true"
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

ViewToggle.displayName = 'ViewToggle';
