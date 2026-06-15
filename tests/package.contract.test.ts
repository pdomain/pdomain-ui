import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8')) as Record<
  string,
  unknown
>;

describe('package.json contract', () => {
  it('has correct name', () => {
    expect(pkg['name']).toBe('@pdomain/pdomain-ui');
  });

  it('exports has all required subpaths', () => {
    const exports = pkg['exports'] as Record<string, unknown>;
    const required = [
      '.',
      './canvas',
      './worklist',
      './shell',
      './primitives',
      './icons',
      './types',
      './stores',
      './testids',
      './templates',
      './records',
      './source-intake',
      './viewport',
      './settings',
      './status',
      './workbench',
      './theme/tokens.css',
      './theme/reset.css',
      './theme/primitives.css',
    ];
    for (const subpath of required) {
      expect(exports, `exports["${subpath}"] must exist`).toHaveProperty(subpath);
    }
  });

  it('exports new common UI subpaths with matching import and types targets', () => {
    const exports = pkg['exports'] as Record<string, unknown>;
    const required = {
      './records': {
        import: './dist/records.js',
        types: './dist/records.d.ts',
      },
      './source-intake': {
        import: './dist/source-intake.js',
        types: './dist/source-intake.d.ts',
      },
      './viewport': {
        import: './dist/viewport.js',
        types: './dist/viewport.d.ts',
      },
      './settings': {
        import: './dist/settings.js',
        types: './dist/settings.d.ts',
      },
      './status': {
        import: './dist/status.js',
        types: './dist/status.d.ts',
      },
      './workbench': {
        import: './dist/workbench.js',
        types: './dist/workbench.d.ts',
      },
    } as const;

    for (const [subpath, targets] of Object.entries(required)) {
      expect(exports[subpath], `exports["${subpath}"] targets must match`).toEqual(targets);
    }
  });

  it('does not depend on class-variance-authority', () => {
    const deps = (pkg['dependencies'] as Record<string, unknown>) ?? {};
    expect(Object.keys(deps)).not.toContain('class-variance-authority');
  });

  it('does not depend on tailwindcss', () => {
    const deps = (pkg['dependencies'] as Record<string, unknown>) ?? {};
    expect(Object.keys(deps)).not.toContain('tailwindcss');
  });

  it('peerDependencies supports React 18 and 19', () => {
    const peers = (pkg['peerDependencies'] as Record<string, unknown>) ?? {};
    expect(peers).toHaveProperty('react');
    expect(peers).toHaveProperty('react-dom');
    expect(peers).toHaveProperty('react-konva');
    const reactVersion = peers['react'] as string;
    const reactDomVersion = peers['react-dom'] as string;
    const reactKonvaVersion = peers['react-konva'] as string;
    expect(reactVersion).toMatch(/\^18/);
    expect(reactVersion).toMatch(/\^19/);
    expect(reactDomVersion).toMatch(/\^18/);
    expect(reactDomVersion).toMatch(/\^19/);
    expect(reactKonvaVersion).toMatch(/\^19/);
  });

  it('react-konva is not in dependencies (must be a peer)', () => {
    const deps = (pkg['dependencies'] as Record<string, unknown>) ?? {};
    expect(Object.keys(deps)).not.toContain('react-konva');
  });

  it('exports has ./theme/tokens.css subpath', () => {
    const exports = pkg['exports'] as Record<string, unknown>;
    expect(exports).toHaveProperty('./theme/tokens.css');
    expect(exports['./theme/tokens.css']).toBe('./theme/tokens.css');
  });

  it('exports has ./theme/primitives.css subpath', () => {
    const exports = pkg['exports'] as Record<string, unknown>;
    expect(exports).toHaveProperty('./theme/primitives.css');
    expect(exports['./theme/primitives.css']).toBe('./theme/primitives.css');
  });

  it('exports has ./theme/reset.css subpath', () => {
    const exports = pkg['exports'] as Record<string, unknown>;
    expect(exports).toHaveProperty('./theme/reset.css');
    expect(exports['./theme/reset.css']).toBe('./theme/reset.css');
  });

  it('files includes "theme" directory', () => {
    const files = pkg['files'] as string[];
    expect(files).toContain('theme');
  });

  it('version is a valid semver string', () => {
    // Do not hardcode version — check shape only so the test survives releases.
    expect(typeof pkg['version']).toBe('string');
    expect(pkg['version']).toMatch(/^\d+\.\d+\.\d+/);
  });
});
