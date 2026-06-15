import * as React from 'react';
import { cn } from '../primitives/cn.js';
import { OperationProgress } from './progress.js';

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
  const panelRef = React.useRef<HTMLElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus({ preventScroll: true });

    return () => {
      if (previouslyFocused?.isConnected === true) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const titleElementId = ariaLabel === undefined && title ? titleId : undefined;

  return (
    <div className={cn('pdui-blocking-operation-overlay', className)}>
      <section
        ref={panelRef}
        className="pdui-blocking-operation-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={titleElementId}
        tabIndex={-1}
      >
        <div
          className="pdui-blocking-operation-overlay__status"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          {title ? (
            <div className="pdui-blocking-operation-overlay__title" id={titleElementId}>
              {title}
            </div>
          ) : null}
          {message ? (
            <div className="pdui-blocking-operation-overlay__message">{message}</div>
          ) : null}

          {progress !== undefined ? (
            <OperationProgress baseClassName="pdui-blocking-operation-overlay" value={progress} />
          ) : null}

          {bestEffortCancel ? (
            <div className="pdui-blocking-operation-overlay__hint">
              Cancellation is best effort; the operation may finish before it stops.
            </div>
          ) : null}
        </div>

        {cancelAction ? (
          <div className="pdui-blocking-operation-overlay__actions">{cancelAction}</div>
        ) : null}
      </section>
    </div>
  );
}
