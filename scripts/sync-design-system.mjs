#!/usr/bin/env node
/**
 * sync-design-system.mjs
 *
 * Syncs pdomain-ui/theme/*.css → ../docs/design-system/*.css
 *
 * Usage:
 *   node scripts/sync-design-system.mjs            # sync + print diff summary
 *   node scripts/sync-design-system.mjs --dry-run  # print diff summary, no writes
 *   node scripts/sync-design-system.mjs --check    # exits non-zero on any diff
 *   node scripts/sync-design-system.mjs --force    # skip uncommitted-changes guard
 *
 * Exit codes:
 *   0  — in-sync (or --dry-run with no diff)
 *   1  — diff exists (in --check mode) or guard blocked the run
 */

import { execFileSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isCheck = args.includes('--check')
const isForce = args.includes('--force')

// Resolve paths
const pdUiRoot = resolve(__dirname, '..')
const themeDir = resolve(pdUiRoot, 'theme')
const docsDesignSystemDir = resolve(pdUiRoot, '..', 'docs', 'design-system')

const FILES = ['tokens.css', 'primitives.css']

// Validate docs/design-system/ exists.
// In --check mode (CI) when the directory doesn't exist (e.g. first checkout or
// agent worktree that lacks the workspace docs/ sibling), treat as in-sync and
// exit 0. There is nothing to drift against.
if (!existsSync(docsDesignSystemDir)) {
  if (isCheck) {
    console.log(`INFO: docs/design-system/ not found at ${docsDesignSystemDir} — skipping check (no workspace docs to drift against).`)
    process.exit(0)
  }
  console.error(`ERROR: docs/design-system/ directory not found at: ${docsDesignSystemDir}`)
  process.exit(1)
}

// Guard: refuse if docs/design-system/ has uncommitted changes (unless --force)
if (!isForce && !isDryRun && !isCheck) {
  let gitStatus = ''
  try {
    gitStatus = execFileSync(
      'git',
      ['status', '--porcelain', docsDesignSystemDir],
      { encoding: 'utf-8', cwd: resolve(pdUiRoot, '..') }
    ).trim()
  } catch {
    // git not available or not a repo — skip guard
    gitStatus = ''
  }
  if (gitStatus) {
    console.error(
      `ERROR: docs/design-system/ has uncommitted changes:\n${gitStatus}\n` +
      `Commit or stash them first, or pass --force to override.`
    )
    process.exit(1)
  }
}

// Process each file
let anyDiff = false

for (const file of FILES) {
  const srcPath = resolve(themeDir, file)
  const dstPath = resolve(docsDesignSystemDir, file)

  if (!existsSync(srcPath)) {
    console.error(`ERROR: source file not found: ${srcPath}`)
    process.exit(1)
  }

  const srcContent = readFileSync(srcPath, 'utf-8')
  const dstContent = existsSync(dstPath) ? readFileSync(dstPath, 'utf-8') : null

  if (srcContent === dstContent) {
    console.log(`  ${file}: in sync`)
    continue
  }

  anyDiff = true

  // Print diff summary
  if (dstContent === null) {
    console.log(`  ${file}: NEW (destination did not exist)`)
  } else {
    const srcLines = srcContent.split('\n').length
    const dstLines = dstContent.split('\n').length
    const added = srcLines - dstLines
    console.log(
      `  ${file}: CHANGED ` +
      `(src=${srcLines} lines, dst=${dstLines} lines, delta=${added >= 0 ? '+' : ''}${added})`
    )
  }

  if (!isDryRun && !isCheck) {
    writeFileSync(dstPath, srcContent, 'utf-8')
    console.log(`    -> written to ${dstPath}`)
  }
}

if (!anyDiff) {
  console.log('sync-design-system: all files in sync.')
  process.exit(0)
}

if (isCheck) {
  console.error(
    'sync-design-system --check: diff detected between pdomain-ui/theme/ and docs/design-system/.\n' +
    'Run: node scripts/sync-design-system.mjs  to sync.'
  )
  process.exit(1)
}

if (isDryRun) {
  console.log('sync-design-system --dry-run: diff detected (no files written).')
  process.exit(0)
}

console.log('sync-design-system: sync complete.')
process.exit(0)
