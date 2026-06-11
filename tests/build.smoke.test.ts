/**
 * Build smoke test — regression guard for es2022 target compatibility and
 * production-JSX correctness.
 *
 * Asserts that `pnpm build` exits 0, produces the expected dist files, and
 * does NOT emit jsxDEV() calls that import "react/jsx-dev-runtime".
 *
 * Red phase: fails when Vite's default target (chrome87/es2020) can't
 * transpile rest-destructuring in forwardRef components, OR when the build
 * emits dev-mode JSX transforms (jsxDEV) instead of production ones.
 * Green phase: passes after build.target is set to 'es2022' AND vite.config.ts
 * sets esbuild.jsxDev = false.
 *
 * Runs in Node environment (no jsdom) via @vitest/env-node shim.
 * Excluded from coverage thresholds (build-runner, not app code).
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const DIST_ENTRIES = [
  'index.js',
  'canvas.js',
  'worklist.js',
  'shell.js',
  'primitives.js',
  'icons.js',
  'types.js',
  'stores.js',
  'testids.js',
  'templates.js',
] as const;

describe('pnpm build smoke (es2022 transpile regression)', () => {
  // Run the build once for this describe block.
  // execSync throws on non-zero exit — that's the assertion for commit 1 (red).
  let buildError: Error | null = null;

  try {
    // Pass NODE_ENV=production explicitly: Vitest sets NODE_ENV=test in the
    // parent process, and that value is inherited by execSync children.  A
    // build launched with NODE_ENV=test would emit jsxDEV instead of jsx,
    // crashing React 19 consumers.  This explicit override is belt-and-
    // suspenders alongside the jsxDev:false setting in vite.config.ts.
    execSync('pnpm build', {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
      env: { ...process.env, NODE_ENV: 'production' },
    });
  } catch (err) {
    buildError = err as Error;
  }

  it('pnpm build exits 0 (no transpile errors)', () => {
    if (buildError) {
      const output =
        (buildError as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stdout ?? '';
      const stderr =
        (buildError as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stderr ?? '';
      throw new Error(
        `pnpm build failed:\nstdout: ${output.slice(0, 2000)}\nstderr: ${stderr.slice(0, 2000)}`,
      );
    }
    expect(buildError).toBeNull();
  });

  for (const entry of DIST_ENTRIES) {
    it(`dist/${entry} exists after build`, () => {
      expect(
        existsSync(resolve(ROOT, 'dist', entry)),
        `dist/${entry} missing — build may have failed`,
      ).toBe(true);
    });
  }

  it('dist/ directory exists', () => {
    expect(existsSync(resolve(ROOT, 'dist')), 'dist/ must exist after pnpm build').toBe(true);
  });

  it('dist/ contains no jsxDEV or react/jsx-dev-runtime imports (production JSX guard)', () => {
    // Regression guard: if the build emits jsxDEV() from "react/jsx-dev-runtime",
    // React 19 production builds set jsxDEV = undefined → "jsxDEV is not a function"
    // on every page load in consuming apps.
    //
    // Root cause of the v0.7.1 regression: build.smoke.test.ts called execSync('pnpm build')
    // without overriding NODE_ENV, so Vitest's NODE_ENV=test caused esbuild to emit dev
    // JSX transforms.  The build artifact was then re-packed and published with jsxDEV.
    //
    // This test fails if jsxDEV or jsx-dev-runtime appears anywhere in dist/*.js.
    if (!existsSync(resolve(ROOT, 'dist'))) return; // skip if build failed above

    const distDir = resolve(ROOT, 'dist');
    const jsFiles = readdirSync(distDir).filter((f) => f.endsWith('.js'));

    const offenders: string[] = [];
    for (const file of jsFiles) {
      const content = readFileSync(resolve(distDir, file), 'utf-8');
      if (content.includes('jsx-dev-runtime') || content.includes('jsxDEV')) {
        offenders.push(file);
      }
    }

    expect(
      offenders,
      `dist/ files contain jsxDEV/jsx-dev-runtime (dev-mode JSX transform leaked into build):\n  ${offenders.join('\n  ')}\n\nThis crashes React 19 consumers. Fix: ensure vite.config.ts sets esbuild.jsxDev = false.`,
    ).toHaveLength(0);
  });
});
