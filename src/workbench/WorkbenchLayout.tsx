import * as React from 'react';
import { cn } from '../primitives/cn.js';

type WorkbenchWidth = React.CSSProperties['width'];

type WorkbenchLayoutStyle = React.CSSProperties & {
  '--pdui-workbench-nav-w'?: string;
  '--pdui-workbench-inspector-w'?: string;
};

export interface WorkbenchLayoutProps {
  header?: React.ReactNode;
  toolbar?: React.ReactNode;
  navigation?: React.ReactNode;
  viewer: React.ReactNode;
  inspector?: React.ReactNode;
  footer?: React.ReactNode;
  navWidth?: WorkbenchWidth;
  inspectorWidth?: WorkbenchWidth;
  ariaLabel?: string;
  className?: string;
}

const DEFAULT_NAV_WIDTH = '16rem';
const DEFAULT_INSPECTOR_WIDTH = '22rem';

function toWorkbenchWidthValue(width: WorkbenchWidth): string {
  return typeof width === 'number' ? `${width}px` : String(width);
}

export function WorkbenchLayout({
  header,
  toolbar,
  navigation,
  viewer,
  inspector,
  footer,
  navWidth,
  inspectorWidth,
  ariaLabel = 'Workbench layout',
  className,
}: WorkbenchLayoutProps): React.ReactElement {
  const style: WorkbenchLayoutStyle = {};

  if (navigation != null || navWidth !== undefined) {
    style['--pdui-workbench-nav-w'] = toWorkbenchWidthValue(navWidth ?? DEFAULT_NAV_WIDTH);
  }
  if (inspector != null || inspectorWidth !== undefined) {
    style['--pdui-workbench-inspector-w'] = toWorkbenchWidthValue(
      inspectorWidth ?? DEFAULT_INSPECTOR_WIDTH,
    );
  }

  const hasStyle = Object.keys(style).length > 0;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn('pdui-workbench-layout', className)}
      {...(hasStyle ? { style } : {})}
    >
      {header != null ? <div className="pdui-workbench-layout__header">{header}</div> : null}
      {toolbar != null ? <div className="pdui-workbench-layout__toolbar">{toolbar}</div> : null}
      <div className="pdui-workbench-layout__body">
        {navigation != null ? (
          <div className="pdui-workbench-layout__navigation">{navigation}</div>
        ) : null}
        <div className="pdui-workbench-layout__viewer">{viewer}</div>
        {inspector != null ? (
          <div className="pdui-workbench-layout__inspector">{inspector}</div>
        ) : null}
      </div>
      {footer != null ? <div className="pdui-workbench-layout__footer">{footer}</div> : null}
    </div>
  );
}

WorkbenchLayout.displayName = 'WorkbenchLayout';
