import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themeDir = resolve(__dirname, '../../theme');

const primitivesCss = readFileSync(resolve(themeDir, 'primitives.css'), 'utf-8');

/**
 * Extract the z-index declared in the first rule whose selector list contains
 * the given selector exactly (e.g. `.dialog` but not `.dialog-overlay`).
 */
function zIndexOf(selector: string): number {
  // Match `selector {` at rule start (allowing other selectors in the list),
  // then capture the body up to the closing brace.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rule = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`, 'm').exec(primitivesCss);
  if (rule?.[1] === undefined) throw new Error(`No rule found for selector ${selector}`);
  const z = /z-index:\s*(-?\d+)/.exec(rule[1]);
  if (z?.[1] === undefined) throw new Error(`No z-index in rule for selector ${selector}`);
  return Number(z[1]);
}

describe('dialog stacking contract', () => {
  // Belt-and-braces guard on top of the structural (content-inside-overlay)
  // contract asserted in src/primitives/Dialog.test.tsx: when consumers DO
  // load theme/primitives.css, the content z-index must stay above the
  // overlay's so sibling-composed dialogs (DialogOverlay used standalone)
  // also stack correctly.
  it('.dialog z-index is above .dialog-overlay', () => {
    expect(zIndexOf('.dialog')).toBeGreaterThan(zIndexOf('.dialog-overlay'));
  });
});
