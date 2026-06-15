import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  if (!open) {
    return null;
  }

  const accessibleTitle = title ?? ariaLabel ?? 'Operation in progress';

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={cn('pdui-blocking-operation-overlay', className)}>
          <DialogPrimitive.Content
            className="pdui-blocking-operation-overlay__panel"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-describedby={undefined}
            onOpenAutoFocus={() => {
              previouslyFocusedRef.current =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (previouslyFocusedRef.current?.isConnected === true) {
                previouslyFocusedRef.current.focus({ preventScroll: true });
              }
              previouslyFocusedRef.current = null;
            }}
          >
            <div
              className="pdui-blocking-operation-overlay__status"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <DialogPrimitive.Title
                className={cn(
                  'pdui-blocking-operation-overlay__title',
                  title ? undefined : 'pdui-blocking-operation-overlay__title--hidden',
                )}
              >
                {accessibleTitle}
              </DialogPrimitive.Title>

              {message ? (
                <div className="pdui-blocking-operation-overlay__message">{message}</div>
              ) : null}

              {progress !== undefined ? (
                <OperationProgress
                  baseClassName="pdui-blocking-operation-overlay"
                  value={progress}
                />
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
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
