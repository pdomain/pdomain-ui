import type * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface RetryActionPanelProps {
  title: React.ReactNode;
  message?: React.ReactNode;
  error?: React.ReactNode;
  retryAction?: React.ReactNode;
  detailsAction?: React.ReactNode;
  className?: string;
}

export function RetryActionPanel({
  title,
  message,
  error,
  retryAction,
  detailsAction,
  className,
}: RetryActionPanelProps): React.ReactElement {
  return (
    <section className={cn('pdui-retry-action-panel', className)}>
      <div className="pdui-retry-action-panel__title">{title}</div>
      {message ? <div className="pdui-retry-action-panel__message">{message}</div> : null}
      {error ? (
        <div className="pdui-retry-action-panel__error" role="alert">
          {error}
        </div>
      ) : null}
      {retryAction || detailsAction ? (
        <div className="pdui-retry-action-panel__actions">
          {detailsAction}
          {retryAction}
        </div>
      ) : null}
    </section>
  );
}
