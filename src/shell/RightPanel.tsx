/**
 * RightPanel — right-side panel sub-shell (word-view, inspector, etc.).
 *
 * Thin layout primitive. Children supply the panel content.
 */
import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface RightPanelProps {
  children?: React.ReactNode;
  className?: string;
  /** Width override. Defaults to '520px'. */
  width?: string;
}

export function RightPanel({ children, className, width = '520px' }: RightPanelProps) {
  return (
    <div
      data-testid="right-panel"
      className={cn('right-panel', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width,
        minWidth: 0,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

RightPanel.displayName = 'RightPanel';
