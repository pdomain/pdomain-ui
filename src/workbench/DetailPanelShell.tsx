import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface DetailPanelShellProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function DetailPanelShell({
  title,
  description,
  meta,
  actions,
  children,
  footer,
  className,
}: DetailPanelShellProps): React.ReactElement {
  const titleId = React.useId();

  return (
    <section className={cn('pdui-detail-panel-shell', className)} aria-labelledby={titleId}>
      <header className="pdui-detail-panel-shell__header">
        <div className="pdui-detail-panel-shell__heading">
          <h2 id={titleId} className="pdui-detail-panel-shell__title">
            {title}
          </h2>
          {meta != null ? <div className="pdui-detail-panel-shell__meta">{meta}</div> : null}
          {description != null ? (
            <div className="pdui-detail-panel-shell__description">{description}</div>
          ) : null}
        </div>
        {actions != null ? <div className="pdui-detail-panel-shell__actions">{actions}</div> : null}
      </header>
      <div className="pdui-detail-panel-shell__body">{children}</div>
      {footer != null ? (
        <footer className="pdui-detail-panel-shell__footer">{footer}</footer>
      ) : null}
    </section>
  );
}

DetailPanelShell.displayName = 'DetailPanelShell';
