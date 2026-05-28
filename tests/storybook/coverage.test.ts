/**
 * M9.5 — Story-presence CI gate.
 *
 * Walks src/ for every *.tsx file that is:
 *   1. Not a test file (*.test.tsx)
 *   2. Not itself a story file (*.stories.tsx)
 *   3. Not on the internal-utilities whitelist
 *
 * For each such file it asserts that a sibling *.stories.tsx exists.
 *
 * Whitelist rationale:
 *   - Layer helpers (BBoxLayer, etc.) are slot-fill helpers only usable
 *     inside PageImageCanvas — they are exercised by PageImageCanvas stories.
 *   - Sub-shell fragments (Breadcrumb, Drawer, Rail, TopNav, RightPanel)
 *     are layout-only wrappers exercised by AppShell stories.
 *   - VirtualizedList is an internal list shell used by WordList.
 *   - StoreContexts, SuiteSiblingsProvider are providers exercised
 *     by AppShell and WordList stories.
 *   - LauncherSlot, LauncherTile are exercised by AppShell stories.
 *   - FieldRow is a layout helper used alongside Field.
 *   - bespoke.tsx is covered by Icons.stories.tsx (Icons catalogue).
 */

import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { describe, it, expect } from 'vitest';

// ── Whitelist of files that don't need their own *.stories.tsx ──────────────

// Relative to src/ (forward slashes, no leading slash).
const WHITELIST: ReadonlySet<string> = new Set([
  // Canvas internal slot helpers — covered by PageImageCanvas.stories.tsx
  'canvas/layers/BBoxLayer.tsx',
  'canvas/layers/MarqueeSelectLayer.tsx',
  'canvas/layers/WordHitLayer.tsx',

  // Icons files — covered by Icons.stories.tsx (catalogue + dispatcher gallery)
  'icons/bespoke.tsx',
  'icons/Icon.tsx',

  // Shell sub-fragments — covered by AppShell.stories.tsx
  'shell/Breadcrumb.tsx',
  'shell/Drawer.tsx',
  'shell/LauncherSlot.tsx',
  'shell/LauncherTile.tsx',
  'shell/Rail.tsx',
  'shell/RightPanel.tsx',
  'shell/SuiteSiblingsProvider.tsx',
  'shell/TopNav.tsx',

  // Worklist internals — covered by WordList.stories.tsx
  'worklist/VirtualizedList.tsx',

  // Store context providers — covered by component stories that use AppShell
  'stores/StoreContexts.tsx',

  // UIPrefsApplicator is a zero-render side-effect component exercised by AppShell
  'shell/UIPrefsApplicator.tsx',

  // ShortcutsContext is a pure context provider — visual output (ShortcutsCheatsheet)
  // is exercised by ShortcutsCheatsheet.stories.tsx; the provider itself has no
  // renderable UI surface of its own beyond the dialog it delegates.
  'hooks/ShortcutsContext.tsx',

  // AppearancePanel + SettingsModal are internal to AppShell settings surface
  // They are exercised by AppShell.stories.tsx and SettingsSlot.stories.tsx
  'shell/AppearancePanel.tsx',
  'shell/SettingsModal.tsx',

  // FieldRow is a layout helper documented alongside Field
  'primitives/FieldRow.tsx',

  // Kanban internals — covered by KanbanBoard.stories.tsx
  'primitives/kanban/KanbanColumn.tsx',
  'primitives/kanban/PageChip.tsx',

  // Template sub-components — covered by the template's own stories
  'templates/ProjectInfoBand.tsx',

  // PageWorkbench internal sub-components — covered by ArtifactViewer.stories.tsx
  'stages/PageWorkbench/ArtifactPlate.tsx',
  'stages/PageWorkbench/PaperRender.tsx',
  // AttrEditorPopover is an internal sub-component of PageAttributesBar — covered by PageAttributesBar.stories.tsx
  'stages/PageWorkbench/AttrEditorPopover.tsx',
  // TreeRow is an internal sub-component of HierarchyTreePanel — covered by HierarchyTreePanel.stories.tsx
  'stages/PageWorkbench/TreeRow.tsx',
  // TypeGrid is an internal sub-component of BlockTypePickerPanel — covered by BlockTypePickerPanel.stories.tsx
  'stages/PageWorkbench/TypeGrid.tsx',

  // OcrTextPanel internal sub-components — covered by OcrTextPanel.stories.tsx
  'stages/PageWorkbench/ConfPip.tsx',
  'stages/PageWorkbench/WordCard.tsx',
  'stages/PageWorkbench/WordRow.tsx',
  'stages/PageWorkbench/LineBlockCard.tsx',
  'stages/PageWorkbench/LineBlockRow.tsx',
  // LayerToggle is an internal sub-component of LabelerCanvas — covered by LabelerCanvas.stories.tsx
  'stages/PageWorkbench/LayerToggle.tsx',

  // PageThumb is an internal sub-component of SwapRow — covered by SwapRow.stories.tsx
  'stages/PageReorder/PageThumb.tsx',
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

function walkTsx(dir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...walkTsx(full));
    } else if (
      entry.endsWith('.tsx') &&
      !entry.endsWith('.test.tsx') &&
      !entry.endsWith('.stories.tsx')
    ) {
      result.push(full);
    }
  }
  return result;
}

// ── Test ─────────────────────────────────────────────────────────────────────

describe('Story coverage', () => {
  const srcDir = join(__dirname, '../../src');

  const componentFiles = walkTsx(srcDir);

  const missing: string[] = [];

  for (const file of componentFiles) {
    const rel = relative(srcDir, file); // e.g. "primitives/Button.tsx"
    if (WHITELIST.has(rel)) continue;

    const storyFile = join(dirname(file), basename(file, '.tsx') + '.stories.tsx');
    if (!existsSync(storyFile)) {
      missing.push(rel);
    }
  }

  it('every non-whitelisted component has a sibling *.stories.tsx', () => {
    expect(missing, `Missing stories for:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  // Verify the test itself is meaningful: confirm at least one whitelisted file exists.
  it('whitelist references real files (sanity check)', () => {
    const real = [...WHITELIST].filter((rel) => existsSync(join(srcDir, rel)));
    expect(real.length).toBeGreaterThan(0);
  });
});
