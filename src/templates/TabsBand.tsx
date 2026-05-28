/**
 * TabsBand — per-stage tab band molecule.
 *
 * Design source: docs/templates/design_handoff_pdomain_ui/final/pipeline/pipeline-template.jsx
 * Component: `TabsBand` (lines 226–263)
 *
 * Renders a horizontal row of underline-style tabs. Purely presentational —
 * no internal state. The caller drives `current`/`onTabChange`. Suitable as
 * the default `tabsSlot` inside PipelineTemplate.
 *
 * Constraints:
 * - No hex literals — all colors via var(--token).
 * - No CVA — variants are CSS class modifiers.
 * - No direct lucide-react imports — pass icon nodes from @pdomain/pdomain-ui/icons.
 */
import * as React from 'react';
import { cn } from '../primitives/cn.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TabsBandItem {
  /** Unique identifier; matched against `current`. */
  id: string;
  /** Display label for the tab. */
  name: string;
  /** Optional icon node (use icons from @pdomain/pdomain-ui/icons). */
  icon?: React.ReactNode;
  /** Optional numeric badge count rendered beside the label. */
  count?: number;
}

export interface TabsBandProps {
  /** Ordered list of tab items to render. */
  items: TabsBandItem[];
  /** ID of the currently active tab. */
  current: string;
  /** Called with the clicked tab's `id` when the user clicks a tab. */
  onTabChange?: (id: string) => void;
  /**
   * When true, adds `.tabs-band--sticky` class so the band can be positioned
   * sticky by a parent layout without extra wrapper elements.
   */
  sticky?: boolean;
  /**
   * Optional content rendered flush-right inside the band.
   * Useful for filter controls, action buttons, or count summaries.
   */
  rightSlot?: React.ReactNode;
  /** Additional class names applied to the root element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Horizontal tab band molecule ported from the pipeline design template.
 *
 * Usage:
 * ```tsx
 * <TabsBand
 *   items={[
 *     { id: 'overview', name: 'Overview' },
 *     { id: 'pages',    name: 'Pages', count: 47 },
 *     { id: 'settings', name: 'Settings' },
 *   ]}
 *   current="pages"
 *   onTabChange={setActiveTab}
 * />
 * ```
 */
export const TabsBand: React.FC<TabsBandProps> = ({
  items,
  current,
  onTabChange,
  sticky = false,
  rightSlot,
  className,
}) => {
  const id = React.useId();

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    const last = items.length - 1;
    let next = idx;
    if (e.key === 'ArrowRight') next = idx === last ? 0 : idx + 1;
    else if (e.key === 'ArrowLeft') next = idx === 0 ? last : idx - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else return;
    e.preventDefault();
    const targetId = items[next]?.id;
    if (targetId !== undefined) {
      onTabChange?.(targetId);
      // Move DOM focus to the newly-active tab button.
      const tabEl = document.querySelector<HTMLElement>(
        `[data-tabsband-id="${id}"][data-tab-id="${targetId}"]`,
      );
      tabEl?.focus();
    }
  }

  return (
    <div role="tablist" className={cn('tabs-band', sticky && 'tabs-band--sticky', className)}>
      <div className="tabs-band__tabs">
        {items.map((item, idx) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${id}-panel-${item.id}`}
              id={`${id}-tab-${item.id}`}
              tabIndex={active ? 0 : -1}
              data-tabsband-id={id}
              data-tab-id={item.id}
              className={cn('tabs-band__tab', active && 'tabs-band__tab--active')}
              onClick={() => onTabChange?.(item.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            >
              {item.icon != null ? (
                <span className="tabs-band__icon" aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              <span className="tabs-band__label">{item.name}</span>
              {item.count != null ? <span className="tabs-band__count">{item.count}</span> : null}
            </button>
          );
        })}
      </div>
      {rightSlot != null ? <div className="tabs-band__right">{rightSlot}</div> : null}
    </div>
  );
};

TabsBand.displayName = 'TabsBand';
