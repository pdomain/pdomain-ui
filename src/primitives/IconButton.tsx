import * as React from 'react';
import { cn } from './cn.js';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icon node rendered inside an aria-hidden wrapper.
   * Accepts any ReactNode — typically a component from `@pdomain/pdomain-ui/icons`.
   * The icon wrapper carries `aria-hidden="true"` so only `aria-label` is
   * exposed to assistive technologies.
   */
  icon: React.ReactNode;
  /**
   * Accessible label — required. This is the sole accessible name because
   * the icon itself is hidden from the a11y tree.
   */
  'aria-label': string;
  /**
   * Visual size of the button. Defaults to "md" (no extra class applied).
   * "sm" adds class "sm"; "lg" adds class "lg".
   */
  size?: IconButtonSize;
}

/**
 * IconButton — a square icon-only button with a required `aria-label`.
 *
 * Renders a `<button type="button">` with `.icon-btn`. The icon is wrapped
 * in a `.icon-btn__icon` span that is `aria-hidden="true"` so only the
 * `aria-label` is announced by screen readers.
 *
 * Size follows the same class convention as Button: "sm" → `.sm`, "lg" → `.lg`,
 * "md" (default) → no modifier class.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, icon, size, type = 'button', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn('icon-btn', size !== undefined && size !== 'md' ? size : undefined, className)}
      {...props}
    >
      <span className="icon-btn__icon" aria-hidden="true">
        {icon}
      </span>
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';
