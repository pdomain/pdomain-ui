import * as React from 'react';
import { cn } from './cn.js';

export type TriStateValue = 'off' | 'on' | 'mixed';

export interface TriStateChipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: TriStateValue;
  onChange?: (next: TriStateValue) => void;
}

const nextTriStateValue: Record<TriStateValue, TriStateValue> = {
  off: 'on',
  on: 'mixed',
  mixed: 'off',
};

function ariaPressedForValue(value: TriStateValue): boolean | 'mixed' {
  if (value === 'mixed') {
    return 'mixed';
  }

  return value === 'on';
}

export const TriStateChip = React.forwardRef<HTMLDivElement, TriStateChipProps>(
  function TriStateChip(
    { children, className, onChange, onClick, onKeyDown, value = 'off', ...props },
    ref,
  ) {
    const cycle = React.useCallback(() => {
      onChange?.(nextTriStateValue[value]);
    }, [onChange, value]);

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-pressed={ariaPressedForValue(value)}
        data-tristate=""
        data-tristate-value={value}
        className={cn(
          'chip3',
          value === 'on' ? 'all' : undefined,
          value === 'mixed' ? 'some' : undefined,
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            cycle();
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            cycle();
          }
        }}
        {...props}
      >
        <span aria-hidden="true" className="tri-dot" />
        {children}
      </div>
    );
  },
);

TriStateChip.displayName = 'TriStateChip';
