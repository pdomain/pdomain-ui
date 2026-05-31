/**
 * Tests for scripts/codegen-fetch.mjs
 *
 * Strategy: the script reads codegen.versions.json and builds uv pip install
 * commands. We use a shim approach — place a fake `uv` on PATH and verify
 * the correct invocation is produced.
 *
 * Hash verification tests use CODEGEN_VERSIONS_PATH + CODEGEN_WHEEL_CACHE_DIR
 * to inject a pre-downloaded fake wheel file and a versions file with a
 * deliberately wrong or correct SHA256, then assert the script exit code.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, chmodSync } from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const SCRIPT = join(REPO_ROOT, 'scripts/codegen-fetch.mjs');

describe('codegen:fetch script', () => {
  let tmpDir: string;
  let shimBinDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'codegen-fetch-'));
    shimBinDir = join(tmpDir, 'bin');
    mkdirSync(shimBinDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reads codegen.versions.json from repo root', () => {
    const versionsPath = join(REPO_ROOT, 'codegen.versions.json');
    const content = readFileSync(versionsPath, 'utf-8');
    const versions = JSON.parse(content) as Record<string, unknown>;
    expect(versions).toHaveProperty('pdomain-book-tools');
    // Since #25: each entry is an object { version, sha256 }, not a plain string
    const entry = versions['pdomain-book-tools'] as Record<string, unknown>;
    expect(entry).toHaveProperty('version');
    expect(typeof entry['version']).toBe('string');
  });

  it('codegen.versions.json has pdomain-ops key with version and sha256', () => {
    const versionsPath = join(REPO_ROOT, 'codegen.versions.json');
    const versions = JSON.parse(readFileSync(versionsPath, 'utf-8')) as Record<string, unknown>;
    expect(versions).toHaveProperty('pdomain-ops');
    const entry = versions['pdomain-ops'] as Record<string, unknown>;
    expect(entry).toHaveProperty('version');
    expect(entry).toHaveProperty('sha256');
  });

  it('script file exists and is executable Node.js', () => {
    const content = readFileSync(SCRIPT, 'utf-8');
    expect(content).toContain('#!/usr/bin/env node');
  });

  it('script reads versions and forms correct uv pip install invocation', () => {
    // Write a shim uv that records its arguments
    const shimLog = join(tmpDir, 'uv-calls.log');
    const uvShim = join(shimBinDir, 'uv');
    writeFileSync(uvShim, `#!/bin/sh\necho "$@" >> "${shimLog}"\n`, 'utf-8');
    chmodSync(uvShim, 0o755);

    const versionsPath = join(REPO_ROOT, 'codegen.versions.json');
    const versions = JSON.parse(readFileSync(versionsPath, 'utf-8')) as Record<
      string,
      { version: string }
    >;
    const btVersion = versions['pdomain-book-tools']?.version;

    const env = {
      ...process.env,
      PATH: `${shimBinDir}:${process.env['PATH'] ?? ''}`,
      CODEGEN_VENV_DIR: join(tmpDir, 'venv'),
      // Skip actual venv creation (shim handles it)
    };

    try {
      execFileSync('node', [SCRIPT, '--book-tools-only', '--dry-run'], {
        env,
        cwd: REPO_ROOT,
        encoding: 'utf-8',
      });
    } catch {
      // dry-run mode may exit 0 or non-zero depending on impl; we only check log
    }

    // The script should log what it would invoke — check stdout contains version
    // We use --dry-run flag which prints the commands without executing them
    let output = '';
    try {
      output = execFileSync('node', [SCRIPT, '--book-tools-only', '--dry-run'], {
        env,
        cwd: REPO_ROOT,
        encoding: 'utf-8',
      });
    } catch (e: unknown) {
      output =
        (e as { stdout?: string; stderr?: string }).stdout ??
        (e as { stderr?: string }).stderr ??
        '';
    }

    expect(output).toContain('pdomain-book-tools');
    expect(output).toContain(btVersion);
  });

  it('script --dry-run prints pip install command with pdomain-index-pip URL', () => {
    const env = {
      ...process.env,
      PATH: `${shimBinDir}:${process.env['PATH'] ?? ''}`,
    };

    let output = '';
    try {
      output = execFileSync('node', [SCRIPT, '--book-tools-only', '--dry-run'], {
        env,
        cwd: REPO_ROOT,
        encoding: 'utf-8',
      });
    } catch (e: unknown) {
      output = (e as { stdout?: string }).stdout ?? '';
    }

    // Must reference the self-hosted index
    expect(output).toContain('pdomain-index-pip');
    expect(output).not.toContain('pd-index');
    expect(output).not.toMatch(/concavetrillion.*pd-index/i);
  });

  it('script --dry-run downloads wheels from pdomain GitHub releases', () => {
    const env = {
      ...process.env,
      PATH: `${shimBinDir}:${process.env['PATH'] ?? ''}`,
    };

    const output = execFileSync('node', [SCRIPT, '--dry-run'], {
      env,
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    });

    expect(output).toContain('https://github.com/pdomain/pdomain-book-tools/releases/download/');
    expect(output).toContain('https://github.com/pdomain/pdomain-ops/releases/download/');
    expect(output).not.toContain('https://github.com/ConcaveTrillion/pdomain-ops/');
  });

  // -------------------------------------------------------------------------
  // Hash verification tests
  // -------------------------------------------------------------------------

  it('codegen.versions.json has sha256 entries for each package', () => {
    const versionsPath = join(REPO_ROOT, 'codegen.versions.json');
    const versions = JSON.parse(readFileSync(versionsPath, 'utf-8')) as Record<string, unknown>;

    for (const [pkg, entry] of Object.entries(versions)) {
      expect(entry, `${pkg} must be an object with version + sha256`).toBeTypeOf('object');
      const e = entry as Record<string, unknown>;
      expect(e).toHaveProperty('version');
      expect(e).toHaveProperty('sha256');
      const hashes = e['sha256'] as Record<string, string>;
      expect(
        Object.keys(hashes).length,
        `${pkg} must have at least one sha256 entry`,
      ).toBeGreaterThan(0);
      for (const [filename, hash] of Object.entries(hashes)) {
        expect(filename, 'wheel filename must end in .whl').toMatch(/\.whl$/);
        expect(hash, 'SHA256 must be 64 hex chars').toMatch(/^[0-9a-f]{64}$/);
      }
    }
  });

  it('hash mismatch causes script to exit non-zero', () => {
    // Arrange: write a fake wheel file with known content
    const fakeWheelName = 'pdomain_book_tools-0.14.1-py3-none-any.whl';
    const fakeWheelContent = Buffer.from('this is not a real wheel');
    const wheelCacheDir = join(tmpDir, 'wheel-cache');
    mkdirSync(wheelCacheDir);
    writeFileSync(join(wheelCacheDir, fakeWheelName), fakeWheelContent);

    // Compute the actual hash of the fake file (deliberately does NOT match stored hash)
    const actualHash = createHash('sha256').update(fakeWheelContent).digest('hex');
    const storedHash = 'd1ae8b934b1b0b9e421ea0d82ea040a003910c6541810e26870404c368bc2f38';
    // Guard: actual hash of fake content must differ from the real wheel hash
    expect(actualHash).not.toBe(storedHash);

    // Write versions file with the real (correct) stored hash
    const versionsFile = join(tmpDir, 'codegen.versions.json');
    writeFileSync(
      versionsFile,
      JSON.stringify({
        'pdomain-book-tools': {
          version: '0.14.1',
          sha256: { [fakeWheelName]: storedHash },
        },
      }),
      'utf-8',
    );

    // Run script in hash-check-only mode (no install, but hash must be verified)
    // CODEGEN_WHEEL_CACHE_DIR tells the script to use pre-downloaded wheels
    // CODEGEN_VERSIONS_PATH overrides which versions file to read
    // --book-tools-only avoids needing pdomain-ops hash too
    const env = {
      ...process.env,
      CODEGEN_VERSIONS_PATH: versionsFile,
      CODEGEN_WHEEL_CACHE_DIR: wheelCacheDir,
      CODEGEN_VENV_DIR: join(tmpDir, 'venv'),
      PATH: `${shimBinDir}:${process.env['PATH'] ?? ''}`,
    };

    // Write a uv shim that does nothing (we only care about pre-install hash check)
    const uvShim = join(shimBinDir, 'uv');
    writeFileSync(uvShim, '#!/bin/sh\n# no-op shim\n', 'utf-8');
    chmodSync(uvShim, 0o755);

    let exitCode = 0;
    let combinedOutput = '';
    try {
      const result = execFileSync('node', [SCRIPT, '--book-tools-only'], {
        env,
        cwd: REPO_ROOT,
        encoding: 'utf-8',
      });
      combinedOutput = result;
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: string; stderr?: string };
      exitCode = err.status ?? 1;
      combinedOutput = (err.stdout ?? '') + (err.stderr ?? '');
    }

    expect(exitCode, 'script must exit non-zero on hash mismatch').not.toBe(0);
    expect(combinedOutput).toMatch(/hash|sha256|mismatch|corrupt/i);
  });

  it('correct hash allows script to proceed past verification', () => {
    // Arrange: write a fake wheel file and compute its real hash
    const fakeWheelName = 'pdomain_book_tools-0.14.1-py3-none-any.whl';
    const fakeWheelContent = Buffer.from('fake wheel content for hash test');
    const wheelCacheDir = join(tmpDir, 'wheel-cache');
    mkdirSync(wheelCacheDir);
    writeFileSync(join(wheelCacheDir, fakeWheelName), fakeWheelContent);
    const correctHash = createHash('sha256').update(fakeWheelContent).digest('hex');

    const versionsFile = join(tmpDir, 'codegen.versions.json');
    writeFileSync(
      versionsFile,
      JSON.stringify({
        'pdomain-book-tools': {
          version: '0.14.1',
          sha256: { [fakeWheelName]: correctHash },
        },
      }),
      'utf-8',
    );

    // Write a uv shim that exits 0
    const uvShim = join(shimBinDir, 'uv');
    writeFileSync(uvShim, '#!/bin/sh\nexit 0\n', 'utf-8');
    chmodSync(uvShim, 0o755);

    const env = {
      ...process.env,
      CODEGEN_VERSIONS_PATH: versionsFile,
      CODEGEN_WHEEL_CACHE_DIR: wheelCacheDir,
      CODEGEN_VENV_DIR: join(tmpDir, 'venv'),
      PATH: `${shimBinDir}:${process.env['PATH'] ?? ''}`,
    };

    let exitCode = 0;
    try {
      execFileSync('node', [SCRIPT, '--book-tools-only'], {
        env,
        cwd: REPO_ROOT,
        encoding: 'utf-8',
      });
    } catch (e: unknown) {
      const err = e as { status?: number };
      exitCode = err.status ?? 1;
    }

    expect(exitCode, 'script must exit 0 when hash matches').toBe(0);
  });
});
