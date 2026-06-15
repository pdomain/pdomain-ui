import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface FileDropzoneProps {
  onFilesAccepted(this: void, files: File[]): void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  error?: React.ReactNode;
}

export function FileDropzone({
  onFilesAccepted,
  accept,
  multiple,
  disabled = false,
  label = 'Drop files',
  description,
  actions,
  error,
}: FileDropzoneProps) {
  const inputId = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();
  const [isDragging, setIsDragging] = React.useState(false);
  const describedBy =
    [
      description !== undefined ? descriptionId : undefined,
      error !== undefined ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const acceptFiles = React.useCallback(
    (files: FileList | null) => {
      if (disabled || files === null || files.length === 0) return;
      onFilesAccepted(Array.from(files));
    },
    [disabled, onFilesAccepted],
  );

  return (
    <div
      className={cn('pdui-file-dropzone')}
      data-dragging={isDragging}
      data-disabled={disabled ? 'true' : undefined}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        acceptFiles(event.dataTransfer.files);
      }}
    >
      <label className="pdui-file-dropzone__label" htmlFor={inputId}>
        {label}
      </label>
      {description ? (
        <span id={descriptionId} className="pdui-file-dropzone__description">
          {description}
        </span>
      ) : null}
      <input
        id={inputId}
        className="pdui-file-dropzone__input"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          acceptFiles(event.currentTarget.files);
          event.currentTarget.value = '';
        }}
      />
      {actions ? <span className="pdui-file-dropzone__actions">{actions}</span> : null}
      {error ? (
        <span id={errorId} className="pdui-file-dropzone__error" role="status">
          {error}
        </span>
      ) : null}
    </div>
  );
}
