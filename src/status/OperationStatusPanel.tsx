import type * as React from 'react';
import { cn } from '../primitives/cn.js';
import { OperationProgress } from './progress.js';

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

      {progress !== undefined ? (
        <OperationProgress baseClassName="pdui-operation-status-panel" value={progress} />
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
