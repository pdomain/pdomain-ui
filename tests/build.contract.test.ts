import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    const jsEntries = files.filter((f) => /^[a-z]+\.js$/.test(f));
    const expectedJs = REQUIRED_ENTRIES.map((e) => `${e}.js`);
    for (const js of jsEntries) {
      expect(expectedJs, `Unexpected entry point: dist/${js}`).toContain(js);
    }
  });

  it('theme/ directory contains tokens.css and primitives.css', () => {
    const THEME = resolve(__dirname, '../theme');
    expect(existsSync(resolve(THEME, 'tokens.css')), 'theme/tokens.css missing').toBe(true);
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
