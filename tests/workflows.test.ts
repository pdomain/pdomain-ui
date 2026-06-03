import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MANAGED_ACTIONS = new Set([
  'actions/attest-build-provenance',
  'actions/checkout',
  'actions/download-artifact',
  'actions/setup-node',
  'actions/upload-artifact',
  'astral-sh/setup-uv',
  'pnpm/action-setup',
  'softprops/action-gh-release',
]);

const USES_PATTERN = /^\s*-?\s*uses:\s*([^@\s#]+)(?:@[^\s#]+)?/gm;

function workflowActionNames(text: string): Set<string> {
  const names = new Set<string>();
  for (const match of text.matchAll(USES_PATTERN)) {
    const name = match[1];
    if (!name.startsWith('./')) {
      names.add(name);
    }
  }
  return names;
}

async function verifyManagedActions(workflowDir: string): Promise<void> {
  const unmanaged = new Map<string, string[]>();
  for (const file of (await readdir(workflowDir)).filter((name) => name.endsWith('.yml'))) {
    const text = await readFile(join(workflowDir, file), 'utf8');
    for (const name of workflowActionNames(text)) {
      if (!MANAGED_ACTIONS.has(name)) {
        unmanaged.set(name, [...(unmanaged.get(name) ?? []), file]);
      }
    }
  }
  if (unmanaged.size > 0) {
    const details = [...unmanaged]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, files]) => `${name} in ${files.join(', ')}`)
      .join(', ');
    throw new Error(`unmanaged workflow actions: ${details}`);
  }
}

describe('workflow action policy', () => {
  it('detects unmanaged actions', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'workflow-policy-'));
    try {
      await writeFile(
        join(dir, 'ci.yml'),
        'name: ci\njobs:\n  ci:\n    steps:\n      - uses: example/not-managed@abc123\n',
      );

      await expect(verifyManagedActions(dir)).rejects.toThrow(/example\/not-managed/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('accepts local workflow calls', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'workflow-policy-'));
    try {
      await writeFile(
        join(dir, 'release.yml'),
        'jobs:\n  regen:\n    uses: ./.github/workflows/regen.yml\n',
      );

      await expect(verifyManagedActions(dir)).resolves.toBeUndefined();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('keeps current workflows on managed actions', async () => {
    await expect(verifyManagedActions('.github/workflows')).resolves.toBeUndefined();
  });
});
