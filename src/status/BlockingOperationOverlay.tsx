import type * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface BlockingOperationOverlayProps {
  open: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  progress?: number;
  cancelAction?: React.ReactNode;
  bestEffortCancel?: boolean;
  ariaLabel?: string;
  className?: string;
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, progress));
}

export function BlockingOperationOverlay({
  open,
  title,
  message,
  progress,
  cancelAction,
  bestEffortCancel,
  ariaLabel,
  className,
}: BlockingOperationOverlayProps): React.ReactElement | null {
  if (!open) {
    return null;
  }

  const clampedProgress = progress === undefined ? undefined : clampProgress(progress);

  return (
    <div className={cn('pdui-blocking-operation-overlay', className)}>
      <section
        className="pdui-blocking-operation-overlay__panel"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        {title ? <div className="pdui-blocking-operation-overlay__title">{title}</div> : null}
        {message ? <div className="pdui-blocking-operation-overlay__message">{message}</div> : null}

        {clampedProgress !== undefined ? (
          <div
            className="pdui-blocking-operation-overlay__progress"
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Operation progress"
          >
            <div className="pdui-blocking-operation-overlay__progress-track">
              <div
                className="pdui-blocking-operation-overlay__progress-fill"
                style={{ width: `${clampedProgress.toString()}%` }}
              />
            </div>
          </div>
        ) : null}

        {bestEffortCancel ? (
          <div className="pdui-blocking-operation-overlay__hint">
            Cancellation is best effort; the operation may finish before it stops.
          </div>
        ) : null}

        {cancelAction ? (
          <div className="pdui-blocking-operation-overlay__actions">{cancelAction}</div>
        ) : null}
      </section>
    </div>
  );
}
