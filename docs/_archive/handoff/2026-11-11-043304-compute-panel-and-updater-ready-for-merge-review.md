---
kind: archive
status: retired
created_at: "2026-11-11T04:33:04Z"
owner: "CT"
branch: "worktree-fix-compute-panel-and-dep-updater"
scope: "compute-panel-dep-updater"
worktree: "/mnt/work/projects/pdomain/pdomain-ui/.claude/worktrees/fix-compute-panel-and-dep-updater"
base_commit: "46bfbe63a6afc392ad2c7dbbaa7d6f718ab3f822"
supersedes: "2026-11-11-032240-compute-panel-and-updater-fixes-docs-staged.md"
handoff_reason: "stopping"
host: "claude-code"
created: "2026-11-11"
last_verified: "2026-11-11"
---

# Compute panel and updater fixes, ready for merge review

> **Retired — superseded by `docs/handoff/2026-11-11-081941-audit-residuals-fixed-on-top-of-compute-panel-branch.md`.**

## Goal

Show friendly active device labels, stop `ComputeTargetPanel` gating on `info.mode`, and make `make update-pdomain-deps` parse object-form pins.

## Done

- Friendly active device labels (`ab0170d`).
- The panel hides on an empty device list, not on deploy mode (`d5d017e`).
- The updater handles object-form pins and swaps the wheel hash (`86c169e`).
- The doc retirement is committed (`46bfbe6`): eleven files, including deleting the active-device issue, plan and spec. Checked against the `doc-retirer` rules with no edits needed. The only remaining mentions of the deleted paths are plain text in `docs/context/decisions.md`.
- `make ci AI=1` exited 0 on the staged docs, read from the recorded status and not a pipe. It ran 2,915 unit tests and 279 package tests, all passing, matching `docs/context/current-state.md`. Lint reported the one known `react-hooks/incompatible-library` warning. The theme comparison skipped because the worktree has no adjacent design-system mirror.
- `docgraph check --strict` exited 0 before the commit, with one advisory about separate guidance in `CODEX.md`.
- The commit passed the pre-commit and commit-msg hooks through `uv run git commit`.

## Not done

- The branch is not merged. Merging needs the owner's request.
- `shfmt` is not installed, so updater formatting is still unchecked. ShellCheck was clean in the earlier session and was not rerun here.
- Codegen pins were left alone: `pdomain-book-tools` 0.28.0 and `pdomain-ops` 0.11.2, while the index listed 0.30.1 and 0.12.0 on 2026-11-10.
- The chord sequences plan stays out of scope because it waits for a named consumer.

## Failed approaches

- The installed git hook points at an old container's interpreter and cannot find `pre-commit`. Commit through `uv run git commit`. Do not skip the hook.

## Decisions

- `ComputeTargetPanel` renders reported devices regardless of `info.mode`, and renders nothing when no devices are reported.

## Owner decisions needed

- Whether and when to merge this branch to master.
- Whether to bump the codegen pins with `make update-pdomain-deps`.
- Whether to keep `CODEX.md` as separate guidance or consolidate it, as the docgraph advisory asks.

## State

Five commits ahead of master before this handoff commit, with a clean tree. Nothing was pushed, merged, tagged, released or deployed. All work ran on CPU with the GPU hidden. The CI log and its exit status are under `/mnt/work/projects/pdomain/.artifacts/night-20261110/tmp/ui/`, in `make-ci-1.log` and `make-ci-1.log.status`. `/tmp` has a small quota, so set `TMPDIR` to the work drive before running gates.

## Pointers

- `docs/context/current-state.md`
- `docs/context/decisions.md`
- `docs/architecture/canvas-and-shell-extension-points.md`
- `docs/architecture/codegen-contract.md`
- `scripts/update-pdomain-deps.sh`
- `src/shell/ComputeTargetPanel.tsx`

## Resume steps

1. Review the branch with `git log master..HEAD` when the owner asks.
2. If master has moved, rebase or merge it in and rerun `make ci AI=1` and `docgraph check --strict`.
3. Merge when the owner asks.
