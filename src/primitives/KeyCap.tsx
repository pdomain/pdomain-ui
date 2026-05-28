import * as React from 'react';
import { cn } from './cn.js';

export interface KeyCapProps extends React.HTMLAttributes<HTMLDivElement> {
  keys: string | string[];
}

export const KeyCap = React.forwardRef<HTMLDivElement, KeyCapProps>(function KeyCap(
  { keys, className, ...props },
  ref,
) {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  // WS3: replace Tailwind utility classes + inline separator style with
  // design-system class names. L-CSS provides rules for .key-cap-wrapper and .key__sep.
  return (
    <div ref={ref} className={cn('key-cap-wrapper', className)} {...props}>
      {keyArray.map((key, index) => (
        <React.Fragment key={`${key}-${index}`}>
          <span className="key">{key}</span>
          {index < keyArray.length - 1 && (
            <span aria-hidden="true" className="key__sep">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

KeyCap.displayName = 'KeyCap';
