/**
 * InsertDialog — modal for inserting a missing/blank/errata/manual synthetic
 * page into the Source stage.
 *
 * Structure: Radix Dialog (controlled via `open`/`onOpenChange` props) with:
 *   - Header "Insert page" + subtitle
 *   - Position Segmented (Before / After)
 *   - Anchor <select> populated from anchorOptions
 *   - Kind card-selector (Missing / Blank / Errata / Manual)
 *   - Note <textarea> + live "{N}/280" character counter
 *   - Replacement image dropzone (<input type="file"> + drag-target)
 *   - Footer: Cancel + Insert (disabled when no anchor chosen, or note > 280)
 *
 * CSS tokens only — no hex literals.
 * No CVA, no direct lucide-react imports.
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../../primitives/Dialog.js';
import { Segmented } from '../../primitives/Segmented.js';
import { Button } from '../../primitives/Button.js';
import {
  INSERT_DIALOG,
  INSERT_DIALOG_NOTE,
  INSERT_DIALOG_NOTE_COUNTER,
  INSERT_DIALOG_FILE,
  INSERT_DIALOG_SUBMIT,
  INSERT_DIALOG_CANCEL,
  insertDialogPositionTestId,
  insertDialogKindTestId,
} from '../../testids/index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

export type InsertPosition = 'before' | 'after';

export type InsertKind = 'missing' | 'blank' | 'errata' | 'manual';

export interface InsertAnchorOption {
  /** File id or filename — used as the <option> value. */
  value: string;
  /** Human label (e.g. "p019.png"). */
  label: string;
}

export interface InsertSubmission {
  position: InsertPosition;
  anchor: string;
  kind: InsertKind;
  note: string;
  /** Replacement image File from dropzone, if user provided one. */
  file?: File;
}

export interface InsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorOptions: ReadonlyArray<InsertAnchorOption>;
  /** Pre-select an anchor (e.g. the currently-focused page). */
  defaultAnchor?: string;
  onInsert: (submission: InsertSubmission) => void;
  'data-testid'?: string;
}

// ─── Kind card descriptors ────────────────────────────────────────────────────

interface KindDescriptor {
  id: InsertKind;
  name: string;
  desc: string;
}

const KIND_OPTIONS: ReadonlyArray<KindDescriptor> = [
  { id: 'missing', name: 'Missing', desc: 'Page absent from scan' },
  { id: 'blank', name: 'Blank', desc: 'Intentional blank' },
  { id: 'errata', name: 'Errata', desc: 'Correction sheet' },
  { id: 'manual', name: 'Manual', desc: 'Typed transcription' },
] as const;

const POSITION_OPTIONS = [
  { value: 'before' as InsertPosition, label: 'Before' },
  { value: 'after' as InsertPosition, label: 'After' },
];

const NOTE_MAX = 280;

// ─── Component ────────────────────────────────────────────────────────────────

export const InsertDialog: React.FC<InsertDialogProps> = ({
  open,
  onOpenChange,
  anchorOptions,
  defaultAnchor,
  onInsert,
  'data-testid': testId = INSERT_DIALOG,
}) => {
  // ── Controlled state ──────────────────────────────────────────────────────
  const [position, setPosition] = React.useState<InsertPosition>('before');
  const [anchor, setAnchor] = React.useState<string>(defaultAnchor ?? '');
  const [kind, setKind] = React.useState<InsertKind>('missing');
  const [note, setNote] = React.useState<string>('');
  const [file, setFile] = React.useState<File | undefined>(undefined);
  const [dragOver, setDragOver] = React.useState(false);

  // Reset state when dialog opens so re-opens start fresh unless defaultAnchor changes.
  React.useEffect(() => {
    if (open) {
      setPosition('before');
      setAnchor(defaultAnchor ?? '');
      setKind('missing');
      setNote('');
      setFile(undefined);
      setDragOver(false);
    }
  }, [open, defaultAnchor]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const noteLen = note.length;
  const noteOverLimit = noteLen > NOTE_MAX;
  const insertEnabled = anchor !== '' && !noteOverLimit;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePositionChange = React.useCallback((val: string) => {
    setPosition(val as InsertPosition);
  }, []);

  const handleAnchorChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setAnchor(e.target.value);
  }, []);

  const handleNoteChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  }, []);

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked !== undefined) setFile(picked);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped !== undefined) setFile(dropped);
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInsert = React.useCallback(() => {
    if (!insertEnabled) return;
    const submission: InsertSubmission = {
      position,
      anchor,
      kind,
      note,
      ...(file !== undefined ? { file } : {}),
    };
    onInsert(submission);
    onOpenChange(false);
  }, [insertEnabled, position, anchor, kind, note, file, onInsert, onOpenChange]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={testId}
        className="insert-dialog"
        aria-describedby="insert-dialog-desc"
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <DialogHeader>
          <div className="insert-dialog__header-inner">
            <DialogTitle>Insert page</DialogTitle>
            <p id="insert-dialog-desc" className="insert-dialog__subtitle">
              Synthetic page that participates in numbering and downstream stages.
            </p>
          </div>
          <DialogClose asChild>
            <button type="button" aria-label="Close" className="insert-dialog__close">
              ✕
            </button>
          </DialogClose>
        </DialogHeader>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="insert-dialog__body">
          {/* Position + Anchor row */}
          <div className="insert-dialog__field">
            <div className="insert-dialog__label">Position</div>
            <div className="insert-dialog__position-row">
              <div data-testid={insertDialogPositionTestId(position)}>
                <Segmented
                  options={POSITION_OPTIONS}
                  value={position}
                  onChange={handlePositionChange}
                  size="sm"
                />
              </div>
              <select
                className="insert-dialog__anchor-select"
                value={anchor}
                onChange={handleAnchorChange}
                aria-label="Anchor page"
              >
                <option value="" disabled>
                  Select anchor…
                </option>
                {anchorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kind */}
          <div className="insert-dialog__field">
            <div className="insert-dialog__label">Kind</div>
            <div className="insert-dialog__kind-grid">
              {KIND_OPTIONS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  role="radio"
                  aria-checked={kind === k.id}
                  className={
                    'insert-dialog__kind-card' +
                    (kind === k.id ? ' insert-dialog__kind-card--active' : '')
                  }
                  data-testid={insertDialogKindTestId(k.id)}
                  onClick={() => setKind(k.id)}
                >
                  <span className="insert-dialog__kind-name">{k.name}</span>
                  <span className="insert-dialog__kind-desc">{k.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="insert-dialog__field">
            <div className="insert-dialog__label-row">
              <span className="insert-dialog__label">
                Note <span className="insert-dialog__label-opt">· optional</span>
              </span>
              <span
                className={
                  'insert-dialog__counter' + (noteOverLimit ? ' insert-dialog__counter--over' : '')
                }
                data-testid={INSERT_DIALOG_NOTE_COUNTER}
                aria-live="polite"
              >
                {noteLen}/{NOTE_MAX}
              </span>
            </div>
            <textarea
              className="insert-dialog__note"
              value={note}
              onChange={handleNoteChange}
              placeholder="Optional note…"
              rows={3}
              data-testid={INSERT_DIALOG_NOTE}
              aria-label="Note"
            />
          </div>

          {/* Replacement image */}
          <div className="insert-dialog__field">
            <div className="insert-dialog__label">
              Replacement image <span className="insert-dialog__label-opt">· optional</span>
            </div>
            <div
              className={
                'insert-dialog__dropzone' + (dragOver ? ' insert-dialog__dropzone--over' : '')
              }
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              aria-label="Replacement image dropzone"
            >
              {file !== undefined ? (
                <div className="insert-dialog__file-info">
                  <span className="insert-dialog__file-name">{file.name}</span>
                  <span className="insert-dialog__file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ) : (
                <div className="insert-dialog__dropzone-hint">
                  <span>Drop a JP2 / PNG / JPG here, or </span>
                  <label className="insert-dialog__browse-label">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      className="insert-dialog__file-input"
                      onChange={handleFileChange}
                      data-testid={INSERT_DIALOG_FILE}
                      aria-label="Choose replacement image"
                    />
                  </label>
                  <span>.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="md" data-testid={INSERT_DIALOG_CANCEL}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            size="md"
            disabled={!insertEnabled}
            onClick={handleInsert}
            data-testid={INSERT_DIALOG_SUBMIT}
          >
            Insert page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

InsertDialog.displayName = 'InsertDialog';
