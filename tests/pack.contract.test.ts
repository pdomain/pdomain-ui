/**
 * Pack tarball content contract — verifies that `pnpm pack --json` includes
 * all required files for a valid consumer install.
 *
 * This test runs pnpm pack, checks the JSON manifest, then removes the tarball.
 * It serves as the CI gate for #176 (publish dry-run).
 */
import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PKG_VERSION = (
  JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')) as { version: string }
).version;

// Capture which tarballs exist before so we only remove the one we create.
function runPack(): { files: string[]; filename: string } {
  const result = spawnSync('pnpm', ['pack', '--json'], {
    cwd: ROOT,
    encoding: 'utf-8',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  if (result.status !== 0) {
    throw new Error(`pnpm pack failed: ${result.stderr}`);
  }
  const parsed = JSON.parse(result.stdout) as {
    filename: string;
    files: Array<{ path: string }>;
  };
  return {
    filename: parsed.filename,
    files: parsed.files.map((f) => f.path),
  };
}

const packResult = runPack();

afterAll(() => {
  // Remove the tarball created by pnpm pack.
  const tgz = resolve(ROOT, packResult.filename);
  if (existsSync(tgz)) {
    unlinkSync(tgz);
  }
});

const REQUIRED_DIST_ENTRIES = [
  'canvas',
  'icons',
  'index',
  'primitives',
  'shell',
  'stores',
  'templates',
  'testids',
  'types',
  'worklist',
] as const;

describe('pnpm pack tarball contents', () => {
  it('tarball filename contains current package version', () => {
    expect(packResult.filename).toContain(PKG_VERSION);
  });

  it('tarball includes package.json', () => {
    expect(packResult.files).toContain('package.json');
  });

  it('tarball includes README.md', () => {
    expect(packResult.files).toContain('README.md');
  });

  it('tarball includes LICENSE', () => {
    expect(packResult.files).toContain('LICENSE');
  });

  it('tarball includes theme/tokens.css', () => {
    expect(packResult.files).toContain('theme/tokens.css');
  });

  it('tarball includes theme/reset.css', () => {
    expect(packResult.files).toContain('theme/reset.css');
  });

  it('tarball includes theme/primitives.css', () => {
    expect(packResult.files).toContain('theme/primitives.css');
  });

  for (const entry of REQUIRED_DIST_ENTRIES) {
    it(`tarball includes dist/${entry}.js`, () => {
      expect(packResult.files, `dist/${entry}.js missing from tarball`).toContain(
        `dist/${entry}.js`,
      );
    });

    it(`tarball includes dist/${entry}.d.ts`, () => {
      expect(packResult.files, `dist/${entry}.d.ts missing from tarball`).toContain(
        `dist/${entry}.d.ts`,
      );
    });
  }
});
