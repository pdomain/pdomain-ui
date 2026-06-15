import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasNamedExport(content: string, symbol: string, typeOnly: boolean): boolean {
  const exportPattern = typeOnly ? /\bexport\s+type\s*\{([^}]*)\}/g : /\bexport\s*\{([^}]*)\}/g;

  for (const match of content.matchAll(exportPattern)) {
    const clause = match[1] ?? '';
    const exports = clause.split(',').map((part) => part.trim());

    for (const exported of exports) {
      if (!exported) continue;
      const aliasMatch = /^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(exported);
      const exportedName = aliasMatch?.[2] ?? aliasMatch?.[1];
      if (exportedName === symbol) return true;
    }
  }

  return false;
}

function hasExportedValueSymbol(content: string, symbol: string): boolean {
  const escaped = escapeRegExp(symbol);
  const directDeclaration = new RegExp(
    String.raw`\b(?:export\s+)?declare\s+(?:const|let|var|function|class)\s+${escaped}\b`,
  );
  const directExport = new RegExp(
    String.raw`\bexport\s+(?:const|let|var|function|class)\s+${escaped}\b`,
  );

  return (
    hasNamedExport(content, symbol, false) ||
    directDeclaration.test(content) ||
    directExport.test(content)
  );
}

function hasExportedTypeSymbol(content: string, symbol: string): boolean {
  const escaped = escapeRegExp(symbol);
  const directTypeDeclaration = new RegExp(
    String.raw`\b(?:export\s+)?(?:declare\s+)?(?:type|interface)\s+${escaped}\b`,
  );

  return hasNamedExport(content, symbol, true) || directTypeDeclaration.test(content);
}

describe('declaration export matchers', () => {
  it('does not treat related type names as value exports', () => {
    const content = "export type { RecordListProps } from './records/RecordList.js';";
    expect(hasExportedValueSymbol(content, 'RecordList')).toBe(false);
  });

  it('matches named value exports by exported identifier', () => {
    const content = "export { RecordList, SearchField } from './records/RecordList.js';";
    expect(hasExportedValueSymbol(content, 'RecordList')).toBe(true);
  });

  it('matches direct value declarations', () => {
    const content = 'export declare function RecordList(): React.ReactElement;';
    expect(hasExportedValueSymbol(content, 'RecordList')).toBe(true);
  });

  it('does not treat related type names as type exports', () => {
    const content = "export type { ZoomFitModeProps } from './viewport/types.js';";
    expect(hasExportedTypeSymbol(content, 'ZoomFitMode')).toBe(false);
  });

  it('matches named type exports by exported identifier', () => {
    const content = "export type { ViewportSize, ZoomFitMode } from './viewport/types.js';";
    expect(hasExportedTypeSymbol(content, 'ZoomFitMode')).toBe(true);
  });

  it('matches direct type declarations', () => {
    const content = "declare type ZoomFitMode = 'none' | 'fit-page';";
    expect(hasExportedTypeSymbol(content, 'ZoomFitMode')).toBe(true);
  });
});

describe('vite.config.ts contract', () => {
  it('vite.config.ts exists', () => {
    const content = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8');
    expect(content).toBeTruthy();
  });

  it('vite config declares all required entry points', () => {
    const content = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8');
    const entries = [
      'index',
      'canvas',
      'worklist',
      'shell',
      'primitives',
      'icons',
      'types',
      'stores',
      'testids',
      'templates',
      'hooks',
      'records',
      'source-intake',
      'viewport',
      'settings',
      'status',
      'workbench',
    ];
    for (const entry of entries) {
      expect(content, `entry '${entry}' must be declared in vite.config.ts`).toContain(entry);
    }
  });

  it('vite config externalizes react', () => {
    const content = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8');
    expect(content).toContain("'react'");
  });

  it('vite config has cssCodeSplit', () => {
    const content = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8');
    expect(content).toContain('cssCodeSplit');
  });
});

describe('dist/ output completeness', () => {
  const DIST = resolve(__dirname, '../dist');
  const REQUIRED_ENTRIES = [
    'index',
    'canvas',
    'worklist',
    'shell',
    'primitives',
    'icons',
    'types',
    'stores',
    'testids',
    'templates',
    'hooks',
    'records',
    'source-intake',
    'viewport',
    'settings',
    'status',
    'workbench',
  ] as const;

  it('dist/ directory exists after build', () => {
    expect(existsSync(DIST), 'dist/ directory must exist — run pnpm build first').toBe(true);
  });

  for (const entry of REQUIRED_ENTRIES) {
    it(`dist/ contains ${entry}.js`, () => {
      expect(existsSync(resolve(DIST, `${entry}.js`)), `dist/${entry}.js missing`).toBe(true);
    });

    it(`dist/ contains ${entry}.d.ts`, () => {
      expect(existsSync(resolve(DIST, `${entry}.d.ts`)), `dist/${entry}.d.ts missing`).toBe(true);
    });
  }

  it('dist/ contains no unexpected top-level entry points', () => {
    if (!existsSync(DIST)) return; // skip if not built yet; covered by prior test
    const files = readdirSync(DIST);
    const jsEntries = files.filter((f) => /^[a-z-]+\.js$/.test(f));
    const expectedJs = REQUIRED_ENTRIES.map((e) => `${e}.js`);
    for (const js of jsEntries) {
      expect(expectedJs, `Unexpected entry point: dist/${js}`).toContain(js);
    }
  });

  it('theme/ directory contains tokens.css, reset.css and primitives.css', () => {
    const THEME = resolve(__dirname, '../theme');
    expect(existsSync(resolve(THEME, 'tokens.css')), 'theme/tokens.css missing').toBe(true);
    expect(existsSync(resolve(THEME, 'reset.css')), 'theme/reset.css missing').toBe(true);
    expect(existsSync(resolve(THEME, 'primitives.css')), 'theme/primitives.css missing').toBe(true);
  });
});

// Regression guard for pdomain-ui#15: export drift breaks pdomain-ocr-simple-gui
// These symbols must remain exported after every build or consumers break.
describe('dist/primitives.d.ts — consumer-critical exports (pdomain-ui#15)', () => {
  const dtsPath = resolve(__dirname, '../dist/primitives.d.ts');

  it('dist/primitives.d.ts exists (build must run first)', () => {
    expect(existsSync(dtsPath), 'dist/primitives.d.ts missing — run pnpm build').toBe(true);
  });

  const REQUIRED_SYMBOLS = [
    // pdomain-ocr-simple-gui imports these directly
    'JobStatusPip', // used in RecentProjectsList and ResultsPage
    'JobState', // re-exported via JobStatusPip.tsx for backward compat
    'BaseJobConfigDialog',
    'BaseJobConfig', // used as parameter type in JobConfigDialog.tsx
    'PageSplitView', // used in PageViewPage.tsx
    // StatusPip (the generic variant) must also stay
    'StatusPip',
    // PGDP app migration components and typed primitive contracts
    'ButtonVariant',
    'ButtonSize',
    'TriStateChip',
    'TriStateChipProps',
    'TriStateValue',
    'TabsAppearance',
    'AccordionTone',
  ];

  for (const sym of REQUIRED_SYMBOLS) {
    it(`exports ${sym}`, () => {
      if (!existsSync(dtsPath)) return; // guarded by prior test
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content, `${sym} must be exported from dist/primitives.d.ts`).toContain(sym);
    });
  }
});

describe('dist/types.d.ts — consumer-critical exports (pdomain-ui#15)', () => {
  const dtsPath = resolve(__dirname, '../dist/types.d.ts');

  it('dist/types.d.ts exists (build must run first)', () => {
    expect(existsSync(dtsPath), 'dist/types.d.ts missing — run pnpm build').toBe(true);
  });

  it('exports JobState', () => {
    if (!existsSync(dtsPath)) return;
    const content = readFileSync(dtsPath, 'utf-8');
    expect(content, 'JobState must be exported from dist/types.d.ts').toContain('JobState');
  });
});

describe('dist/index.d.ts — root barrel status exports', () => {
  const dtsPath = resolve(__dirname, '../dist/index.d.ts');

  it('dist/index.d.ts exists (build must run first)', () => {
    expect(existsSync(dtsPath), 'dist/index.d.ts missing — run pnpm build').toBe(true);
  });

  const REQUIRED_SYMBOLS = [
    'OperationStatusPanel',
    'OperationStatusPanelProps',
    'OperationState',
    'BlockingOperationOverlay',
    'BlockingOperationOverlayProps',
    'RetryActionPanel',
    'RetryActionPanelProps',
  ];

  for (const sym of REQUIRED_SYMBOLS) {
    it(`exports ${sym}`, () => {
      if (!existsSync(dtsPath)) return;
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content, `${sym} must be exported from dist/index.d.ts`).toContain(sym);
    });
  }
});

describe('dist/shell.d.ts — compute+update panel exports (Milestone D)', () => {
  const dtsPath = resolve(__dirname, '../dist/shell.d.ts');

  it('dist/shell.d.ts exists (build must run first)', () => {
    expect(existsSync(dtsPath), 'dist/shell.d.ts missing — run pnpm build').toBe(true);
  });

  const REQUIRED_SYMBOLS = [
    'ComputeTargetPanel',
    'ComputeTargetPanelProps',
    'UpdatePanel',
    'UpdatePanelProps',
  ];

  for (const sym of REQUIRED_SYMBOLS) {
    it(`exports ${sym}`, () => {
      if (!existsSync(dtsPath)) return;
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content, `${sym} must be exported from dist/shell.d.ts`).toContain(sym);
    });
  }
});

describe('dist/stores.d.ts — useDeviceInfo hook export (Milestone D)', () => {
  const dtsPath = resolve(__dirname, '../dist/stores.d.ts');

  it('dist/stores.d.ts exists (build must run first)', () => {
    expect(existsSync(dtsPath), 'dist/stores.d.ts missing — run pnpm build').toBe(true);
  });

  it('exports useDeviceInfo', () => {
    if (!existsSync(dtsPath)) return;
    const content = readFileSync(dtsPath, 'utf-8');
    expect(content, 'useDeviceInfo must be exported from dist/stores.d.ts').toContain(
      'useDeviceInfo',
    );
  });
});

describe('new cross-app common UI subpaths', () => {
  const REQUIRED = {
    records: {
      values: ['RecordList', 'DataTable', 'RecordGrid', 'EmptyState', 'ListToolbar', 'SearchField'],
      types: [],
    },
    'source-intake': {
      values: [
        'FileDropzone',
        'SourceKindSelector',
        'PathInputWithRecents',
        'DirectoryPickerDialog',
      ],
      types: [],
    },
    viewport: {
      values: ['ZoomViewport', 'ViewportToolbar'],
      types: ['ZoomFitMode'],
    },
    settings: {
      values: ['SettingsCard', 'SettingsRow', 'SettingSlider', 'SettingsAsyncSection'],
      types: [],
    },
    status: {
      values: ['OperationStatusPanel', 'BlockingOperationOverlay', 'RetryActionPanel'],
      types: [],
    },
    workbench: {
      values: ['WorkbenchLayout', 'InspectorPanel', 'DetailPanelShell'],
      types: [],
    },
  } as const;
  const dtsContentByEntry = new Map<string, string>();

  function readDtsEntry(entry: string): string {
    const cached = dtsContentByEntry.get(entry);
    if (cached !== undefined) return cached;

    const dtsPath = resolve(__dirname, `../dist/${entry}.d.ts`);
    const content = readFileSync(dtsPath, 'utf-8');
    dtsContentByEntry.set(entry, content);
    return content;
  }

  for (const [entry, symbols] of Object.entries(REQUIRED)) {
    for (const symbol of symbols.values) {
      it(`dist/${entry}.d.ts exports value ${symbol}`, () => {
        const dtsPath = resolve(__dirname, `../dist/${entry}.d.ts`);
        expect(existsSync(dtsPath), `dist/${entry}.d.ts missing - run pnpm build`).toBe(true);
        const content = readDtsEntry(entry);
        expect(
          hasExportedValueSymbol(content, symbol),
          `${symbol} must be exported as a value from dist/${entry}.d.ts`,
        ).toBe(true);
      });
    }

    for (const symbol of symbols.types) {
      it(`dist/${entry}.d.ts exports type ${symbol}`, () => {
        const dtsPath = resolve(__dirname, `../dist/${entry}.d.ts`);
        expect(existsSync(dtsPath), `dist/${entry}.d.ts missing - run pnpm build`).toBe(true);
        const content = readDtsEntry(entry);
        expect(
          hasExportedTypeSymbol(content, symbol),
          `${symbol} must be exported as a type from dist/${entry}.d.ts`,
        ).toBe(true);
      });
    }
  }
});
