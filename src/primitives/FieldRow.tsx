import * as React from 'react';
import { cn } from './cn.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- named props interface gives consumers a stable type to extend
export interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FieldRow = React.forwardRef<HTMLDivElement, FieldRowProps>(function FieldRow(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('field-row', className)} {...props} />;
});

FieldRow.displayName = 'FieldRow';
