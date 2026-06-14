import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from './cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'default' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Icon node rendered before the button label.
   * Accepts any ReactNode — typically a component from `@pdomain/pdomain-ui/icons`.
   */
  icon?: React.ReactNode;
  /**
   * Icon node rendered after the button label.
   * Accepts any ReactNode — typically a component from `@pdomain/pdomain-ui/icons`.
   */
  iconRight?: React.ReactNode;
  /**
   * When true the button stretches to fill 100% of its container width.
   * Adds the CSS class "full" which sets width: 100% in primitives.css.
   */
  full?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    full,
    asChild,
    children,
    ...props
  },
  ref,
) {
  const Component = asChild === true ? Slot : 'button';
  const sizeClass = size === 'md' || size === 'default' ? undefined : size;

  return (
    <Component
      ref={ref}
      className={cn(
        'btn',
        variant,
        sizeClass,
        full === true ? 'full' : undefined,
        className,
      )}
      {...props}
    >
      {icon != null ? (
        <span className="btn-icon btn-icon--left" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {asChild === true ? <Slottable>{children}</Slottable> : children}
      {iconRight != null ? (
        <span className="btn-icon btn-icon--right" aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </Component>
  );
});

Button.displayName = 'Button';
