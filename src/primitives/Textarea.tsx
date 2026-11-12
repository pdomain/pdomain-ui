import * as React from 'react';
import { cn } from './cn.js';
import { useFieldContext } from './FieldContext.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- named props interface gives consumers a stable type to extend
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  const { errorId, hasError } = useFieldContext();

  // Merge field-level a11y attributes — caller-supplied props take precedence.
  const fieldA11y: React.TextareaHTMLAttributes<HTMLTextAreaElement> = {};
  if (errorId !== undefined && !('aria-describedby' in props)) {
    fieldA11y['aria-describedby'] = errorId;
  }
  if (hasError && !('aria-invalid' in props)) {
    fieldA11y['aria-invalid'] = true;
  }

  return <textarea ref={ref} className={cn('textarea', className)} {...fieldA11y} {...props} />;
});

Textarea.displayName = 'Textarea';
