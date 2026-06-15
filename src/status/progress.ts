import * as React from 'react';

export function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, progress));
}

export interface OperationProgressProps {
  baseClassName: string;
  value: number;
  ariaLabel?: string;
}

export function OperationProgress({
  baseClassName,
  value,
  ariaLabel = 'Operation progress',
}: OperationProgressProps): React.ReactElement {
  const clampedValue = clampProgress(value);

  return React.createElement(
    'div',
    {
      className: `${baseClassName}__progress`,
      role: 'progressbar',
      'aria-valuenow': clampedValue,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-label': ariaLabel,
    },
    React.createElement(
      'div',
      { className: `${baseClassName}__progress-track` },
      React.createElement('div', {
        className: `${baseClassName}__progress-fill`,
        style: { width: `${clampedValue.toString()}%` },
      }),
    ),
  );
}
