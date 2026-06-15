import * as React from 'react';
import { cn } from '../primitives/cn.js';

export type GuidancePanelTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface GuidancePanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  tone?: GuidancePanelTone;
  actions?: React.ReactNode;
}

export const GuidancePanel = React.forwardRef<HTMLElement, GuidancePanelProps>(
  function GuidancePanel({ className, title, tone = 'neutral', actions, children, ...props }, ref) {
    return (
      <aside ref={ref} className={cn('pdui-guidance-panel', className)} data-tone={tone} {...props}>
        <div className="pdui-guidance-panel__header">
          <h3 className="pdui-guidance-panel__title">{title}</h3>
          {actions != null ? <div className="pdui-guidance-panel__actions">{actions}</div> : null}
        </div>
        {children != null ? <div className="pdui-guidance-panel__body">{children}</div> : null}
      </aside>
    );
  },
);

GuidancePanel.displayName = 'GuidancePanel';
