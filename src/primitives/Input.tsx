import * as React from 'react';
import { cn } from './cn.js';
import { useFieldContext } from './FieldContext.js';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  /**
   * Optional suffix rendered to the right of the input inside a flex wrapper.
   * When provided, the component renders a composite div+input+span structure
   * instead of a bare <input>. Existing callers that omit `suffix` are unaffected.
   *
   * Design reference:
   *   docs/templates/design_handoff_pdomain_ui/design-system/ui-base.jsx → Input
   */
  suffix?: React.ReactNode;
  /**
   * When true, applies the focus-ring styling (blue border + box-shadow) to the
   * wrapper (or bare input if no suffix) unconditionally — useful for programmatic
   * focus-highlight without relying on the CSS :focus pseudo-class alone.
   *
   * Implemented as the CSS class `.input-focus-ring` in theme/primitives.css so
   * the rule stays token-only (var(--accent)) and no inline styles are needed.
   */
  autoFocusRing?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, suffix, autoFocusRing, ...props },
  ref,
) {
  const { errorId, hasError } = useFieldContext();
  const sizeClass = size === 'md' ? undefined : size;
  const focusRingClass = autoFocusRing ? 'input-focus-ring' : undefined;

  // Merge field-level a11y attributes — caller-supplied props take precedence.
  const fieldA11y: React.InputHTMLAttributes<HTMLInputElement> = {};
  if (errorId !== undefined && !('aria-describedby' in props)) {
    fieldA11y['aria-describedby'] = errorId;
  }
  if (hasError && !('aria-invalid' in props)) {
    fieldA11y['aria-invalid'] = true;
  }

  if (suffix !== undefined) {
    // Composite mode: wrapper div + input + suffix span.
    // The wrapper carries the visual border/background so it looks like one
    // unified input field; the inner <input> has no border of its own.
    // WS7: className is applied to the outer wrapper (not the inner input)
    // so consumers can style the visual boundary, not a hidden inner element.
    return (
      <div className={cn('input-wrapper', focusRingClass, className)}>
        <input ref={ref} className={cn('input input-inner', sizeClass)} {...fieldA11y} {...props} />
        <span className="input-suffix">{suffix}</span>
      </div>
    );
  }

  // Bare-input mode (back-compat — identical to pre-extension behavior)
  return (
    <input
      ref={ref}
      className={cn('input', sizeClass, focusRingClass, className)}
      {...fieldA11y}
      {...props}
    />
  );
});

Input.displayName = 'Input';
