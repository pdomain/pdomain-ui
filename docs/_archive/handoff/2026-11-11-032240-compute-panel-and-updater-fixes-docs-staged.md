---
kind: archive
status: retired
created_at: "2026-11-11T03:22:38Z"
owner: "CT"
branch: "worktree-fix-compute-panel-and-dep-updater"
scope: "compute-panel-dep-updater"
worktree: "/mnt/work/projects/pdomain/pdomain-ui/.claude/worktrees/fix-compute-panel-and-dep-updater"
base_commit: "86c169ecb6ea62a38ae14533932097c152dd48be"
handoff_reason: "user_requested"
host: "claude-code"
created: "2026-11-11"
last_verified: "2026-11-11"
---

# Compute panel and updater fixes, docs staged

> **Retired — superseded by `docs/handoff/2026-11-11-043304-compute-panel-and-updater-ready-for-merge-review.md`.**

## Goal

Show friendly active device labels, stop `ComputeTargetPanel` gating on `info.mode`, and make `make update-pdomain-deps` parse object-form pins.

## Done

- Friendly active device labels (`ab0170d`).
- The panel hides on an empty device list, not on deploy mode (`d5d017e`).
- The updater handles object-form pins and swaps the wheel hash (`86c169e`). A real run found book-tools 0.30.1 and ops 0.12.0, and that trial bump was discarded.

## Not done

- The doc retirement is staged but uncommitted: eleven files, including deleting the active-device issue, plan and spec and updating decisions, current-state and the intent map.
- No gate result is recorded for the staged docs.
- `shfmt` is not installed, so updater formatting went unchecked. ShellCheck is clean.
- The chord sequences plan was out of scope because it waits for a named consumer.

## Failed approaches

- The installed git hook points at an old container's interpreter and cannot find `pre-commit`. Commit through `uv run git commit`. Do not skip the hook.

## Decisions

- `ComputeTargetPanel` now renders reported devices regardless of `info.mode`, and renders nothing when no devices are reported.

## State

Three commits ahead of master, with eleven staged documentation changes in the index. The owner paused this work on 2026-11-10 and the session's herdr tab is closed. Nothing was pushed, merged, tagged, released or deployed. All work ran on CPU with the GPU hidden. The session's last terminal output is saved in `/mnt/work/projects/pdomain/.artifacts/handoff-20261110/session-output/`. `/tmp` is a shared tmpfs that ran out of quota several times on 2026-11-10 while ten sessions ran gates. If a gate fails with a quota error, point `TMPDIR` at the work drive and rerun before suspecting the code.

## Pointers

- `/mnt/work/projects/pdomain/.artifacts/handoff-20261110/ui-staged-docs.patch`
- `docs/context/current-state.md`
- `docs/architecture/codegen-contract.md`

## Resume steps

1. Read the staged diff and finish any partial retirement record.
2. Run `make ci AI=1` and strict docgraph.
3. Commit the staged docs through `uv run git commit`.
4. Review and merge when the owner asks.
