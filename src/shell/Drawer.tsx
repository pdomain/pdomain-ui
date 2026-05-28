/**
 * Drawer — collapsible side panel sub-shell.
 *
 * When `open` is true, renders children and shows the panel.
 * When `open` is false, renders nothing inside but keeps the element for
 * data-open attribute tracking (smooth CSS transitions).
 *
 * This is a layout-only primitive — tab management and collapse buttons
 * are the responsibility of the consuming app.
 */
import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface DrawerProps {
  /** Whether the drawer is expanded. */
  open: boolean;
  children?: React.ReactNode;
  className?: string;
  /** Width when open. Defaults to '320px'. */
  width?: string;
}

export function Drawer({ open, children, className, width = '320px' }: DrawerProps) {
  return (
    <div
      data-testid="drawer"
      data-open={open ? 'true' : 'false'}
      className={cn('drawer', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: open ? width : '0px',
        minWidth: 0,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-1)',
        transition: 'width 150ms ease',
      }}
    >
      {open ? children : null}
    </div>
  );
}

Drawer.displayName = 'Drawer';
