import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

function verifyManagedActions(workflowDir: string): string {
  return execFileSync(
    'python3',
    [
      '-c',
      [
        'import importlib.util',
        'import sys',
        'from pathlib import Path',
        'root = Path.cwd()',
        'path = root / "scripts" / "update_github_actions.py"',
        'spec = importlib.util.spec_from_file_location("update_github_actions", path)',
        'mod = importlib.util.module_from_spec(spec)',
        'assert spec.loader is not None',
        'spec.loader.exec_module(mod)',
        'try:',
        '    mod.verify_managed_actions(Path(sys.argv[1]))',
        'except ValueError as exc:',
        '    raise SystemExit(str(exc))',
        'print("managed actions ok")',
      ].join('\n'),
      workflowDir,
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
}

function updateQuotedWorkflowRefs(workflowPath: string): string {
  return execFileSync(
    'python3',
    [
      '-c',
      [
        'import importlib.util',
        'import sys',
        'from pathlib import Path',
        'root = Path.cwd()',
        'path = root / "scripts" / "update_github_actions.py"',
        'spec = importlib.util.spec_from_file_location("update_github_actions", path)',
        'mod = importlib.util.module_from_spec(spec)',
        'assert spec.loader is not None',
        'spec.loader.exec_module(mod)',
        'workflow = Path(sys.argv[1])',
        'releases = {',
        "    'actions/checkout': mod.ActionRelease(tag='v-test', sha='a' * 40),",
        "    'astral-sh/setup-uv': mod.ActionRelease(tag='v-test', sha='b' * 40),",
        '}',
        'assert mod.update_workflow_refs(workflow, releases=releases)',
        "assert mod.update_uv_version_refs(workflow, version='0.11.16')",
        "print(workflow.read_text(encoding='utf-8'))",
      ].join('\n'),
      workflowPath,
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
}

describe('workflow action policy', () => {
  test('detects unmanaged actions', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'workflow-policy-'));
    try {
      await writeFile(
        join(dir, 'ci.yml'),
        'name: ci\njobs:\n  ci:\n    steps:\n      - uses: example/not-managed@abc123\n',
      );

      expect(() => verifyManagedActions(dir)).toThrow(/example\/not-managed/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('accepts quoted managed actions and local workflow calls', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'workflow-policy-'));
    try {
      await writeFile(
        join(dir, 'release.yml'),
        'jobs:\n  regen:\n    uses: \'./.github/workflows/regen.yml\'\n  ci:\n    steps:\n      - uses: "actions/checkout@abc123"\n',
      );

      expect(verifyManagedActions(dir)).toContain('managed actions ok');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('rewrites quoted action refs and setup-uv version', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'workflow-update-'));
    try {
      const workflowPath = join(dir, 'ci.yml');
      await writeFile(
        workflowPath,
        'jobs:\n  ci:\n    steps:\n      - uses: "actions/checkout@oldoldoldoldoldoldoldoldoldoldoldoldoldoldoldoldold1"\n      - uses: \'astral-sh/setup-uv@oldoldoldoldoldoldoldoldoldoldoldoldoldoldoldoldold2\'  # v8.1.0\n        with:\n          version: "0.1.0"\n',
      );

      const updated = updateQuotedWorkflowRefs(workflowPath);

      expect(updated).toContain(
        'uses: "actions/checkout@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"',
      );
      expect(updated).toContain(
        "uses: 'astral-sh/setup-uv@bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'",
      );
      expect(updated).toContain('version: "0.11.16"');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('keeps current workflows on updater-managed actions', () => {
    expect(verifyManagedActions('.github/workflows')).toContain('managed actions ok');
  });
});
