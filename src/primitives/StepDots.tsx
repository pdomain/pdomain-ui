import * as React from 'react';
import { Check } from '../icons/lucide.js';
import { cn } from './cn.js';

export type StepDotsState = 'active' | 'done' | 'pending';

export interface StepDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered list of step labels. */
  steps: string[];
  /** Zero-based index of the current (active) step. */
  current: number;
  /** Optional click handler; called with the zero-based step index. */
  onStepClick?: (index: number) => void;
}

function getState(index: number, current: number): StepDotsState {
  if (index === current) return 'active';
  if (index < current) return 'done';
  return 'pending';
}

export const StepDots = React.forwardRef<HTMLDivElement, StepDotsProps>(function StepDots(
  { steps, current, onStepClick, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label="Steps"
      className={cn('step-dots', className)}
      {...props}
    >
      {steps.map((label, i) => {
        const state = getState(i, current);
        const isActive = state === 'active';

        return (
          <React.Fragment key={i}>
            {/* Step item: dot + label */}
            {/* WS3: extract inline styles to CSS classes; L-CSS provides the rules */}
            <div
              role="tab"
              tabIndex={0}
              aria-selected={isActive}
              data-state={state}
              className={cn(
                'step-item',
                onStepClick !== undefined ? 'step-item--clickable' : undefined,
              )}
              onClick={() => onStepClick?.(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStepClick?.(i);
                }
              }}
            >
              {/* Circular dot — state-specific appearance driven by CSS data-state */}
              <div className={cn('step-dot', `step-dot--${state}`)} aria-hidden="true">
                {state === 'done' ? <Check size={10} strokeWidth={3} /> : i + 1}
              </div>

              {/* Step label — font weight driven by CSS data-state on parent */}
              <span className={cn('step-label', `step-label--${state}`)}>{label}</span>
            </div>

            {/* Connector line between steps */}
            {i < steps.length - 1 && <div className="step-connector" aria-hidden="true" />}
          </React.Fragment>
        );
      })}
    </div>
  );
});

StepDots.displayName = 'StepDots';
