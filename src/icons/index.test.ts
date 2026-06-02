import { describe, it, expect } from 'vitest';
import * as iconsBarrel from './index.js';

describe('icons barrel (src/icons/index.ts)', () => {
  // Lucide re-exports — sorted alphabetically
  const lucideNames = [
    'AlertCircle',
    'AlertTriangle',
    'Archive',
    'ArrowDown',
    'ArrowLeftRight',
    'ArrowRight',
    'ArrowUp',
    'ArrowUpDown',
    'Bell',
    'Check',
    'CheckCircle',
    'ChevronDown',
    'ChevronLeft',
    'ChevronRight',
    'ChevronUp',
    'Copy',
    'Download',
    'Edit',
    'Eye',
    'EyeOff',
    'File',
    'FileText',
    'Folder',
    'FolderOpen',
    'GitBranch',
    'GripVertical',
    'HardDrive',
    'Image',
    'Info',
    'Keyboard',
    'LayoutList',
    'Link',
    'List',
    'Loader2',
    'Menu',
    'Minus',
    'Moon',
    'MoreHorizontal',
    'MoreVertical',
    'Package',
    'PanelRightClose',
    'Pause',
    'Pin',
    'PinOff',
    'Play',
    'Plus',
    'RefreshCw',
    'Scissors',
    'Search',
    'Settings',
    'Sparkles',
    'Square',
    'Sun',
    'Trash2',
    'Upload',
    'Wrench',
    'X',
  ];

  // Bespoke re-exports
  const bespokeNames = [
    'LayerBlock',
    'LayerPara',
    'LayerLine',
    'LayerWord',
    'ModeSelect',
    'ModeRebox',
    'ModeErase',
    'ModeCharFixer',
    'MatchStatusExact',
    'MatchStatusFuzzy',
    'MatchStatusMismatch',
  ];

  // Dispatcher shim (OQ-1)
  const dispatcherNames = ['Icon', 'ICON_NAMES'];

  it('re-exports all lucide icons', () => {
    for (const name of lucideNames) {
      expect(iconsBarrel).toHaveProperty(name);
    }
  });

  it('re-exports all bespoke OCR icons', () => {
    for (const name of bespokeNames) {
      expect(iconsBarrel).toHaveProperty(name);
      expect(iconsBarrel[name as keyof typeof iconsBarrel]).toBeTruthy();
    }
  });

  it('exports the Icon dispatcher and ICON_NAMES', () => {
    for (const name of dispatcherNames) {
      expect(iconsBarrel).toHaveProperty(name);
      expect(iconsBarrel[name as keyof typeof iconsBarrel]).toBeTruthy();
    }
  });

  it('exports exactly the union of lucide + bespoke + dispatcher names', () => {
    const expected = [
      ...lucideNames,
      ...bespokeNames,
      ...dispatcherNames,
      // type-only exports don't appear as runtime values, so only runtime names here
    ].sort();
    const actual = Object.keys(iconsBarrel).sort();
    expect(actual).toEqual(expected);
  });
});
