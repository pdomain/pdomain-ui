import type { ReactNode } from 'react';
import { cn } from '../primitives/cn.js';

export interface SortOption {
  value: string;
  label: ReactNode;
}

export interface SortSelectProps {
  value: string;
  options: readonly SortOption[];
  onValueChange(this: void, value: string): void;
  ariaLabel: string;
  className?: string;
}

export function SortSelect({
  value,
  options,
  onValueChange,
  ariaLabel,
  className,
}: SortSelectProps) {
  return (
    <select
      className={cn('input pdui-sort-select', className)}
      value={value}
      aria-label={ariaLabel}
      onChange={(event) => onValueChange(event.currentTarget.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
