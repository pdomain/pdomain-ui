/**
 * ShortcutsCheatsheetBody — content-only keyboard-shortcut reference.
 *
 * Renders all bindings grouped by their `group` field (ungrouped → "General").
 * Extracted from ShortcutsCheatsheet so both the legacy Dialog and the utility
 * dock render identical content. Uses the design-system .shortcuts__* classes.
 */
import * as React from 'react';
import { KeyCap } from './KeyCap.js';
import { formatShortcut } from '../hooks/useShortcuts.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

export interface ShortcutsCheatsheetBodyProps {
  bindings: ShortcutBinding[];
}

const DEFAULT_GROUP = 'General';

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

export function ShortcutsCheatsheetBody({
  bindings,
}: ShortcutsCheatsheetBodyProps): React.ReactElement {
  const grouped = groupBindings(bindings);
  return (
    <div className="shortcuts__grid" data-testid="shortcuts-cheatsheet-body">
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
  );
}

ShortcutsCheatsheetBody.displayName = 'ShortcutsCheatsheetBody';
