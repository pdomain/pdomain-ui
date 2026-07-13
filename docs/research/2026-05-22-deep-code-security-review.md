---
kind: research
status: stale
owner: CT
created: 2026-05-22
last_verified: 2026-07-13
---

# pdomain-ui deep code review and security scan

Date: 2026-05-22
Repo: `pdomain/pdomain-ui`
Scope: full `pdomain-ui` source, tests, package/release configuration, scripts,
and dependency audit.

Review method:

- Parallel subagent review of shell/primitives, canvas/worklist/stores,
  supply-chain/release/codegen, and tests/contracts.
- Local static review of security-sensitive patterns, workflow scripts,
  package metadata, and generated/public API contracts.
- `pnpm audit --audit-level low`.

Summary:

- High: 8
- Medium: 17
- Low: 4
- Total: 29

Filed issues:

- 1. High: Malformed OCR word boxes can crash canvas rendering —
  <https://github.com/pdomain/pdomain-ui/issues/22>
- 1. High: `useStageCall` enters warming state but never retries —
  <https://github.com/pdomain/pdomain-ui/issues/23>
- 1. High: Release checkout exposes a write-scoped token to
  install/build steps —
  <https://github.com/pdomain/pdomain-ui/issues/24>
- 1. High: Codegen executes remotely fetched Python wheels without hash
  verification —
  <https://github.com/pdomain/pdomain-ui/issues/25>
- 1. High: Release tag name is interpolated directly into shell —
  <https://github.com/pdomain/pdomain-ui/issues/26>
- 1. High: `make ci` is not clean-checkout reproducible —
  <https://github.com/pdomain/pdomain-ui/issues/27>
- 1. High: Published `/testids` subpath is an empty public contract —
  <https://github.com/pdomain/pdomain-ui/issues/28>
- 1. High: Unverified OCR/page metadata can force huge Konva canvas
  allocation —
  <https://github.com/pdomain/pdomain-ui/issues/29>
- 1. Medium: `launcherSlot` does not control launcher placement or
  visibility —
  <https://github.com/pdomain/pdomain-ui/issues/30>
- 1. Medium: Sibling launches open tabs with opener access —
  <https://github.com/pdomain/pdomain-ui/issues/31>
- 1. Medium: Settings popover cannot be dismissed by outside click —
  <https://github.com/pdomain/pdomain-ui/issues/32>
- 1. Medium: Job config dialog ignores Radix close events —
  <https://github.com/pdomain/pdomain-ui/issues/33>
- 1. Medium: Canvas can show a stale page image after `src` changes or
  fails —
  <https://github.com/pdomain/pdomain-ui/issues/34>
- 1. Medium: Drag throttling is ineffective and can flood renders —
  <https://github.com/pdomain/pdomain-ui/issues/35>
- 1. Medium: `useLongJob` shows stale job state when job ID clears or
  changes —
  <https://github.com/pdomain/pdomain-ui/issues/36>
- 1. Medium: UI prefs load can overwrite edits made during hydration —
  <https://github.com/pdomain/pdomain-ui/issues/37>
- 1. Medium: Preference persist failures are silently ignored —
  <https://github.com/pdomain/pdomain-ui/issues/38>
- 1. Medium: Worklist Enter can select an out-of-range index after
  filtering —
  <https://github.com/pdomain/pdomain-ui/issues/39>
- 1. Medium: Release workflow uses mutable third-party action tags —
  <https://github.com/pdomain/pdomain-ui/issues/40>
- 1. Medium: Release publishes without running package/codegen/test
  gates —
  <https://github.com/pdomain/pdomain-ui/issues/41>
- 1. Medium: Storybook E2E server depends on undeclared `npx serve` —
  <https://github.com/pdomain/pdomain-ui/issues/42>
- 1. Medium: Vulnerable dev dependency `esbuild@0.21.5` —
  <https://github.com/pdomain/pdomain-ui/issues/43>
- 1. Medium: Vulnerable dev dependency `vite@5.4.21` —
  <https://github.com/pdomain/pdomain-ui/issues/44>
- 1. Medium: Vulnerable dev dependency `uuid@9.0.1` —
  <https://github.com/pdomain/pdomain-ui/issues/45>
- 1. Medium: Shell docs and barrel disagree on hook exports —
  <https://github.com/pdomain/pdomain-ui/issues/46>
- 1. Low: Settings segmented controls expose no selected state to
  assistive tech —
  <https://github.com/pdomain/pdomain-ui/issues/47>
- 1. Low: Field errors are not associated with their inputs —
  <https://github.com/pdomain/pdomain-ui/issues/48>
- 1. Low: Shell string used for git status path —
  <https://github.com/pdomain/pdomain-ui/issues/49>
- 1. Low: Story coverage gate exempts exported public worklist
  components —
  <https://github.com/pdomain/pdomain-ui/issues/50>

## Findings

### High

1. Malformed OCR word boxes can crash canvas rendering

- Evidence: `src/canvas/PageImageCanvas.tsx:28` dereferences
  `word.bounding_box.top_left`; render and hit-tests dereference bbox
  fields without validation.
- Impact: corrupt OCR data can throw during render or pointer handling
  and blank the review canvas.
- Fix: centralize bbox validation, skip invalid words for render/hit-test,
  and add malformed bbox tests.

1. `useStageCall` enters warming state but never retries

- Evidence: `src/stores/useStageCall.ts:75` sets warming/retryAt on 503,
  but schedules no retry.
- Impact: cold backend/GPU stages stay stuck until manual user retry
  despite the hook contract.
- Fix: store submitted params, schedule bounded retry, clear timers on
  unmount/new run, and test 503-then-success.

1. Release checkout exposes a write-scoped token to install/build steps

- Evidence: `.github/workflows/release.yml:31` grants write permissions
  and `.github/workflows/release.yml:36` checks out without
  `persist-credentials: false` before `pnpm install`.
- Impact: compromised dependency lifecycle scripts or build tooling can
  read the persisted checkout credential.
- Fix: use `persist-credentials: false`, split build and publish jobs,
  and grant write permissions only where needed.

1. Codegen executes remotely fetched Python wheels without hash verification

- Evidence: `scripts/codegen-fetch.mjs:96` installs version-pinned
  packages from the self-hosted index without hashes;
  `scripts/codegen-emit.mjs:50` and `:75` execute modules from that venv.
- Impact: a mutated or compromised artifact with the same version can run
  arbitrary Python during codegen.
- Fix: store expected SHA256 hashes and enforce/verify them before
  executing generated-schema emitters.

1. Release tag name is interpolated directly into shell

- Evidence: `.github/workflows/release.yml:87` embeds
  `${{ github.ref_name }}` inside a shell assignment.
- Impact: a malicious `v*` tag containing shell metacharacters can
  execute in the release job, including the secret-bearing dispatch step.
- Fix: pass the tag through `env`, validate strict semver syntax, and
  build URLs from quoted shell variables.

1. `make ci` is not clean-checkout reproducible

- Evidence: `Makefile:90` runs `test` before `build`;
  `tests/build.contract.test.ts:47` requires ignored `dist/` to already
  exist.
- Impact: clean CI/release workspaces can fail before building, while
  dirty workspaces pass due to stale ignored output.
- Fix: run `build` before tests that assert `dist/`, or move dist
  assertions to a post-build target.

1. Published `/testids` subpath is an empty public contract

- Evidence: `src/testids/index.ts:1` contains only `export {}` while
  the workspace design spec documents `TESTIDS`.
- Impact: consumers cannot import the documented stable selector catalog
  and may fail to compile or hard-code selectors.
- Fix: implement a typed `TESTIDS` export and add built-package contract
  tests.

1. Unverified OCR/page metadata can force huge Konva canvas allocation

- Evidence: `src/canvas/PageImageCanvas.tsx:110` only rejects non-positive
  dimensions; `stageWidth` and `stageHeight` are passed directly to
  `<Stage>`.
- Impact: very large page dimensions can freeze the tab or exhaust memory.
- Fix: require finite dimensions, enforce a maximum render area, and
  render an invalid-page state.

### Medium

1. `launcherSlot` does not control launcher placement or visibility

- Evidence: `src/shell/AppShell.tsx:62` always renders `<LauncherSlot />`
  in the built-in header; the rail renders only `{rail}`.
- Impact: `launcherSlot="off"` still shows launchers, and
  `launcherSlot="rail"` never moves them.
- Fix: render launcher conditionally by `launcherSlot` and test
  header/rail/off behavior.

1. Sibling launches open tabs with opener access

- Evidence: `src/shell/LauncherTile.tsx:24` calls
  `window.open(result.url, '_blank')`.
- Impact: launched pages can access `window.opener`, enabling
  reverse-tabnabbing or cross-app opener manipulation.
- Fix: use `noopener,noreferrer`, defensively clear `opener`, and
  validate allowed URL schemes/origins.

1. Settings popover cannot be dismissed by outside click

- Evidence: `src/shell/SettingsSlot.tsx:134` always calls
  `e.preventDefault()` in `onInteractOutside`.
- Impact: users cannot dismiss the popover by clicking elsewhere, leaving
  controls over the app.
- Fix: narrow prevention to the slider/reflow case and add an
  outside-click dismissal test.

1. Job config dialog ignores Radix close events

- Evidence: `src/primitives/BaseJobConfigDialog.tsx:83` controls
  `<Dialog open={open}>` without `onOpenChange`.
- Impact: Escape and outside-dismiss do not notify the parent, so
  standard accessible dialog dismissal fails.
- Fix: wire `onOpenChange` to `onClose` for closing transitions and test
  Escape/outside dismissal.

1. Canvas can show a stale page image after `src` changes or fails

- Evidence: `src/canvas/PageImageCanvas.tsx:169` never clears the previous
  image when `src` changes and has no `onerror` path.
- Impact: users can inspect or edit overlays against a previous page
  image.
- Fix: clear image state at effect start, handle load errors, and ignore
  late loads with a source token.

1. Drag throttling is ineffective and can flood renders

- Evidence: `src/canvas/PageImageCanvas.tsx:33` declares `pending` inside
  `rAFSchedule`, so every mousemove queues another frame.
- Impact: marquee drag over dense overlays can schedule excessive state
  updates and jank.
- Fix: keep pending/latest rect in component refs and schedule at most
  one frame.

1. `useLongJob` shows stale job state when job ID clears or changes

- Evidence: `src/stores/useLongJob.ts:62` returns early for null
  `jobId`/missing `pollFn` without resetting state.
- Impact: previous job progress/events remain visible for a new or absent
  job.
- Fix: reset to idle on null/no poller and clear state when a new job
  starts.

1. UI prefs load can overwrite edits made during hydration

- Evidence: `src/stores/createUIPrefsStore.ts:91` replaces `prefs`
  wholesale when async `load()` resolves.
- Impact: edits made while loading can disappear or diverge from
  persisted state.
- Fix: block setters until hydration or track revisions and
  merge/replay local edits.

1. Preference persist failures are silently ignored

- Evidence: `src/stores/createUIPrefsStore.ts:105` and related setters
  fire `persistCommon`/`persistApp` promises without catch, retry,
  rollback, or error state.
- Impact: write failures can create unhandled rejections and a UI state
  that is lost on reload.
- Fix: catch persist failures and expose error/dirty state or rollback
  behavior.

1. Worklist Enter can select an out-of-range index after filtering

- Evidence: `src/worklist/VirtualizedList.tsx:64` calls
  `handleSelect(selectedIndex)` without range checking.
- Impact: stale controlled indices can cause consumers to read `undefined`
  or act on stale rows.
- Fix: clamp/clear selection when items shrink and guard Enter/click
  paths.

1. Release workflow uses mutable third-party action tags

- Evidence: `.github/workflows/release.yml` uses version tags for
  checkout, pnpm setup, node setup, attestations, and release upload.
- Impact: compromised or retagged actions can execute with release
  permissions and secrets.
- Fix: pin all actions to full commit SHAs and use automated updates.

1. Release publishes without running package/codegen/test gates

- Evidence: `.github/workflows/release.yml:50` runs only
  `pnpm run build` before packing and releasing.
- Impact: stale generated types, package contract regressions, or
  vulnerable tooling can be published.
- Fix: run the same CI gate as normal validation plus package/audit gates
  before release.

1. Storybook E2E server depends on undeclared `npx serve`

- Evidence: `playwright.config.ts:49` runs `npx serve`, but `serve` is
  not in `package.json` or `pnpm-lock.yaml`.
- Impact: e2e can download unpinned code at runtime or fail
  offline/noninteractively.
- Fix: add `serve` as a devDependency and invoke `pnpm exec serve`, or
  use another pinned local server.

1. Vulnerable dev dependency `esbuild@0.21.5`

- Evidence: `pnpm audit --audit-level low` reports GHSA-67mh-4wv8-2f99;
  `pnpm-lock.yaml:2049` resolves `esbuild@0.21.5`.
- Impact: affected dev servers can be abused by websites to read local
  dev-server responses.
- Fix: upgrade Storybook/Vite tooling or override `esbuild` to a
  patched compatible version.

1. Vulnerable dev dependency `vite@5.4.21`

- Evidence: `pnpm audit --audit-level low` reports GHSA-4w7w-66w2-5vf9;
  `pnpm-lock.yaml:3397` resolves `vite@5.4.21`.
- Impact: optimized dependency sourcemap handling can expose files via
  path traversal in dev/test server contexts.
- Fix: upgrade to a patched Vite line and compatible Storybook builder
  packages.

1. Vulnerable dev dependency `uuid@9.0.1`

- Evidence: `pnpm audit --audit-level low` reports GHSA-w5hq-g745-h8pq;
  `pnpm-lock.yaml:3378` resolves `uuid@9.0.1`.
- Impact: callers using affected UUID buffer APIs can hit missing bounds
  checks.
- Fix: upgrade Storybook/addons or override `uuid` to `>=11.1.1` if
  compatible.

1. Shell docs and barrel disagree on hook exports

- Evidence: `src/shell/index.ts:7` documents `useSuiteSiblings`, but
  the barrel exports only `useSuiteSiblingsContext`; store hooks live
  under `/stores`.
- Impact: consumers following documented shell imports get missing
  exports.
- Fix: re-export intended hooks from `/shell` or update docs/comments
  and add built-package import tests.

### Low

1. Settings segmented controls expose no selected state to assistive tech

- Evidence: `src/shell/SettingsSlot.tsx:72` changes only visual styles
  for active segmented buttons.
- Impact: screen reader users cannot tell which theme or density option
  is selected.
- Fix: use the existing `ToggleGroup` primitive or add grouped semantics
  and `aria-pressed`.

1. Field errors are not associated with their inputs

- Evidence: `src/primitives/Field.tsx:23` renders an alert span without
  a stable id or input `aria-describedby`/`aria-invalid` wiring.
- Impact: focused invalid controls are not programmatically tied to the
  error message.
- Fix: generate/accept an error id and provide a way to wire
  described-by/invalid state, or document consumer requirements.

1. Shell string used for git status path

- Evidence: `scripts/sync-design-system.mjs:47` interpolates a
  filesystem path into an `execSync` shell string.
- Impact: unusual checkout paths containing shell metacharacters can
  break the guard or execute unintended shell syntax.
- Fix: use
  `execFileSync('git', ['status', '--porcelain', docsDesignSystemDir], ...)`.

1. Story coverage gate exempts exported public worklist components

- Evidence: `tests/storybook/coverage.test.ts:50` whitelists
  `LineList.tsx` and `PageList.tsx` as internals, but
  `src/worklist/index.ts:30` exports them publicly.
- Impact: public components can regress visually or ergonomically while
  the coverage gate passes.
- Fix: add stories for `LineList` and `PageList`, or remove them from
  the public barrel if not public API.
