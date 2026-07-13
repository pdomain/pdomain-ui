import type { ReactNode } from 'react';
import { Button } from '../primitives/Button.js';
import { cn } from '../primitives/cn.js';

export interface CountFilter {
  id: string;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface CountFilterGroupProps {
  filters: readonly CountFilter[];
  activeId: string;
  onActiveChange(this: void, id: string): void;
  ariaLabel: string;
  className?: string;
}

export function CountFilterGroup({
  filters,
  activeId,
  onActiveChange,
  ariaLabel,
  className,
}: CountFilterGroupProps) {
  return (
    <div className={cn('pdui-count-filter-group', className)} role="group" aria-label={ariaLabel}>
      {filters.map((filter) => (
        <Button
          key={filter.id}
          className="pdui-count-filter-group__button"
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={filter.id === activeId}
          disabled={filter.disabled}
          onClick={() => onActiveChange(filter.id)}
        >
          <span className="pdui-count-filter-group__label">{filter.label}</span>
          {filter.count !== undefined ? (
            <>
              {' '}
              <span className="pdui-count-filter-group__count">{filter.count}</span>
            </>
          ) : null}
        </Button>
      ))}
    </div>
  );
}
