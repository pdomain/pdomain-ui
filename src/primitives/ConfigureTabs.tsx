import * as React from 'react';
import { cn } from './cn.js';

export interface ConfigureTabItem {
  /** Unique tab identifier. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional badge count shown after the label (e.g. flag count). */
  count?: number;
}

export interface ConfigureTabsProps {
  /** Ordered list of tabs. */
  tabs: ConfigureTabItem[];
  /** Currently selected tab id. */
  value: string;
  /** Called with the new tab id when the user clicks an inactive tab. */
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * ConfigureTabs — horizontal tab strip for configure / detail panels.
 *
 * Renders a tablist with accessible aria-selected state. Used in
 * wf03/wf11/wf-pw configure panes (General / Advanced / Flags etc.).
 * Token-only styling; no hex literals. No Radix dependency — this is
 * a pure layout/a11y wrapper; the panel body is composed by the consumer.
 *
 * WS6: implements roving-tabindex pattern (P3) with Arrow/Home/End key nav.
 * Active tab has tabIndex=0; others have tabIndex=-1.
 */
export function ConfigureTabs({
  tabs,
  value,
  onValueChange,
  className,
}: ConfigureTabsProps): React.ReactElement {
  const listRef = React.useRef<HTMLDivElement>(null);

  // WS6 P3: arrow-key navigation within the tablist
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      const last = tabs.length - 1;
      let next: number | null = null;

      if (e.key === 'ArrowRight') {
        next = idx === last ? 0 : idx + 1;
      } else if (e.key === 'ArrowLeft') {
        next = idx === 0 ? last : idx - 1;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = last;
      } else {
        return;
      }

      e.preventDefault();
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      buttons?.[next]?.focus();
    },
    [tabs],
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn('configure-tabs', className)}
      aria-label="Configure sections"
    >
      {tabs.map((tab, idx) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`configure-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`configure-panel-${tab.id}`}
            // WS6: roving tabIndex — only the active tab is in the tab sequence
            tabIndex={active ? 0 : -1}
            className={cn(
              'configure-tabs__tab',
              active ? 'configure-tabs__tab--active' : undefined,
            )}
            onClick={active ? undefined : () => onValueChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            <span className="configure-tabs__label">{tab.label}</span>
            {tab.count != null ? <span className="configure-tabs__count">{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

ConfigureTabs.displayName = 'ConfigureTabs';
