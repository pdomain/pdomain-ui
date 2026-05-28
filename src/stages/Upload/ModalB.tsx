/**
 * ModalB — Upload stage compact drop-target modal (<768px breakpoint).
 *
 * Single-page compact modal with a drag-and-drop zone for uploading images.
 * Composes the existing Radix-based Dialog primitive — no new dialog dependency.
 *
 * Props:
 *   - open / onOpenChange — controlled by parent.
 *   - onFiles — invoked on file-input change OR on drop.
 *
 * a11y:
 *   - Drop zone: role="button", aria-label="Upload images", visible focus ring via tokens.
 *   - Clicking the drop zone activates the hidden file input.
 *
 * Constraints (pdomain-ui CLAUDE.md):
 *   - No CVA.
 *   - No hex literals — all colors are var(--token).
 *   - No direct lucide-react imports (use Icon dispatcher from ../../icons/Icon.js).
 *   - exactOptionalPropertyTypes — no spread of optional props without conditional.
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../primitives/Dialog.js';
import { Icon } from '../../icons/Icon.js';
import {
  UPLOAD_MODAL_B,
  UPLOAD_MODAL_B_DROP_ZONE,
  UPLOAD_MODAL_B_FILE_INPUT,
} from '../../testids/index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ModalBProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the dropped or selected files. */
  onFiles: (files: FileList | File[]) => void;
  'data-testid'?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ModalB: React.FC<ModalBProps> = ({
  open,
  onOpenChange,
  onFiles,
  'data-testid': testId = UPLOAD_MODAL_B,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const { files } = e.dataTransfer;
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles],
  );

  const handleDropZoneClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDropZoneKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files !== null && files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={testId}
        className="upload-modal-b"
        aria-describedby="upload-modal-b-desc"
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <DialogHeader>
          <DialogTitle>Upload images</DialogTitle>
          <DialogClose asChild>
            <button type="button" aria-label="Close" className="upload-modal-b__close">
              ✕
            </button>
          </DialogClose>
        </DialogHeader>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <p id="upload-modal-b-desc" className="upload-modal-b__subtitle">
          Add images to this project. Drag files or click to browse.
        </p>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          data-testid={UPLOAD_MODAL_B_DROP_ZONE}
          className={
            'upload-modal-b__drop-zone' + (dragOver ? ' upload-modal-b__drop-zone--over' : '')
          }
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleDropZoneClick}
          onKeyDown={handleDropZoneKeyDown}
        >
          <span className="upload-modal-b__drop-icon" aria-hidden="true">
            <Icon name="upload" size={32} aria-hidden={true} />
          </span>
          <span className="upload-modal-b__drop-primary">Drop images here</span>
          <span className="upload-modal-b__drop-secondary">or click to browse (PNG, JPG, JP2)</span>

          {/* Hidden file input — keyboard / click fallback.
              stopPropagation prevents the click from bubbling back up to
              the drop-zone's onClick handler and causing a double-open. */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="upload-modal-b__file-input"
            data-testid={UPLOAD_MODAL_B_FILE_INPUT}
            aria-label="Choose images to upload"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onChange={handleFileChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

ModalB.displayName = 'ModalB';
