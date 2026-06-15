import type * as React from 'react';
import { cn } from '../primitives/cn.js';

export type OperationState = 'idle' | 'queued' | 'running' | 'success' | 'warning' | 'error';

export interface OperationStatusPanelProps {
  title: React.ReactNode;
  message?: React.ReactNode;
  state: OperationState;
  progress?: number;
  details?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, progress));
}

export function OperationStatusPanel({
  title,
  message,
  state,
  progress,
  details,
  primaryAction,
  secondaryAction,
  className,
}: OperationStatusPanelProps): React.ReactElement {
  const clampedProgress = progress === undefined ? undefined : clampProgress(progress);
  const role = state === 'error' ? 'alert' : 'status';

  return (
    <section
      className={cn('pdui-operation-status-panel', className)}
      data-state={state}
      role={role}
      aria-live={state === 'error' ? 'assertive' : 'polite'}
    >
      <div className="pdui-operation-status-panel__summary">
        <span className="pdui-operation-status-panel__marker" aria-hidden="true" />
        <div className="pdui-operation-status-panel__body">
          <div className="pdui-operation-status-panel__title">{title}</div>
          {message ? <div className="pdui-operation-status-panel__message">{message}</div> : null}
        </div>
      </div>

      {clampedProgress !== undefined ? (
        <div
          className="pdui-operation-status-panel__progress"
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Operation progress"
        >
          <div className="pdui-operation-status-panel__progress-track">
            <div
              className="pdui-operation-status-panel__progress-fill"
              style={{ width: `${clampedProgress.toString()}%` }}
            />
          </div>
        </div>
      ) : null}

      {details ? <div className="pdui-operation-status-panel__details">{details}</div> : null}

      {primaryAction || secondaryAction ? (
        <div className="pdui-operation-status-panel__actions">
          {secondaryAction}
          {primaryAction}
        </div>
      ) : null}
    </section>
  );
}
