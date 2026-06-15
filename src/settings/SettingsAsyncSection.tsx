import * as React from 'react';
import { cn } from '../primitives/cn.js';

export type SettingsAsyncSectionState = 'idle' | 'ready' | 'loading' | 'saving' | 'error';

export interface SettingsAsyncSectionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'title'
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  state?: SettingsAsyncSectionState;
  error?: React.ReactNode;
  actions?: React.ReactNode;
}

export const SettingsAsyncSection = React.forwardRef<HTMLElement, SettingsAsyncSectionProps>(
  function SettingsAsyncSection(
    { className, title, description, state = 'ready', error, actions, children, ...props },
    ref,
  ) {
    const isBusy = state === 'loading' || state === 'saving';

    return (
      <section
        ref={ref}
        className={cn('pdui-settings-async-section', className)}
        aria-busy={isBusy ? true : undefined}
        {...props}
      >
        <div className="pdui-settings-async-section__header">
          <div className="pdui-settings-async-section__heading">
            <h2 className="pdui-settings-async-section__title">{title}</h2>
            {description != null ? (
              <p className="pdui-settings-async-section__description">{description}</p>
            ) : null}
          </div>
          {actions != null ? (
            <div className="pdui-settings-async-section__actions">{actions}</div>
          ) : null}
        </div>
        {state === 'loading' ? (
          <div className="pdui-settings-async-section__status" role="status">
            Loading
          </div>
        ) : null}
        {state === 'saving' ? (
          <div className="pdui-settings-async-section__status" role="status">
            Saving
          </div>
        ) : null}
        {state === 'error' ? (
          <div className="pdui-settings-async-section__error" role="alert">
            {error ?? 'Error'}
          </div>
        ) : null}
        {children != null ? (
          <div className="pdui-settings-async-section__body">{children}</div>
        ) : null}
      </section>
    );
  },
);

SettingsAsyncSection.displayName = 'SettingsAsyncSection';
