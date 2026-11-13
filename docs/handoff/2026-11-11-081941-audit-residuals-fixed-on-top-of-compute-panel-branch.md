---
kind: handoff
status: retired
created: "2026-11-11"
created_at: "2026-11-11T08:19:41Z"
owner: "CT"
branch: "night-audit-residuals"
scope: "audit-residuals"
worktree: "/mnt/work/projects/pdomain/pdomain-ui/.claude/worktrees/audit-residuals"
base_commit: "36fe81d586b71ca40c689757362ea213a13cefdd"
supersedes: "../context/decisions.md#2026-11-13--retired-implemented-field-contract-and-superseded-handoffs"
last_verified: 2026-11-13
handoff_reason: "stopping"
host: "claude-code"
---

# Audit residuals fixed on top of the compute panel branch

> Retired on 2026-11-12. `night-audit-residuals` merged to local master, including `worktree-fix-compute-panel-and-dep-updater` (`ab0170d` through `3ca2679`). The resume step to merge is done.

Reference repair on 2026-11-13: the former supersedes value was
`2026-11-11-043304-compute-panel-and-updater-ready-for-merge-review.md`.
That intermediate handoff was deleted after its outcomes were captured in
architecture and the [retirement tombstone](../context/decisions.md#2026-11-13--retired-implemented-field-contract-and-superseded-handoffs).
The dated handoff evidence and retired status below remain unchanged.

## Goal

Fix the audit residuals in `docs/context/current-state.md` that need no owner
decision: the CropCard empty-overlay guard, the CoverPlaceholder inline RGBA
values, and lint suppressions without a local rationale. Leave the
LabelerCanvas mutation API and live-theme repaint alone.

This branch was cut from the unmerged `worktree-fix-compute-panel-and-dep-updater`
branch at `d0962b5`, so it carries that branch's five commits too. This handoff
supersedes that branch's handoff; its open items are repeated below.

## Done

- `70927e3` CropCard passes the bottom-left overlay only when a page has flags.
  Test first: three density cases failed, then passed.
- `c380728` CoverPlaceholder uses new theme-invariant tokens `--cover-ink` and
  `--shadow-cover-inset`, defined in `:root` of `theme/tokens.css` with the old
  values. Test first: the inline-RGBA test failed, then passed.
- `159d64a` Removed five suppressions with real fixes: typed props instead of
  `any` in `src/icons/Icon.tsx`, `src/icons/Icons.stories.tsx` and
  `src/primitives/Accordion.test.tsx`; `Object.assign` in `tests/setup.ts`;
  a memoized `optionId` in `src/worklist/VirtualizedList.tsx`. Added an ESLint
  `-- reason` description to every directive with no nearby explanation.
  Closed the `PageImageCanvas` tabindex block at the end of the component.
  `docs/process/lint-deviations.md` now matches the source.
- `36fe81d` Docs: residuals removed from `docs/README.md`,
  `docs/context/intent-map.md` and `docs/context/current-state.md`;
  `docs/architecture/theme-and-component-quality.md` records the fixes.
- `make ci AI=1` exited 0, read from make's own status, not a pipe: 2,920 unit
  tests, 279 package tests, one known `react-hooks/incompatible-library` lint
  warning. Theme comparison skipped because no design-system mirror exists.
  Log: `/mnt/work/pdt/ui2/ci.log`; status: `/mnt/work/pdt/ui2/ci.rc`.
- `docgraph check` passed with two advisories: separate `CODEX.md` guidance and
  an orphaned archived handoff.

## Not done

- LabelerCanvas mutation API and live-theme repaint: skipped, owner decision.
- Nothing merged, pushed, tagged or released.
- From the predecessor: `shfmt` is not installed, so updater formatting is
  unchecked; codegen pins remain `pdomain-book-tools` 0.28.0 and `pdomain-ops`
  0.11.2.

## Failed approaches

- The shared git hook points at a container interpreter. Commits here ran with
  the main checkout's `.venv/bin` on `PATH`; `uv run git commit` also works.
  Do not skip the hook.
- gitlint limits the subject to 72 characters; one commit attempt failed on it.

## Decisions

- The cover tokens live only in `:root`, because the cover slab is dark in both
  themes and light inherits them.
- `theme/tokens.css` was already outside Prettier style; it is not in the
  format gate, so it was not reformatted.
- `docs/context/decisions.md` is append-only, so its historical mentions of the
  residuals were left as they are.

## Owner decisions needed

- Whether to merge `worktree-fix-compute-panel-and-dep-updater` and then this
  branch to master. Merging this branch also merges the compute panel work.
- Whether LabelerCanvas should implement drag-to-create and handle moves, and
  whether mounted Konva canvases must repaint on a live theme change.
- Whether to bump the codegen pins with `make update-pdomain-deps`.
- Whether to keep `CODEX.md` as separate guidance or consolidate it.

## State

Nine commits ahead of master before this handoff commit, clean tree. All work
ran on CPU with `CUDA_VISIBLE_DEVICES` empty. Set `TMPDIR` to
`/mnt/work/pdt/ui2` before running gates, because `/tmp` has a small quota.

## Pointers

- `docs/context/current-state.md`
- `docs/process/lint-deviations.md`
- `docs/architecture/theme-and-component-quality.md`
- `src/stages/Crop/CropCard.tsx`
- `src/templates/PipelineTemplate.tsx`
- `theme/tokens.css`

## Resume steps

1. Review with `git log master..night-audit-residuals` when the owner asks.
2. If master has moved, rebase onto it and rerun `make ci AI=1` and
   `docgraph check`.
3. Merge only when the owner asks.
