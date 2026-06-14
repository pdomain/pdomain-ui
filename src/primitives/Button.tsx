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

type SlottedChildProps = {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean | undefined;
  'aria-disabled'?: React.AriaAttributes['aria-disabled'];
  tabIndex?: number;
  ref?: React.Ref<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onClickCapture?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onKeyDownCapture?: React.KeyboardEventHandler<HTMLElement>;
};

const suppressDisabledEvent = (event: React.SyntheticEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    full,
    asChild,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const Component = asChild === true ? Slot : 'button';
  const sizeClass = size === 'md' || size === 'default' ? undefined : size;
  const isDisabledAsChild = asChild === true && disabled === true;
  const buttonClassName = cn(
    'btn',
    variant,
    sizeClass,
    full === true ? 'full' : undefined,
    isDisabledAsChild ? 'disabled' : undefined,
    className,
  );

  if (isDisabledAsChild) {
    const child = React.Children.only(children);

    if (!React.isValidElement<SlottedChildProps>(child)) {
      return null;
    }

    return React.cloneElement(child, {
      ...props,
      ref,
      'aria-disabled': true,
      tabIndex: -1,
      disabled: undefined,
      onClick: suppressDisabledEvent,
      onClickCapture: suppressDisabledEvent,
      onKeyDown: suppressDisabledEvent,
      onKeyDownCapture: suppressDisabledEvent,
      className: cn(buttonClassName, child.props.className),
      children: (
        <>
          {icon != null ? (
            <span className="btn-icon btn-icon--left" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {child.props.children}
          {iconRight != null ? (
            <span className="btn-icon btn-icon--right" aria-hidden="true">
              {iconRight}
            </span>
          ) : null}
        </>
      ),
    });
  }

  return (
    <Component
      ref={ref}
      {...props}
      {...(asChild === true ? undefined : { disabled })}
      className={buttonClassName}
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
