import * as React from 'react';
import { cn } from './cn.js';

export type ProgressStatus = 'running' | 'done' | 'errored' | 'review';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value 0–100 */
  value?: number;
  status?: ProgressStatus;
  label?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { className, value = 0, status, label, ...props },
  ref,
) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      // WS6: polite live region lets screen readers announce updates without
      // interrupting current speech; callers can override via {...props}.
      aria-live="polite"
      className={cn('progress', status !== undefined ? `t-${status}` : undefined, className)}
      {...props}
    >
      <div className="track">
        <div className="fill" style={{ width: `${clampedValue.toString()}%` }} />
      </div>
      {label !== undefined && <span className="count">{label}</span>}
    </div>
  );
});

Progress.displayName = 'Progress';
