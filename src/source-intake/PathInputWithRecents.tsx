import * as React from 'react';
import type { ReactNode } from 'react';
import { Button } from '../primitives/Button.js';
import { Input } from '../primitives/Input.js';
import { cn } from '../primitives/cn.js';

export interface PathInputWithRecentsProps {
  value: string;
  onValueChange(this: void, value: string): void;
  recentPaths?: readonly string[];
  onRecentPathSelect?(this: void, path: string): void;
  hint?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  ariaLabel: string;
}

export function PathInputWithRecents({
  value,
  onValueChange,
  recentPaths,
  onRecentPathSelect,
  hint,
  error,
  placeholder,
  ariaLabel,
}: PathInputWithRecentsProps) {
  const hintId = React.useId();
  const errorId = React.useId();
  const describedBy =
    [hint !== undefined ? hintId : undefined, error !== undefined ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={cn('pdui-path-input-with-recents')}>
      <Input
        className="pdui-path-input-with-recents__input"
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
      {recentPaths !== undefined && recentPaths.length > 0 ? (
        <div className="pdui-path-input-with-recents__recents" aria-label="Recent paths">
          {recentPaths.map((path, index) => (
            <Button
              key={`${path}-${index}`}
              className="pdui-path-input-with-recents__recent"
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRecentPathSelect?.(path)}
            >
              {path}
            </Button>
          ))}
        </div>
      ) : null}
      {hint ? (
        <div id={hintId} className="pdui-path-input-with-recents__hint">
          {hint}
        </div>
      ) : null}
      {error ? (
        <div id={errorId} className="pdui-path-input-with-recents__error" role="status">
          {error}
        </div>
      ) : null}
    </div>
  );
}
