---
kind: spec
status: draft
owner: CT
created: 2026-07-16
last_verified: 2026-07-16
disposition: needs-owner-decision
---

# dep-refresh auto-land — design spec

**Date:** 2026-07-16
**Status:** Spec — not yet implemented
**Touches:** `.github/workflows/ci.yml`, `.github/workflows/dep-refresh.yml`, and the
`pdomain/pdomain-ui` repository merge settings.
**Related:** [release and CI pipeline](../architecture/release-and-ci-pipeline.md)

---

## 1. Goal

Make the weekly `dep-refresh` land itself when it is green and stop leaving stray
branches behind. A passing refresh should merge and delete its own branch with no
human action. A failing refresh should surface as a single reviewable pull request
and never accumulate.

This spec fixes the two defects that currently prevent that outcome.

---

## 2. Problem

The `dep-refresh` workflow already arms auto-merge (`gh pr merge --auto --rebase`),
yet four consecutive weekly pull requests (`#57`–`#60`) sat open until a human
batch-closed them on 2026-07-12, orphaning their branches. Two independent bugs
combine to produce this.

### Bug 1 — the required `unit-test` check is never produced

`master` branch protection requires four status contexts: `lint-check`,
`typecheck`, `unit-test`, and `build-package`. The `unit-test` context has
`app_id: null`, a leftover from before the test job was sharded.

CI (`ci.yml`) runs the unit tests as a 4-way matrix whose only reported checks are
`unit-test (1/4)` through `unit-test (4/4)`. Nothing reports a plain `unit-test`.
The required `unit-test` context therefore stays "expected" forever, so **no pull
request can satisfy the gate — not even a fully green one.** The same gap is why a
direct push to `master` reports "4 of 4 required status checks are expected."

Evidence: `gh api repos/pdomain/pdomain-ui/branches/master/protection` lists the
four contexts with `unit-test` at `app_id: null`; the check runs on the closed PR
head commits show `unit-test (1/4..4/4)` and no `unit-test`.

### Bug 2 — failing refreshes accumulate

Each run creates a fresh dated branch (`dep-refresh/<date>-<runid>`),
`delete_branch_on_merge` is `false`, and nothing cleans up a red pull request. So
red weeks pile up branch by branch. The four closed PRs were genuinely red — the
dependency bumps broke `lint-check`, `typecheck`, and the unit tests — which is
correct to block under "auto-land when green," but they had nowhere to go and
accumulated until a manual batch close.

---

## 3. Design

Three changes, each addressing one failure mode.

### A. Make `unit-test` a real check (`ci.yml`)

Rename the matrix job id to `unit-test-shards`. It keeps reporting
`unit-test (1/4)` … `unit-test (4/4)`.

Add an aggregation job named `unit-test` that declares `needs: [unit-test-shards]`
and succeeds only if every shard succeeds. Its single reported check is
`unit-test`, which maps to the existing required context.

No branch-protection edit is needed — the required contexts already name
`unit-test`. This unblocks auto-merge for green refreshes and unblocks normal pull
requests at the same time.

### B. One reusable branch (`dep-refresh.yml`)

Replace the dated branch name with a stable `dep-refresh` branch, force-pushed each
run from a fresh checkout of `master`. Open a pull request only when no open one
exists for the branch, then re-arm `gh pr merge --auto --rebase`.

At most one `dep-refresh` branch and one pull request exist at any time. A week
that stays red is overwritten by the next run's refresh rather than spawning a new
branch. The branch is always based on current `master` at push time, which
satisfies the `strict` up-to-date requirement.

Open-PR detection uses state, not mere existence, so a manually closed PR is
reopened cleanly:

```bash
BRANCH="dep-refresh"
OPEN_PR=$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number')
if [ -z "$OPEN_PR" ]; then
  gh pr create --title "chore: weekly dep refresh" --body "..." --base master --head "$BRANCH" --label dep-refresh
fi
gh pr merge "$BRANCH" --auto --rebase
```

### C. Enable delete-on-merge (repo setting)

Set `delete_branch_on_merge: true` on `pdomain/pdomain-ui`. A green auto-merge then
deletes the `dep-refresh` branch, and the next run recreates it from scratch.

---

## 4. Behavior after the change

- **Green refresh:** CI passes, the `unit-test` gate reports success, auto-merge
  rebases and merges, and delete-on-merge removes the branch. No human action.
- **Red refresh:** the pull request stays open with failing checks. Next week's run
  force-pushes the newer refresh onto the same branch and the same pull request;
  if it is green it auto-lands, otherwise it remains a single open PR for review.
- **No dated branches, no accumulation, at most one stray branch ever** (a manually
  closed PR whose branch the next run reclaims).

---

## 5. Rollout note

The `ci.yml` change must reach `master`, but the new `unit-test` check does not
exist until that change is merged — the first merge cannot satisfy its own new
gate. Land it with an admin bypass (the owner has admin; `enforce_admins` is off),
then normal and dep-refresh PRs gate on the real check from then on.

---

## 6. Alternatives rejected

- **Pin branch protection to the four shard names** (`unit-test (1/4)` …) instead
  of adding a gate job. Rejected: brittle — changing the shard count silently
  re-breaks the gate.
- **Keep dated branches and add a close-triggered cleanup workflow.** Rejected:
  more moving parts than a reusable branch, which makes accumulation structurally
  impossible rather than cleaning it up after the fact.

---

## 7. Acceptance criteria

- CI reports a check named exactly `unit-test` that fails if any unit-test shard
  fails and passes only when all shards pass.
- A green `dep-refresh` run merges without human action and its branch is deleted.
- A red `dep-refresh` run leaves exactly one open pull request and one branch; the
  next run reuses both.
- No run creates a second concurrent `dep-refresh` branch.

---

## 8. Out of scope

- Fixing any specific week's dependency breakage. "Auto-land when green" correctly
  leaves red refreshes for a human; this spec does not make red refreshes pass.
- Changing the refresh schedule, the set of upgraded dependencies, or the
  `DEP_REFRESH_TOKEN` credential model.

---

## Adversarial Review

**Review status:** Pending owner decision. The diagnosis is evidence-backed —
branch protection contexts, CI check-run names, and the closed PR history were read
directly from the GitHub API on 2026-07-16 — but the proposed `ci.yml` gate job,
reusable-branch flow, and `delete_branch_on_merge` change are unimplemented design
intent. They are not current behavior and must be validated before merge.
