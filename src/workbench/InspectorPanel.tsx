import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface InspectorPanelProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function InspectorPanel({
  title,
  description,
  meta,
  actions,
  children,
  footer,
  className,
}: InspectorPanelProps): React.ReactElement {
  const titleId = React.useId();

  return (
    <aside className={cn('pdui-inspector-panel', className)} aria-labelledby={titleId}>
      <header className="pdui-inspector-panel__header">
        <div className="pdui-inspector-panel__heading">
          <h2 id={titleId} className="pdui-inspector-panel__title">
            {title}
          </h2>
          {meta != null ? <div className="pdui-inspector-panel__meta">{meta}</div> : null}
          {description != null ? (
            <div className="pdui-inspector-panel__description">{description}</div>
          ) : null}
        </div>
        {actions != null ? (
          <div
            className="pdui-inspector-panel__actions"
            role="group"
            aria-label="Inspector actions"
          >
            {actions}
          </div>
        ) : null}
      </header>
      <div className="pdui-inspector-panel__body">{children}</div>
      {footer != null ? <footer className="pdui-inspector-panel__footer">{footer}</footer> : null}
    </aside>
  );
}

InspectorPanel.displayName = 'InspectorPanel';
