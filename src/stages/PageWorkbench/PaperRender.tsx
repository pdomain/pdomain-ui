/**
 * PaperRender — internal image scaling layer.
 *
 * Wraps PageImageCanvas inside a "paper" aesthetic wrapper that provides
 * the white/cream background, inset border, and subtle shadow. The
 * parent ArtifactPlate provides the outer chrome; PaperRender provides
 * the inner image surface.
 *
 * Internal sub-component; not independently exported.
 */

import type { ReactNode } from 'react';

export interface PaperRenderProps {
  children: ReactNode;
}

/**
 * Image surface wrapper: white paper background, inner border, and shadow.
 * Fills its container; children (PageImageCanvas) render inside.
 */
export function PaperRender({ children }: PaperRenderProps) {
  return (
    <div
      data-testid="paper-render"
      style={{
        flex: 1,
        position: 'relative',
        padding: 'var(--space-4-5, 18px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: 'var(--bg-page, #fbf9f4)',
          border: '1px solid var(--border-2)',
          boxShadow: '0 4px 16px color-mix(in oklab, var(--ink-1) 8%, transparent)',
          borderRadius: 'var(--radius-sm, 2px)',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

PaperRender.displayName = 'PaperRender';
