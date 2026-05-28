import * as React from 'react';
import type { JobState } from '../types/job-state.js';
import { cn } from './cn.js';

export type { JobState };

export interface JobStatusPipProps extends React.HTMLAttributes<HTMLDivElement> {
  state: JobState;
  label?: string;
}

// Map job state to the CSS custom property token used for color.
// The .pip class uses `color` to drive bg (at 10%) and border (at 33%)
// via inline color-mix — so a single CSS variable drives all three.
const stateToken: Record<JobState, string> = {
  queued: 'var(--ink-3)',
  running: 'var(--ocr)',
  succeeded: 'var(--exact)',
  failed: 'var(--mismatch)',
  cancelled: 'var(--fuzzy)',
};

export const JobStatusPip = React.forwardRef<HTMLDivElement, JobStatusPipProps>(
  function JobStatusPip({ state, label, className, style, ...props }, ref) {
    const token = stateToken[state];
    const displayLabel = label !== undefined ? label : state;
    return (
      <div
        ref={ref}
        data-testid={`job-status-pip-${state}`}
        className={cn('pip', state === 'running' ? 'pip--running' : '', className)}
        style={{
          color: token,
          background: `color-mix(in srgb, ${token} 10%, transparent)`,
          borderColor: `color-mix(in srgb, ${token} 33%, transparent)`,
          ...style,
        }}
        {...props}
      >
        {/* WS6: decorative dot is aria-hidden; the label text conveys state */}
        <span className="dot" style={{ background: token }} aria-hidden="true" />
        <span>{displayLabel}</span>
      </div>
    );
  },
);

JobStatusPip.displayName = 'JobStatusPip';
