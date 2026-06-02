import { describe, it, expect } from 'vitest';
import * as lucideExports from './lucide.js';

describe('lucide re-exports', () => {
  const expectedIcons = [
    'AlertCircle',
    'AlertTriangle', // design "alert"  (OQ-7)
    'Archive', // design "archive"
    'ArrowDown', // design "arrowDown"
    'ArrowLeftRight', // design "swap"  (OQ-8)
    'ArrowRight', // design "arrowR"
    'ArrowUp', // design "arrowUp"
    'ArrowUpDown', // design "arrowUpDown"
    'Bell', // design "bell"
    'Check',
    'CheckCircle', // design "checkCircle"
    'ChevronDown',
    'ChevronLeft',
    'ChevronRight',
    'ChevronUp',
    'Copy', // design "copy"
    'Download', // design "download"
    'Edit',
    'Eye',
    'EyeOff',
    'File', // design "file"
    'FileText', // design "fileText"
    'Folder', // design "folder"
    'FolderOpen',
    'GitBranch',
    'GripVertical', // design "grip"
    'HardDrive', // design "hardDrive"
    'Image', // design "image"
    'Info',
    'Keyboard',
    'LayoutList',
    'Link', // design "link"
    'List',
    'Loader2',
    'Menu',
    'Minus',
    'Moon', // design "moon"
    'MoreHorizontal',
    'MoreVertical',
    'Package', // design "package"
    'PanelRightClose',
    'Pause', // design "pause"
    'Pin', // design "pin"
    'PinOff', // design "pinOff"
    'Play', // design "play"
    'Plus',
    'RefreshCw', // design "refresh"
    'Scissors', // design "scissors"
    'Search',
    'Settings',
    'Sparkles', // design "sparkles"
    'Square',
    'Sun', // design "sun"
    'Trash2',
    'Upload', // design "upload"
    'Wrench', // design "wrench"
    'X',
  ];

  it('exports all expected icons', () => {
    for (const name of expectedIcons) {
      expect(lucideExports).toHaveProperty(name);
    }
  });

  it('each export is a non-null React component (function or object with $$typeof)', () => {
    for (const name of expectedIcons) {
      const icon = lucideExports[name as keyof typeof lucideExports];
      expect(icon).toBeTruthy();
      // lucide icons are forwardRef objects; accept both function and object forms
      expect(['function', 'object'].includes(typeof icon)).toBe(true);
    }
  });

  it('exports exactly the curated set — no extra symbols', () => {
    const exported = Object.keys(lucideExports);
    expect(exported.sort()).toEqual(expectedIcons.sort());
  });
});
