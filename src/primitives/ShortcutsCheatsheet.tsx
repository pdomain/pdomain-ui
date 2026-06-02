/**
 * ShortcutsCheatsheet — presentational keyboard shortcut reference dialog.
 *
 * Thin Dialog wrapper around ShortcutsCheatsheetBody (the shared content).
 * Retained for back-compat; the utility dock renders ShortcutsCheatsheetBody
 * directly.
 *
 * WS3: inline px literals extracted to CSS classes (.shortcuts__grid/group/title/row).
 * L-CSS provides the rules for those classes; this file only emits the names.
 */
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog.js';
import { ShortcutsCheatsheetBody } from './ShortcutsCheatsheetBody.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

export interface ShortcutsCheatsheetProps {
  open: boolean;
  onClose: () => void;
  bindings: ShortcutBinding[];
}

export function ShortcutsCheatsheet({
  open,
  onClose,
  bindings,
}: ShortcutsCheatsheetProps): React.ReactElement {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent data-testid="shortcuts-cheatsheet">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ShortcutsCheatsheetBody bindings={bindings} />
      </DialogContent>
    </Dialog>
  );
}
