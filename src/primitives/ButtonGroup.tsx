import * as React from 'react';
import { cn } from './cn.js';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Accessible label for the group — required for ARIA role="group".
   */
  'aria-label': string;
  /**
   * When true, renders visual separators between children via the
   * `btn-group--separator` CSS modifier class.
   */
  separator?: boolean;
}

/**
 * ButtonGroup — a flex row that groups related buttons under a single
 * accessible label.
 *
 * Renders a `<div role="group">` with `.btn-group`. The `aria-label` prop
 * is required so assistive technologies can identify the group's purpose.
 *
 * Use `separator` to add visual dividers between children (e.g. toolbar
 * button clusters where the grouping boundary should be visible).
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { className, separator, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      className={cn(
        'btn-group',
        separator === true ? 'btn-group--separator' : undefined,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';
