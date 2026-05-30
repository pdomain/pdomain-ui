#!/usr/bin/env node
/**
 * codegen-fetch.mjs — M4.1
 *
 * Reads codegen.versions.json, creates .codegen/venv/ via `uv venv`, and
 * installs pinned wheels from the pdomain-index-pip self-hosted registry.
 *
 * SHA256 hash verification is enforced for every wheel before installation.
 * Wheels are downloaded to a local cache dir, their SHA256 is verified, and
 * only then installed from the local path. A hash mismatch is a fatal error.
 *
 * Flags:
 *   --book-tools-only   Only install pdomain-book-tools (skip pdomain-ops)
 *   --dry-run           Print the commands that would be run; do not execute
 *   --local             Install from local sibling paths instead of registry
 *                       (bootstrap mode for dev before wheels are published)
 *
 * Environment overrides (used in tests):
 *   CODEGEN_VERSIONS_PATH   Override path to codegen.versions.json
 *   CODEGEN_VENV_DIR        Override path to the venv (default: .codegen/venv)
 *   CODEGEN_WHEEL_CACHE_DIR Override wheel download cache (default: .codegen/wheels)
 *                           If set to a directory with pre-downloaded wheels,
 *                           the download step is skipped (hash check still runs).
 */

import { readFileSync, existsSync, mkdirSync, createReadStream } from 'fs'
import { execFileSync } from 'child_process'
import { resolve, dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

const PD_INDEX_PIP_URL = 'https://pdomain.github.io/pdomain-index-pip/simple/'
const GH_RELEASES_BASE = 'https://github.com/pdomain'

function parseArgs(argv) {
  const args = argv.slice(2)
  return {
    bookToolsOnly: args.includes('--book-tools-only'),
    dryRun: args.includes('--dry-run'),
    local: args.includes('--local'),
  }
}

function readVersions() {
  const versionsPath =
    process.env['CODEGEN_VERSIONS_PATH'] ?? join(REPO_ROOT, 'codegen.versions.json')
  const raw = readFileSync(versionsPath, 'utf-8')
  return JSON.parse(raw)
}

/**
 * Normalise a versions entry: support both the legacy plain-string format
 * and the new { version, sha256 } object format.
 *
 * @param {string} pkg  Package name (e.g. "pdomain-book-tools")
 * @param {unknown} entry  Value from codegen.versions.json
 * @returns {{ version: string, sha256: Record<string,string> | null }}
 */
function normaliseEntry(pkg, entry) {
  if (typeof entry === 'string') {
    // Legacy format — no hash info
    return { version: entry, sha256: null }
  }
  if (typeof entry === 'object' && entry !== null) {
    const e = /** @type {Record<string,unknown>} */ (entry)
    const version = String(e['version'] ?? '')
    const sha256 = /** @type {Record<string,string> | null} */ (
      typeof e['sha256'] === 'object' && e['sha256'] !== null ? e['sha256'] : null
    )
    return { version, sha256 }
  }
  throw new Error(`codegen.versions.json: unexpected entry for "${pkg}": ${JSON.stringify(entry)}`)
}

function run(cmd, args, { dryRun, cwd } = {}) {
  const display = [cmd, ...args].join(' ')
  if (dryRun) {
    console.log(`[dry-run] ${display}`)
    return
  }
  console.log(`$ ${display}`)
  execFileSync(cmd, args, { stdio: 'inherit', cwd: cwd ?? REPO_ROOT })
}

/**
 * Compute the SHA-256 hex digest of a local file.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function sha256File(filePath) {
  const hash = createHash('sha256')
  const stream = createReadStream(filePath)
  await pipeline(stream, async function* (source) {
    for await (const chunk of source) {
      hash.update(chunk)
    }
  })
  return hash.digest('hex')
}

/**
 * Download a URL to a local file path using Node's built-in fetch.
 * @param {string} url
 * @param {string} destPath
 */
async function downloadFile(url, destPath) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Download failed: ${url} → HTTP ${response.status}`)
  }
  const dest = createWriteStream(destPath)
  const reader = response.body.getReader()
  await new Promise((resolve, reject) => {
    const pump = () => {
      reader.read().then(({ done, value }) => {
        if (done) {
          dest.end()
          dest.on('finish', resolve)
          return
        }
        if (!dest.write(value)) {
          dest.once('drain', pump)
        } else {
          pump()
        }
      }).catch(reject)
    }
    pump()
  })
}

/**
 * Verify all expected SHA256 hashes for a package entry.
 * Fails fast on mismatch.
 *
 * @param {string} pkg
 * @param {Record<string,string>} sha256Map  filename → expected hex digest
 * @param {string} wheelCacheDir
 */
async function verifyHashes(pkg, sha256Map, wheelCacheDir) {
  for (const [filename, expectedHash] of Object.entries(sha256Map)) {
    const wheelPath = join(wheelCacheDir, filename)
    if (!existsSync(wheelPath)) {
      throw new Error(
        `Hash verification failed: expected wheel not found at ${wheelPath}\n` +
        `Run codegen:fetch without CODEGEN_WHEEL_CACHE_DIR to download it.`
      )
    }
    console.log(`Verifying SHA256 for ${filename}...`)
    const actualHash = await sha256File(wheelPath)
    if (actualHash !== expectedHash) {
      throw new Error(
        `SHA256 hash mismatch for ${pkg} (${filename})!\n` +
        `  Expected: ${expectedHash}\n` +
        `  Actual:   ${actualHash}\n` +
        `The wheel may be corrupt or tampered. Remove it and re-run codegen:fetch.`
      )
    }
    console.log(`  OK: ${filename}`)
  }
}

async function main() {
  const opts = parseArgs(process.argv)
  const versions = readVersions()

  const venvDir = process.env['CODEGEN_VENV_DIR'] ?? join(REPO_ROOT, '.codegen', 'venv')
  const wheelCacheDir =
    process.env['CODEGEN_WHEEL_CACHE_DIR'] ?? join(REPO_ROOT, '.codegen', 'wheels')

  // Ensure .codegen dir exists
  const codegenDir = join(REPO_ROOT, '.codegen')
  if (!opts.dryRun) {
    mkdirSync(codegenDir, { recursive: true })
  } else {
    console.log(`[dry-run] mkdir -p ${codegenDir}`)
  }

  // Create venv (--clear recreates it if it already exists)
  run('uv', ['venv', '--clear', venvDir], { dryRun: opts.dryRun })

  // Determine which packages to install
  const pkgNames = opts.bookToolsOnly
    ? ['pdomain-book-tools']
    : ['pdomain-book-tools', 'pdomain-ops']

  if (opts.local) {
    // Local bootstrap mode: install from sibling repo paths (no hash check needed)
    const localPaths = pkgNames.map((pkg) => {
      const repoName = pkg // 'pdomain-book-tools', 'pdomain-ops'
      const localPath = resolve(REPO_ROOT, '..', repoName)
      const { version } = normaliseEntry(pkg, versions[pkg])
      console.log(`[local mode] ${pkg}==${version} from ${localPath}`)
      return localPath
    })
    run('uv', ['pip', 'install', '--python', venvDir, ...localPaths], {
      dryRun: opts.dryRun,
    })
    if (!opts.dryRun) {
      console.log('codegen:fetch complete.')
    }
    return
  }

  // Registry mode: download, verify, then install
  if (opts.dryRun) {
    // In dry-run mode, just print the planned operations
    for (const pkg of pkgNames) {
      const { version, sha256 } = normaliseEntry(pkg, versions[pkg])
      const pyPkg = pkg.replace(/-/g, '_')
      const wheelName = `${pyPkg}-${version}-py3-none-any.whl`
      const wheelUrl = `${GH_RELEASES_BASE}/${pkg}/releases/download/v${version}/${wheelName}`
      console.log(`Installing ${pkg}==${version} from ${PD_INDEX_PIP_URL}`)
      console.log(`[dry-run] Download ${wheelUrl} → ${join(wheelCacheDir, wheelName)}`)
      if (sha256) {
        const expectedHash = sha256[wheelName] ?? '(no hash for this filename)'
        console.log(`[dry-run] Verify SHA256: ${expectedHash}`)
      } else {
        console.warn(`[WARNING] No sha256 entry for ${pkg} — hash verification will be skipped`)
      }
      console.log(
        `[dry-run] uv pip install --python ${venvDir} ` +
          `--extra-index-url ${PD_INDEX_PIP_URL} ${join(wheelCacheDir, wheelName)}`
      )
    }
    return
  }

  // Ensure wheel cache dir exists
  mkdirSync(wheelCacheDir, { recursive: true })

  const wheelPathsToInstall = []

  for (const pkg of pkgNames) {
    const { version, sha256 } = normaliseEntry(pkg, versions[pkg])
    const pyPkg = pkg.replace(/-/g, '_')
    const wheelName = `${pyPkg}-${version}-py3-none-any.whl`
    const wheelPath = join(wheelCacheDir, wheelName)

    // Skip download if using CODEGEN_WHEEL_CACHE_DIR override (test mode)
    const usePreDownloaded = Boolean(process.env['CODEGEN_WHEEL_CACHE_DIR'])

    if (!usePreDownloaded) {
      // Download the wheel from GitHub Releases (canonical source)
      const wheelUrl = `${GH_RELEASES_BASE}/${pkg}/releases/download/v${version}/${wheelName}`
      console.log(`Downloading ${pkg}==${version} from ${wheelUrl}`)
      await downloadFile(wheelUrl, wheelPath)
    }

    // Verify hash before installing
    if (sha256) {
      if (!sha256[wheelName]) {
        throw new Error(
          `codegen.versions.json: no sha256 entry for wheel "${wheelName}" in "${pkg}". ` +
          `Add it or run 'pnpm codegen:update-hashes'.`
        )
      }
      await verifyHashes(pkg, sha256, wheelCacheDir)
    } else {
      console.warn(
        `[WARNING] No sha256 in codegen.versions.json for ${pkg}. ` +
        `Hash verification skipped — update codegen.versions.json to add hashes.`
      )
    }

    wheelPathsToInstall.push(wheelPath)
  }

  // Install all verified wheels from the local cache
  run('uv', ['pip', 'install', '--python', venvDir, ...wheelPathsToInstall])

  console.log('codegen:fetch complete.')
}

main().catch((err) => {
  console.error('codegen:fetch failed:', err.message)
  process.exit(1)
})
