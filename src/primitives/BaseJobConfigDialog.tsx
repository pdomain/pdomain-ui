import * as React from 'react';
import { useState, useEffect, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog.js';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Field } from './Field.js';

/** Returns the last path segment — the filename without extension is used as
 * the default project name. Works for both POSIX and Windows-style paths. */
function basename(p: string): string {
  const sep = p.includes('/') ? '/' : '\\';
  const last = p.split(sep).filter(Boolean).at(-1) ?? p;
  // Strip extension from the last segment
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(0, dot) : last;
}

export interface BaseJobConfig {
  projectName: string;
  outputDir: string;
}

export interface BaseJobConfigDialogProps {
  open: boolean;
  title: string;
  description?: string;
  sourcePath: string;
  onClose: () => void;
  /** Called with the base config on submit. Promise rejection shows as error. */
  onSubmit: (base: BaseJobConfig) => Promise<void>;
  /** Default "Run →" */
  submitLabel?: string;
  /** App-specific extra fields rendered inside the form */
  children?: React.ReactNode;
}

export function BaseJobConfigDialog({
  open,
  title,
  description,
  sourcePath,
  onClose,
  onSubmit,
  submitLabel,
  children,
}: BaseJobConfigDialogProps) {
  const [projectName, setProjectName] = useState(() => basename(sourcePath));
  const [outputDir, setOutputDir] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset projectName when sourcePath changes
  useEffect(() => {
    setProjectName(basename(sourcePath));
  }, [sourcePath]);

  // WS5 fix: reset outputDir (and error) when the dialog opens/reopens.
  // Previously outputDir was never reset so stale values from prior sessions persisted.
  useEffect(() => {
    if (open) {
      setOutputDir('');
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!projectName.trim() || !outputDir.trim()) {
      setError('Project name and output directory are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ projectName, outputDir });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  const label = submitLabel ?? 'Run →';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description !== undefined && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          noValidate
          data-testid="job-config-dialog-form"
        >
          {error !== null && (
            <p role="alert" className="job-config-dialog__error">
              {error}
            </p>
          )}
          <Field htmlFor="bjcd-name" label="Project name">
            <Input
              id="bjcd-name"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
              placeholder="my-project"
            />
          </Field>
          <Field htmlFor="bjcd-output" label="Output directory">
            <Input
              id="bjcd-output"
              value={outputDir}
              onChange={(e) => {
                setOutputDir(e.target.value);
              }}
              placeholder="/home/user/output"
            />
          </Field>
          {children}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !projectName.trim() || !outputDir.trim()}
            >
              {submitting ? `${label}…` : label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

BaseJobConfigDialog.displayName = 'BaseJobConfigDialog';
