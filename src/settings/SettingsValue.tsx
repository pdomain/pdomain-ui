import * as React from 'react';
import { cn } from '../primitives/cn.js';

export type SettingsValueTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'error';

export interface SettingsValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: SettingsValueTone;
  mono?: boolean | undefined;
}

export const SettingsValue = React.forwardRef<HTMLSpanElement, SettingsValueProps>(
  function SettingsValue({ className, tone = 'neutral', mono, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn('pdui-settings-value', className)}
        data-tone={tone}
        data-mono={mono === true ? 'true' : undefined}
        {...props}
      />
    );
  },
);

SettingsValue.displayName = 'SettingsValue';
