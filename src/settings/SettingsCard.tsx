import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface SettingsCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const SettingsCard = React.forwardRef<HTMLDivElement, SettingsCardProps>(
  function SettingsCard(
    { className, title, description, badge, actions, children, ...props },
    ref,
  ) {
    return (
      <div ref={ref} className={cn('pdui-settings-card', className)} {...props}>
        <div className="pdui-settings-card__header">
          <div className="pdui-settings-card__heading">
            <div className="pdui-settings-card__title-row">
              <h2 className="pdui-settings-card__title">{title}</h2>
              {badge != null ? <div className="pdui-settings-card__badge">{badge}</div> : null}
            </div>
            {description != null ? (
              <p className="pdui-settings-card__description">{description}</p>
            ) : null}
          </div>
          {actions != null ? <div className="pdui-settings-card__actions">{actions}</div> : null}
        </div>
        {children != null ? <div className="pdui-settings-card__body">{children}</div> : null}
      </div>
    );
  },
);

SettingsCard.displayName = 'SettingsCard';
