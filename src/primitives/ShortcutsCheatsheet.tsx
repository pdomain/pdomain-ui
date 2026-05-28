/**
 * ShortcutsCheatsheet — presentational keyboard shortcut reference dialog.
 *
 * Renders all registered ShortcutBinding objects grouped by their `group`
 * field inside the shared Dialog primitive.
 *
 * WS3: inline px literals extracted to CSS classes (.shortcuts__grid/group/title/row).
 * L-CSS provides the rules for those classes; this file only emits the names.
 */
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog.js';
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

        {/* WS3: replace inline styles with design-system class names */}
        <div className="shortcuts__grid">
          {Array.from(grouped.entries()).map(([group, items]) => (
            <section key={group} className="shortcuts__group">
              <div className="shortcuts__title">{group}</div>

              <div className="shortcuts__rows">
                {items.map((binding) => (
                  <div key={binding.keys} className="shortcuts__row">
                    <span className="shortcuts__label">{binding.label}</span>
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
