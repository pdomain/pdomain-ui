/**
 * Runs scripts/update-pdomain-deps.sh against fake curl, just and git on PATH,
 * so no test reaches the real package index or regenerates types.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = join(REPO_ROOT, 'scripts/update-pdomain-deps.sh');

const OLD_BOOK_HASH = 'a'.repeat(64);
const OLD_OPS_HASH = 'b'.repeat(64);
const NEW_BOOK_HASH = 'c'.repeat(64);
const NEW_OPS_HASH = 'd'.repeat(64);

const PINS = {
  'pdomain-book-tools': {
    version: '0.28.0',
    sha256: { 'pdomain_book_tools-0.28.0-py3-none-any.whl': OLD_BOOK_HASH },
  },
  'pdomain-ops': {
    version: '0.11.2',
    sha256: { 'pdomain_ops-0.11.2-py3-none-any.whl': OLD_OPS_HASH },
  },
};

function indexLink(filename: string, hash?: string): string {
  const fragment = hash === undefined ? '' : `#sha256=${hash}`;
  return `<a href="https://example.test/releases/${filename}${fragment}">${filename}</a><br>`;
}

const BOOK_TOOLS_CURRENT = indexLink('pdomain_book_tools-0.28.0-py3-none-any.whl', OLD_BOOK_HASH);
const OPS_CURRENT = indexLink('pdomain_ops-0.11.2-py3-none-any.whl', OLD_OPS_HASH);

function writeExecutable(path: string, body: string): void {
  writeFileSync(path, `#!/bin/sh\n${body}\n`, 'utf-8');
  chmodSync(path, 0o755);
}

describe('update-pdomain-deps.sh', { timeout: 60_000 }, () => {
  let tmpDir: string;
  let versionsPath: string;
  let callLog: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'update-pdomain-deps-'));
    versionsPath = join(tmpDir, 'codegen.versions.json');
    callLog = join(tmpDir, 'calls.log');
    writeFileSync(versionsPath, `${JSON.stringify(PINS, null, 2)}\n`, 'utf-8');

    const binDir = join(tmpDir, 'bin');
    mkdirSync(binDir);
    writeExecutable(
      join(binDir, 'curl'),
      `for arg in "$@"; do last="$arg"; done
package=$(basename "$last")
page="${tmpDir}/$package.html"
[ -f "$page" ] || exit 22
cat "$page"`,
    );
    writeExecutable(join(binDir, 'just'), `echo "just $*" >> "${callLog}"`);
    writeExecutable(join(binDir, 'make'), 'echo "Unexpected make invocation" >&2; exit 1');
    writeExecutable(join(binDir, 'git'), `echo "git $*" >> "${callLog}"`);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function servePage(packageName: string, links: string[]): void {
    writeFileSync(join(tmpDir, `${packageName}.html`), links.join('\n'), 'utf-8');
  }

  function runUpdater(): ReturnType<typeof spawnSync> {
    return spawnSync('bash', [SCRIPT], {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      env: {
        ...process.env,
        PATH: `${join(tmpDir, 'bin')}:${process.env['PATH'] ?? ''}`,
        CODEGEN_VERSIONS_PATH: versionsPath,
      },
    });
  }

  function readPins(): unknown {
    return JSON.parse(readFileSync(versionsPath, 'utf-8'));
  }

  function calls(): string {
    return existsSync(callLog) ? readFileSync(callLog, 'utf-8') : '';
  }

  it('moves object-form pins to the latest version and wheel hash', () => {
    servePage('pdomain-book-tools', [
      BOOK_TOOLS_CURRENT,
      indexLink('pdomain_book_tools-0.29.0-py3-none-any.whl', NEW_BOOK_HASH),
      indexLink('pdomain_book_tools-0.29.0.tar.gz', 'e'.repeat(64)),
    ]);
    servePage('pdomain-ops', [
      OPS_CURRENT,
      indexLink('pdomain_ops-0.12.0-py3-none-any.whl', NEW_OPS_HASH),
    ]);

    const result = runUpdater();

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(readPins()).toEqual({
      'pdomain-book-tools': {
        version: '0.29.0',
        sha256: { 'pdomain_book_tools-0.29.0-py3-none-any.whl': NEW_BOOK_HASH },
      },
      'pdomain-ops': {
        version: '0.12.0',
        sha256: { 'pdomain_ops-0.12.0-py3-none-any.whl': NEW_OPS_HASH },
      },
    });
    expect(calls()).toContain(`just --justfile ${join(REPO_ROOT, 'justfile')} codegen`);
    expect(calls()).toContain('add codegen.versions.json src/types/generated/');
  });

  it('leaves pins alone and skips codegen when already at latest', () => {
    servePage('pdomain-book-tools', [BOOK_TOOLS_CURRENT]);
    servePage('pdomain-ops', [OPS_CURRENT]);

    const result = runUpdater();

    expect(result.status).toBe(0);
    expect(readPins()).toEqual(PINS);
    expect(calls()).toBe('');
  });

  it('ignores a newer release that has no universal wheel', () => {
    servePage('pdomain-book-tools', [
      BOOK_TOOLS_CURRENT,
      indexLink('pdomain_book_tools-0.30.0.tar.gz', 'e'.repeat(64)),
    ]);
    servePage('pdomain-ops', [OPS_CURRENT]);

    const result = runUpdater();

    expect(result.status).toBe(0);
    expect(readPins()).toEqual(PINS);
  });

  it('fails without changing pins when the latest wheel has no hash', () => {
    servePage('pdomain-book-tools', [
      BOOK_TOOLS_CURRENT,
      indexLink('pdomain_book_tools-0.29.0-py3-none-any.whl'),
    ]);
    servePage('pdomain-ops', [OPS_CURRENT]);

    const result = runUpdater();

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('no sha256');
    expect(readPins()).toEqual(PINS);
    expect(calls()).toBe('');
  });

  it('writes no pins when a later package cannot be fetched', () => {
    servePage('pdomain-book-tools', [
      BOOK_TOOLS_CURRENT,
      indexLink('pdomain_book_tools-0.29.0-py3-none-any.whl', NEW_BOOK_HASH),
    ]);

    const result = runUpdater();

    expect(result.status).not.toBe(0);
    expect(readPins()).toEqual(PINS);
    expect(calls()).toBe('');
  });
});
