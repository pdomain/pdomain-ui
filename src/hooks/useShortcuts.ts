/**
 * useShortcuts — keyboard shortcut registration hook.
 *
 * Attach a keydown listener on window for a list of ShortcutBinding objects.
 * Handles modifier normalization, editable-target guarding, and cleanup.
 */

import { useEffect, useRef } from 'react';

export interface ShortcutBinding {
  /**
   * Combo string, e.g. "mod+s", "?", "arrowright", "j".
   * `mod` resolves to ⌘ on Mac and Ctrl elsewhere.
   */
  keys: string;
  /** Human label for the cheatsheet, e.g. "Save edits". */
  label: string;
  /** Optional grouping for the cheatsheet, e.g. "Navigation". */
  group?: string | undefined;
  /** Action to run. */
  handler: () => void;
  /** Guard — binding is inert when this returns false. */
  when?: (() => boolean) | undefined;
  /**
   * When true, this binding fires even while focus is in an
   * input/textarea/contenteditable. Defaults to true for combos that include
   * a non-shift modifier; false for plain-key bindings.
   */
  allowInEditable?: boolean | undefined;
}

export interface UseShortcutsOptions {
  enabled?: boolean | undefined;
  /**
   * When false, this hook's bindings are NOT registered into a mounted
   * `ShortcutsProvider` for display in the cheatsheet. They still fire
   * normally via the window keydown listener.
   *
   * Default: true (register when a provider is present).
   */
  register?: boolean | undefined;
}

// ─── Modifier detection ──────────────────────────────────────────────────────

/** True when running on macOS. Evaluated once at module load. */
const IS_MAC =
  typeof navigator !== 'undefined' &&
  (/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent));

// ─── Combo parser ────────────────────────────────────────────────────────────

interface ParsedCombo {
  key: string; // e.g. "s", "arrowright", "?"
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  /** True if any non-shift modifier is required. */
  hasNonShiftMod: boolean;
}

function parseCombo(keys: string): ParsedCombo {
  const parts = keys
    .toLowerCase()
    .split('+')
    .map((p) => p.trim());

  let meta = false;
  let ctrl = false;
  let alt = false;
  let shift = false;
  let key = '';

  for (const part of parts) {
    if (part === 'mod') {
      if (IS_MAC) {
        meta = true;
      } else {
        ctrl = true;
      }
    } else if (part === 'meta' || part === 'cmd') {
      meta = true;
    } else if (part === 'ctrl' || part === 'control') {
      ctrl = true;
    } else if (part === 'alt' || part === 'option') {
      alt = true;
    } else if (part === 'shift') {
      shift = true;
    } else {
      // Last non-modifier token is the key.
      key = part;
    }
  }

  return {
    key,
    meta,
    ctrl,
    alt,
    shift,
    hasNonShiftMod: meta || ctrl || alt,
  };
}

// ─── Editable-target guard ───────────────────────────────────────────────────

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    target.isContentEditable
  );
}

// ─── Event matching ──────────────────────────────────────────────────────────

function matchesEvent(parsed: ParsedCombo, e: KeyboardEvent): boolean {
  if (e.metaKey !== parsed.meta) return false;
  if (e.ctrlKey !== parsed.ctrl) return false;
  if (e.altKey !== parsed.alt) return false;
  if (e.shiftKey !== parsed.shift) return false;
  // Normalize e.key to lowercase for comparison.
  return e.key.toLowerCase() === parsed.key;
}

// ─── formatShortcut helper ───────────────────────────────────────────────────

/**
 * Turn a combo string into display tokens suitable for KeyCap.
 *
 * Examples (Mac):   "mod+s" → ["⌘", "S"]
 * Examples (Win):   "mod+s" → ["Ctrl", "S"]
 *                   "shift+?" → ["Shift", "?"]
 *                   "arrowright" → ["→"]
 */
export function formatShortcut(keys: string): string[] {
  const parts = keys
    .toLowerCase()
    .split('+')
    .map((p) => p.trim());

  const tokens: string[] = [];

  const ARROW_MAP: Record<string, string> = {
    arrowleft: '←',
    arrowright: '→',
    arrowup: '↑',
    arrowdown: '↓',
  };

  const KEY_LABELS: Record<string, string> = {
    escape: 'Esc',
    enter: '↵',
    backspace: '⌫',
    delete: 'Del',
    tab: 'Tab',
    space: 'Space',
    ' ': 'Space',
  };

  for (const part of parts) {
    if (part === 'mod') {
      tokens.push(IS_MAC ? '⌘' : 'Ctrl');
    } else if (part === 'meta' || part === 'cmd') {
      tokens.push(IS_MAC ? '⌘' : 'Meta');
    } else if (part === 'ctrl' || part === 'control') {
      tokens.push('Ctrl');
    } else if (part === 'alt' || part === 'option') {
      tokens.push(IS_MAC ? '⌥' : 'Alt');
    } else if (part === 'shift') {
      tokens.push('Shift');
    } else if (Object.prototype.hasOwnProperty.call(ARROW_MAP, part)) {
      tokens.push(ARROW_MAP[part] ?? part.toUpperCase());
    } else if (Object.prototype.hasOwnProperty.call(KEY_LABELS, part)) {
      tokens.push(KEY_LABELS[part] ?? part.toUpperCase());
    } else {
      // Single letter or symbol — uppercase display.
      tokens.push(part.toUpperCase());
    }
  }

  return tokens;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Register keyboard shortcut bindings on `window`.
 *
 * - Attaches a single keydown listener; cleaned up on unmount / deps change.
 * - Plain-key bindings are skipped when focus is in an editable element.
 * - Combos with non-shift modifiers (Ctrl/⌘/Alt) still fire in editables
 *   unless `allowInEditable: false` is set explicitly.
 */
export function useShortcuts(
  bindings: ShortcutBinding[],
  opts?: UseShortcutsOptions,
): void {
  // Keep a stable ref so the effect doesn't re-run when bindings change identity.
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  const enabledRef = useRef(opts?.enabled);
  enabledRef.current = opts?.enabled;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (enabledRef.current === false) return;

      const editable = isEditableTarget(e.target);

      for (const binding of bindingsRef.current) {
        if (binding.when !== undefined && !binding.when()) continue;

        const parsed = parseCombo(binding.keys);

        // Determine whether this binding should fire in editable targets.
        let allowInEditable: boolean;
        if (binding.allowInEditable !== undefined) {
          allowInEditable = binding.allowInEditable;
        } else {
          // Default: allow in editable only if a non-shift modifier is present.
          allowInEditable = parsed.hasNonShiftMod;
        }

        if (editable && !allowInEditable) continue;

        if (matchesEvent(parsed, e)) {
          e.preventDefault();
          binding.handler();
          // Stop after first match.
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty deps — bindings and enabled are accessed via refs.
}
