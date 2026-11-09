/**
 * Tests for the codegen:check pipeline (M4.4)
 *
 * Verifies that:
 * 1. The codegen npm script chains fetch, emit, tsgen
 * 2. The codegen:check script exits non-zero when generated file is out of sync
 * 3. src/types/generated/book-tools.ts is committed (not gitignored)
 * 4. .codegen/ is gitignored
 * 5. The Makefile has functional codegen + codegen-check targets
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');

type PkgScripts = { scripts?: Record<string, string> };

describe('codegen orchestrator', () => {
  it('package.json codegen script chains fetch, emit, tsgen', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8')) as PkgScripts;
    const codegenScript = pkg.scripts?.['codegen'];
    expect(codegenScript).toBeTruthy();
    expect(codegenScript).toContain('codegen-fetch.mjs');
    expect(codegenScript).toContain('codegen-emit.mjs');
    expect(codegenScript).toContain('codegen-tsgen.mjs');
  });

  it('package.json codegen:check script chains codegen then git diff', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8')) as PkgScripts;
    const checkScript = pkg.scripts?.['codegen:check'];
    expect(checkScript).toBeTruthy();
    expect(checkScript).toContain('git diff --exit-code');
    expect(checkScript).toContain('src/types/generated');
  });

  it('src/types/generated/ directory exists', () => {
    expect(existsSync(join(REPO_ROOT, 'src/types/generated'))).toBe(true);
  });

  it('src/types/generated/book-tools.ts is committed (tracked by git)', () => {
    // git ls-files exits 0 and prints the path if the file is tracked
    const result = execSync('git ls-files src/types/generated/book-tools.ts', {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    }).trim();
    expect(result).toBe('src/types/generated/book-tools.ts');
  });

  it('.codegen/ is gitignored', () => {
    const gitignore = readFileSync(join(REPO_ROOT, '.gitignore'), 'utf-8');
    expect(gitignore).toMatch(/\.codegen/);
  });

  it('Makefile has codegen target that calls pnpm codegen', () => {
    const makefile = readFileSync(join(REPO_ROOT, 'Makefile'), 'utf-8');
    expect(makefile).toContain('codegen');
    // Should no longer be a placeholder
    expect(makefile).not.toContain('codegen placeholder — wired in M4');
  });

  it('Makefile has codegen-check target that calls pnpm codegen:check', () => {
    const makefile = readFileSync(join(REPO_ROOT, 'Makefile'), 'utf-8');
    expect(makefile).toContain('codegen-check');
    expect(makefile).not.toContain('codegen-check placeholder — wired in M4');
  });

  it('Makefile ci target includes codegen-check', () => {
    const makefile = readFileSync(join(REPO_ROOT, 'Makefile'), 'utf-8');
    // Look for the ci: line and verify codegen-check is there
    const ciLine = makefile.split('\n').find((l) => l.startsWith('ci:'));
    expect(ciLine).toBeDefined();
    expect(ciLine).toContain('codegen-check');
  });

  it('generated book-tools.ts has AUTO-GENERATED header', () => {
    const generatedPath = join(REPO_ROOT, 'src/types/generated/book-tools.ts');
    const content = readFileSync(generatedPath, 'utf-8');
    expect(content).toContain('AUTO-GENERATED');
    expect(content).toContain('DO NOT EDIT');
  });

  it('CLAUDE.md documents codegen bump workflow', () => {
    const claudeMd = readFileSync(join(REPO_ROOT, 'CLAUDE.md'), 'utf-8');
    expect(claudeMd).toContain('codegen.versions.json');
    expect(claudeMd).toContain('make codegen');
  });
});
