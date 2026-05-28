import * as React from 'react';
import { cn } from './cn.js';

export type StatusPipStatus = 'exact' | 'fuzzy' | 'mismatch' | 'ocr' | 'gt';

export interface StatusPipProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusPipStatus;
  label?: string;
}

// Map status to the CSS custom property token used for color.
// The .pip class uses `color` to drive both bg (at 10%) and border (at 33%)
// via color-mix — so a single CSS variable drives all three.
// WS4 fix: ocr → --ocr (blue, ground-truth layer), gt → --gt (ground-truth accent).
// Previously both were wrongly mapped (ocr→--fuzzy amber, gt→--accent orange).
const statusToken: Record<StatusPipStatus, string> = {
  exact: 'var(--exact)',
  fuzzy: 'var(--fuzzy)',
  mismatch: 'var(--mismatch)',
  ocr: 'var(--ocr)',
  gt: 'var(--gt)',
};

export const StatusPip = React.forwardRef<HTMLDivElement, StatusPipProps>(function StatusPip(
  { status, label, className, style, ...props },
  ref,
) {
  const token = statusToken[status];
  return (
    <div
      ref={ref}
      data-testid={`status-pip-${status}`}
      className={cn('pip', className)}
      style={{
        color: token,
        background: `color-mix(in srgb, ${token} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${token} 33%, transparent)`,
        ...style,
      }}
      {...props}
    >
      <span className="dot" style={{ background: token }} aria-hidden="true" />
      {label !== undefined && <span>{label}</span>}
    </div>
  );
});

StatusPip.displayName = 'StatusPip';
