import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface SettingsRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'label'> {
  label: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  control?: React.ReactNode;
  actions?: React.ReactNode;
  disabled?: boolean | undefined;
  error?: React.ReactNode;
}

export const SettingsRow = React.forwardRef<HTMLDivElement, SettingsRowProps>(function SettingsRow(
  { className, label, description, value, control, actions, disabled, error, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('pdui-settings-row', className)}
      aria-disabled={disabled === true ? true : undefined}
      data-disabled={disabled === true ? 'true' : undefined}
      {...props}
    >
      <div className="pdui-settings-row__content">
        <div className="pdui-settings-row__label">{label}</div>
        {description != null ? (
          <div className="pdui-settings-row__description">{description}</div>
        ) : null}
        {error != null ? (
          <div className="pdui-settings-row__error" role="status">
            {error}
          </div>
        ) : null}
      </div>
      {value != null ? <div className="pdui-settings-row__value">{value}</div> : null}
      {control != null ? <div className="pdui-settings-row__control">{control}</div> : null}
      {actions != null ? <div className="pdui-settings-row__actions">{actions}</div> : null}
    </div>
  );
});

SettingsRow.displayName = 'SettingsRow';
