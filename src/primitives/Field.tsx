import * as React from 'react';
import { cn } from './cn.js';
import { FieldContext } from './FieldContext.js';

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The label text for the field */
  label?: string;
  /** The htmlFor attribute — links the label to the input by id */
  htmlFor?: string;
  /** Error message — renders the error slot when set */
  error?: string;
  /**
   * Explicit id for the error span. When omitted, Field auto-generates
   * `${htmlFor}-error` (requires `htmlFor` to be set).
   * Provide this when using a Radix Select or another component where the
   * trigger id differs from the logical field id.
   */
  errorId?: string;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { className, label, htmlFor, error, errorId: errorIdProp, children, ...props },
  ref,
) {
  const hasError = error !== undefined && error !== '';

  // Derive a stable error id: prefer explicit prop, fall back to `${htmlFor}-error`.
  const resolvedErrorId: string | undefined =
    errorIdProp ?? (htmlFor !== undefined ? `${htmlFor}-error` : undefined);

  const contextValue = React.useMemo(
    () => ({ errorId: hasError ? resolvedErrorId : undefined, hasError }),
    [hasError, resolvedErrorId],
  );

  return (
    <FieldContext.Provider value={contextValue}>
      <div ref={ref} className={cn('field', className)} {...props}>
        {label !== undefined && <label htmlFor={htmlFor}>{label}</label>}
        {children}
        {hasError && (
          // WS6: role=status (not alert) — alert announces on every render including
          // mount, which disrupts page-load AT flow. role=status is still live but
          // non-interruptive; aria-invalid on the input is the primary signal.
          <span id={resolvedErrorId} className="field-error" role="status">
            {error}
          </span>
        )}
      </div>
    </FieldContext.Provider>
  );
});

Field.displayName = 'Field';
