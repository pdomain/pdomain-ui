/**
 * Built-artifact contract for the ./testids subpath export.
 *
 * Issue: pdomain/pdomain-ui#28 — Published /testids subpath was an empty
 * public contract (src/testids/index.ts contained only `export {}`).
 *
 * This test reads dist/testids.js and dist/testids.d.ts AFTER a build and
 * asserts that:
 *   1. The JS bundle is non-trivially non-empty (more than a blank re-export).
 *   2. A representative set of testid constants from every component category
 *      appear as named exports in the .d.ts declaration file.
 *   3. The bundle value for a spot-checked constant matches the expected string
 *      (guards against tree-shaking stripping all assignments).
 *
 * Run sequence: `pnpm build && pnpm test tests/pack/testids.contract.test.ts`
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../../dist');
const JS_PATH = resolve(DIST, 'testids.js');
const DTS_PATH = resolve(DIST, 'testids.d.ts');

// ---------------------------------------------------------------------------
// Representative sample — one export from each major section of index.ts.
// These are the symbols Playwright drivers depend on; renaming any is a
// breaking change per the CLAUDE.md hard constraint.
// ---------------------------------------------------------------------------
const REQUIRED_EXPORTS: ReadonlyArray<string> = [
  // AppShell
  'APP_SHELL',
  'APP_SHELL_HEADER',
  'APP_SHELL_RAIL',
  'APP_SHELL_DRAWER',
  'APP_SHELL_MAIN',
  'APP_SHELL_RIGHT',
  'APP_SHELL_FOOTER',
  // SettingsSlot / SettingsModal
  'SETTINGS_SLOT_TRIGGER',
  'SETTINGS_MODAL',
  'SETTINGS_MODAL_CLOSE',
  'settingsModalTab',
  'settingsModalPanel',
  // AppearancePanel
  'SETTINGS_APPEARANCE_THEME_DARK',
  'SETTINGS_APPEARANCE_THEME_LIGHT',
  'SETTINGS_APPEARANCE_DENSITY_COMPACT',
  'SETTINGS_APPEARANCE_FONT_SCALE_SLIDER',
  'settingsAppearanceColor',
  // JobRow
  'JOB_ROW',
  'JOB_ROW_OPEN',
  'JOB_ROW_STATUS_FAILED',
  // PipelineTemplate
  'PIPELINE_TEMPLATE',
  'PIPELINE_BREADCRUMB',
  'PIPELINE_CONTROLS',
  'PIPELINE_STAGE_STRIP',
  // ArtifactViewer / PageWorkbench
  'ARTIFACT_PLATE',
  // BackendChip
  'BACKEND_CHIP',
  // EditModeSelector
  'EDIT_MODE_SELECTOR',
  // HierarchyTreePanel
  'HIERARCHY_TREE_PANEL',
  // Crop
  'CROP_OVERVIEW',
  // HyphenJoin
  'HJ_DECISION_CARD',
  'HJ_STATUS_PILL',
  // Validation
  'VALIDATION_CHECK_ROW',
  // Scannos
  'SCANNO_CANDIDATE_DETAIL',
  // PageReorder
  'REORDER_SCANS_BANNER',
  // ComputeTargetPanel
  'COMPUTE_TARGET_PANEL',
  'COMPUTE_DEVICE_OPTION',
  // UpdatePanel
  'UPDATE_PANEL',
  'UPDATE_BADGE',
  'UPDATE_APPLY_BUTTON',
] as const;

describe('dist/testids.js — built artifact content (pdomain-ui#28)', () => {
  it('dist/testids.js exists (run pnpm build first)', () => {
    expect(existsSync(JS_PATH), 'dist/testids.js missing — run pnpm build').toBe(true);
  });

  it('dist/testids.js is non-trivially non-empty (> 500 bytes)', () => {
    if (!existsSync(JS_PATH)) return;
    const content = readFileSync(JS_PATH, 'utf-8');
    expect(
      content.length,
      'dist/testids.js is suspiciously small — likely an empty re-export',
    ).toBeGreaterThan(500);
  });

  it('dist/testids.js contains string literal "app-shell" (spot-check APP_SHELL value)', () => {
    if (!existsSync(JS_PATH)) return;
    const content = readFileSync(JS_PATH, 'utf-8');
    expect(content).toContain('app-shell');
  });

  it('dist/testids.js contains many string literal assignments (not just an empty barrel)', () => {
    if (!existsSync(JS_PATH)) return;
    const content = readFileSync(JS_PATH, 'utf-8');
    // Vite bundles all assignments into a single minified `const a = "...", b = "...", ...` line.
    // Count string literals that look like testid values (kebab-case strings).
    const stringLiteralCount = (content.match(/"[a-z][a-z0-9-]+"/g) ?? []).length;
    expect(
      stringLiteralCount,
      'dist/testids.js has fewer than 50 testid string literals — likely empty',
    ).toBeGreaterThan(50);
  });
});

describe('dist/testids.d.ts — declaration file exports (pdomain-ui#28)', () => {
  it('dist/testids.d.ts exists (run pnpm build first)', () => {
    expect(existsSync(DTS_PATH), 'dist/testids.d.ts missing — run pnpm build').toBe(true);
  });

  it('dist/testids.d.ts is non-trivially non-empty (> 500 bytes)', () => {
    if (!existsSync(DTS_PATH)) return;
    const content = readFileSync(DTS_PATH, 'utf-8');
    expect(
      content.length,
      'dist/testids.d.ts is suspiciously small — likely an empty re-export',
    ).toBeGreaterThan(500);
  });

  for (const symbol of REQUIRED_EXPORTS) {
    it(`dist/testids.d.ts declares export '${symbol}'`, () => {
      if (!existsSync(DTS_PATH)) return;
      const content = readFileSync(DTS_PATH, 'utf-8');
      expect(content, `'${symbol}' must be declared in dist/testids.d.ts`).toContain(symbol);
    });
  }
});
