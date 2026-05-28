/**
 * ShortcutsCheatsheet — presentational keyboard shortcut reference dialog.
 *
 * Renders all registered ShortcutBinding objects grouped by their `group`
 * field inside the shared Dialog primitive.
 */
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './Dialog.js';
import { KeyCap } from './KeyCap.js';
import { formatShortcut } from '../hooks/useShortcuts.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

export interface ShortcutsCheatsheetProps {
  open: boolean;
  onClose: () => void;
  bindings: ShortcutBinding[];
}

const DEFAULT_GROUP = 'General';

/**
 * Group bindings by their `group` field. Ungrouped bindings go under
 * DEFAULT_GROUP ("General"). Preserves insertion order of group first-seen.
 */
function groupBindings(bindings: ShortcutBinding[]): Map<string, ShortcutBinding[]> {
  const map = new Map<string, ShortcutBinding[]>();
  for (const binding of bindings) {
    const g = binding.group ?? DEFAULT_GROUP;
    let arr = map.get(g);
    if (arr === undefined) {
      arr = [];
      map.set(g, arr);
    }
    arr.push(binding);
  }
  return map;
}

export function ShortcutsCheatsheet({
  open,
  onClose,
  bindings,
}: ShortcutsCheatsheetProps): React.ReactElement {
  const grouped = groupBindings(bindings);

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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {Array.from(grouped.entries()).map(([group, items]) => (
            <section key={group}>
              <div
                style={{
                  marginBottom: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                }}
              >
                {group}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {items.map((binding) => (
                  <div
                    key={binding.keys}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid var(--border-1)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink-1)',
                      }}
                    >
                      {binding.label}
                    </span>
                    <KeyCap keys={formatShortcut(binding.keys)} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
