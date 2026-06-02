/**
 * Utility dock public-export surface test.
 *
 * Verifies that the new dock API is reachable from the shell barrel,
 * primitives barrel, and root barrel. The root barrel imports react-konva
 * (via the canvas sub-barrel) which requires the native `canvas` module not
 * available in jsdom — stub it so the test stays pure-Node.
 */
import { vi, describe, it, expect } from 'vitest';

// Must be hoisted above the static imports to intercept Konva's native canvas requirement.
vi.mock('react-konva', () => ({}));
vi.mock('konva', () => ({ default: {} }));

import * as shell from './index.js';
import * as root from '../index.js';
import * as primitives from '../primitives/index.js';

describe('utility dock public exports', () => {
  it('shell barrel exports the dock API', () => {
    expect(typeof shell.useUtilityDock).toBe('function');
    expect(typeof shell.UtilityDock).toBe('function');
    expect(typeof shell.SettingsPanel).toBe('function');
    expect(typeof shell.JobsPanelBody).toBe('function');
    expect(shell.UtilityDockContext).toBeDefined();
  });
  it('primitives barrel exports SlideOverPanel + ShortcutsCheatsheetBody', () => {
    expect(typeof primitives.SlideOverPanel).toBe('function');
    expect(typeof primitives.ShortcutsCheatsheetBody).toBe('function');
  });
  it('root barrel re-exports the dock API', () => {
    expect(typeof root.useUtilityDock).toBe('function');
    expect(typeof root.SlideOverPanel).toBe('function');
    expect(root.UtilityDockContext).toBeDefined();
  });
});
