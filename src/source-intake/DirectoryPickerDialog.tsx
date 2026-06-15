import * as React from 'react';
import { Button } from '../primitives/Button.js';
import { cn } from '../primitives/cn.js';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../primitives/Dialog.js';
import { Input } from '../primitives/Input.js';
import type { DirectoryEntry } from './types.js';

export interface DirectoryPickerDialogProps {
  open: boolean;
  onOpenChange(this: void, open: boolean): void;
  currentPath: string;
  onCurrentPathChange(this: void, path: string): void;
  inputPath: string;
  onInputPathChange(this: void, path: string): void;
  entries: readonly DirectoryEntry[];
  loading?: boolean;
  error?: React.ReactNode;
  onRefresh?(this: void): void;
  onApply(this: void, path: string): void | Promise<void>;
  onHome?(this: void): void;
  onUp?(this: void): void;
}

export function DirectoryPickerDialog({
  open,
  onOpenChange,
  currentPath,
  onCurrentPathChange,
  inputPath,
  onInputPathChange,
  entries,
  loading = false,
  error,
  onRefresh,
  onApply,
  onHome,
  onUp,
}: DirectoryPickerDialogProps) {
  const inputId = React.useId();
  const errorId = React.useId();
  const [draftPath, setDraftPath] = React.useState(inputPath);

  React.useEffect(() => {
    setDraftPath(inputPath);
  }, [inputPath]);

  const applyDraftPath = React.useCallback(() => {
    void onApply(draftPath);
  }, [draftPath, onApply]);

  const navigateToPath = React.useCallback(
    (path: string) => {
      setDraftPath(path);
      onInputPathChange(path);
      onCurrentPathChange(path);
    },
    [onCurrentPathChange, onInputPathChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="pdui-directory-picker"
        aria-describedby={error ? errorId : undefined}
      >
        <DialogHeader>
          <DialogTitle>Choose directory</DialogTitle>
        </DialogHeader>

        <div className="pdui-directory-picker__body">
          <div className="pdui-directory-picker__toolbar">
            {onHome ? (
              <Button type="button" variant="ghost" size="sm" onClick={onHome}>
                Home
              </Button>
            ) : null}
            {onUp ? (
              <Button type="button" variant="ghost" size="sm" onClick={onUp}>
                Up
              </Button>
            ) : null}
            {onRefresh ? (
              <Button type="button" variant="ghost" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            ) : null}
          </div>

          <div className="pdui-directory-picker__current">
            <span className="pdui-directory-picker__current-label">Current path</span>
            <span className="pdui-directory-picker__current-path">{currentPath}</span>
          </div>

          <div className="pdui-directory-picker__path-field">
            <label htmlFor={inputId}>Path</label>
            <Input
              id={inputId}
              type="text"
              value={draftPath}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                setDraftPath(event.currentTarget.value);
                onInputPathChange(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                if (event.metaKey || event.ctrlKey) {
                  applyDraftPath();
                  return;
                }
                navigateToPath(draftPath);
              }}
            />
          </div>

          {error ? (
            <div id={errorId} className="pdui-directory-picker__error" role="status">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="pdui-directory-picker__loading" role="status">
              Loading...
            </div>
          ) : null}

          <div className={cn('pdui-directory-picker__entries')}>
            {entries.map((entry) => {
              const disabled = entry.disabled === true || entry.kind !== 'directory';
              return (
                <Button
                  key={entry.path}
                  className="pdui-directory-picker__entry"
                  type="button"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => navigateToPath(entry.path)}
                >
                  {entry.name}
                </Button>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={applyDraftPath}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
