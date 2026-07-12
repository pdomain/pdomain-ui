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

type WorkbenchLayoutVariant =
  'viewer-only' | 'navigation-viewer' | 'viewer-inspector' | 'navigation-viewer-inspector';

const DEFAULT_NAV_WIDTH = '16rem';
const DEFAULT_INSPECTOR_WIDTH = '22rem';

function toWorkbenchWidthValue(width: WorkbenchWidth): string {
  return typeof width === 'number' ? `${width}px` : String(width);
}

function getLayoutVariant(hasNavigation: boolean, hasInspector: boolean): WorkbenchLayoutVariant {
  if (hasNavigation && hasInspector) return 'navigation-viewer-inspector';
  if (hasNavigation) return 'navigation-viewer';
  if (hasInspector) return 'viewer-inspector';
  return 'viewer-only';
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
  const hasNavigation = navigation != null;
  const hasInspector = inspector != null;
  const layoutVariant = getLayoutVariant(hasNavigation, hasInspector);

  if (hasNavigation) {
    style['--pdui-workbench-nav-w'] = toWorkbenchWidthValue(navWidth ?? DEFAULT_NAV_WIDTH);
  }
  if (hasInspector) {
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
      {header != null ? (
        <div className="pdui-workbench-layout__header" data-grid-area="header">
          {header}
        </div>
      ) : null}
      {toolbar != null ? (
        <div className="pdui-workbench-layout__toolbar" data-grid-area="toolbar">
          {toolbar}
        </div>
      ) : null}
      <div
        className={cn(
          'pdui-workbench-layout__body',
          `pdui-workbench-layout__body--${layoutVariant}`,
        )}
        data-grid-area="body"
        data-layout={layoutVariant}
      >
        {hasNavigation ? (
          <div className="pdui-workbench-layout__navigation">{navigation}</div>
        ) : null}
        <div className="pdui-workbench-layout__viewer">{viewer}</div>
        {hasInspector ? <div className="pdui-workbench-layout__inspector">{inspector}</div> : null}
      </div>
      {footer != null ? (
        <div className="pdui-workbench-layout__footer" data-grid-area="footer">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

WorkbenchLayout.displayName = 'WorkbenchLayout';
