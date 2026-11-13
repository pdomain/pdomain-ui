---
kind: process
status: active
owner: CT
created: 2026-05-21
last_verified: 2026-11-10
verified_against:
  - "justfile"
  - "package.json"
  - ".pre-commit-config.yaml"
  - "eslint.config.js"
  - "CONVENTIONS.md"
  - "DOCGRAPH.md"
---

<!-- >>> shared-devtools:writing-docs (managed; overwritten on reinstall) -->
## Readable output (writing-docs)

When you write reader-facing prose such as a summary, finding, plan, or explanation, draft it to the readability standard:

- Lead with the answer. The first sentence says what happened or what you found.
- Give each paragraph one idea, and lead the paragraph with it.
- Make each heading name its content, not a generic label.
- Keep sentences short and active. Prefer the common word over the jargon.
- Preserve every fact. Never drop a number, name, or condition for a smoother sentence.

This is the drafting default, not a separate step. It does not apply inside code, diagrams, citation identifiers, or the frontmatter and metadata blocks a tool parses; and it leaves a heading that is a link target or tool-parsed section name as written, since renaming it can break the anchor. For the full standard, see the writing-docs readability rule. To rewrite a file or draft you already have, use the edit-for-readability skill.
<!-- <<< shared-devtools:writing-docs -->

# Agent guidance

## Agent Index

- **Kind:** process
- **Status:** active
- **Read when:** starting agent work in this repository.
- **Search terms:** agent guidance, workflow, conventions, docgraph.

Read these repository rules before working:

- `AGENTS.md` is the canonical agent context. `CLAUDE.md` is a compatibility
  symlink to this file.
- [CONVENTIONS.md](CONVENTIONS.md) defines repository-wide coding and documentation conventions.
- [DOCGRAPH.md](DOCGRAPH.md) defines documentation retrieval, lifecycle, context, and write safety.

These files are authoritative for their respective scopes.

# Repository workflow — pdomain-ui

TypeScript / React / Vite shared component library for the pdomain-* suite. Publishes
`@pdomain/pdomain-ui` to the self-hosted `pdomain-index-npm` registry.

Docs: [`docs/README.md`](docs/README.md)

## Commands

| recipe | does |
|---|---|
| `just install` | `pnpm install --frozen-lockfile` |
| `just lint` | fix ESLint findings with `eslint . --fix` |
| `just lint-check` | read-only `eslint . --max-warnings 0` |
| `just typecheck` | `tsc --noEmit` |
| `just test` | Vitest (jsdom) |
| `just build` | Vite library build → `dist/` |
| `just format` | apply Prettier to `src/` + `tests/` |
| `just format-check` | check Prettier formatting without writing |
| `just pre-commit-check` | `uv run pre-commit run --all-files` |
| `just install-hooks` | (re)install the pre-commit and commit-msg git hooks |
| `just upgrade-deps` | `pnpm update --latest` |
| `just frontend-build` | alias for `build` |
| `just frontend-install` | alias for `install` |
| `just frontend-dev` | Vite dev server |
| `just frontend-test` | alias for `test` |
| `just frontend-lint` | alias for `lint` |
| `just frontend-format` | alias for `format` |
| `just frontend-format-check` | alias for `format-check` |
| `just frontend-knip` | knip dead-export scan |
| `just release-patch` | bump patch version, ci, commit, tag, push |
| `just release-minor` | bump minor version, ci, commit, tag, push |
| `just release-major` | bump major version, ci, commit, tag, push |
| `just codegen` | fetch pinned wheels → emit JSON Schema → generate TS types |
| `just codegen-check` | runs codegen and fails if output differs |
| `just update-pdomain-deps` | bump codegen pins to the registry's latest wheels, run codegen, and stage the diff |
| `AI=1 just ci` | install + lint/format/type/Python checks + unit tests + build + package tests + codegen + theme + knip + strict docgraph |

`just ci` is the default gate. It runs `install`, `lint-check`,
`format-check`, `typecheck`, `py-static-check`, `test-unit`, `build`,
`test-package`, `codegen-check`, `theme-check`, `knip`, and
`docgraph check --strict`, in that order.

Prefix any public recipe with `AI=1` to capture its full output in
`.ci-ai.log`. Success prints one pass line; failure prints the result and
the log tail. Use `AI=1 just ci`, not a trailing Make variable assignment.

`pre-commit-check` runs the configured hooks on all files. Those hooks cover
Python, shared file checks, Markdown, and secrets. Frontend checks run through
their own just recipes in `ci`.

## Hard constraints

- **No CVA** (`class-variance-authority` is banned via ESLint `no-restricted-imports`).
  Variants are CSS class modifiers on design-system primitives (`.btn.primary`, etc.).
- **No hex literals** in component styles. All colors are `var(--token)` references.
- **No direct `lucide-react` imports** outside `src/icons/`. Apps import icons only
  from `@pdomain/pdomain-ui/icons`. Rule enforced by ESLint.
- **Stores are factories**, not singletons. Every store is a `create<Name>Store()`
  function returning a fresh Zustand store; apps instantiate per-AppShell.
- **Strict TypeScript**: `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Deploy-mode-agnostic**: pdomain-ui never branches on hosted-vs-local inside components.
  Only `<AppShell deployMode>` changes wording/visibility. All real mode logic lives
  in pdomain-ops adapters.
- **Port-not-copy**: when porting from labeler-spa, read the source once, design the
  slot-based API surface, then port. Do not verbatim-copy labeler-specific logic.

## Codegen

When bumping `pdomain-book-tools` or `pdomain-ops` in `codegen.versions.json`:

1. Run `just codegen` (fetches wheels → emits JSON Schema → generates TS types).
2. Commit both `codegen.versions.json` and the regenerated `src/types/generated/` in the same PR.

## Rules

- Always run `AI=1 just ci` before committing.
- Just recipes first; fall back to direct `pnpm exec` only when no recipe exists.
- Specs are the source of truth. Code that disagrees with a spec is wrong — change the spec first.
- Radix UI is only used for the behavior-heavy primitives listed in spec §4.
- `theme/tokens.css` and `theme/primitives.css` are the runtime source-of-truth; edited here,
  synced back to the workspace `../docs/design-system/` via `scripts/sync-design-system.mjs`.

## Sibling repos

- `../pdomain-book-tools/` — upstream dependency; its `schemas.emit` drives M4 codegen.
- `../pdomain-ocr-labeler-spa/` — primary source-of-truth for component ports (canvas, worklist, shell).
- `../pdomain-prep-for-pgdp/` — secondary consumer reference.
- `../pdomain-ops/` — GPU dispatch + suite-prefs routes (wired in Phase 2).

## GH issues

Cross-cut work tasks are tracked as GH issues in
**`ConcaveTrillion/ocr-container-meta`** (not in this repo's own tracker).
Plans under `docs/plans/` in the workspace root are synced there
via `/decompose-spec --sync`. Milestone naming: `spec: <plan-basename> (#N)`.

Pdomain-ui-specific issues migrated into `docs/issues/` on 2026-07-15;
see `docs/context/decisions.md`. Use the commands below only for cross-cut
issues that still live in the meta-tracker.

When shipping a cross-cut plan task:

- Before starting: `gh issue view <N> --repo ConcaveTrillion/ocr-container-meta`
- After completing: `gh issue close <N> --repo ConcaveTrillion/ocr-container-meta`
- List open tasks:
  `gh issue list --repo ConcaveTrillion/ocr-container-meta --milestone "spec: <name> (#N)" --state open`

## docs/ folder

This repo follows the workspace docs/ template — see [`docs/README.md`](docs/README.md). Active
folders: `architecture/`, `decisions/`, `plans/`, `process/`, `research/`,
`runbooks/`, `specs/`, `templates/`, and `usage/`.

**Superpowers redirect.** When a superpowers skill (e.g. `brainstorming`,
`writing-plans`) instructs you to save to `docs/superpowers/specs/<file>.md`
or `docs/superpowers/plans/<file>.md`, save to `docs/specs/<file>.md` or
`docs/plans/<file>.md` instead. There is no `docs/superpowers/` subdirectory
in this repo.

<!-- workspace-process:start -->

## Before coding

These steps are workspace defaults for any coding task. **User-level settings
override them** — a user's own `~/.claude/CLAUDE.md`, `settings.json`, or a
direct instruction in the conversation takes precedence and may waive or
change any step below.

### Working principles

- **Use skills.** Invoke the relevant superpowers skill before starting —
  process skills first (`brainstorming`, `systematic-debugging`,
  `writing-plans`, `test-driven-development`), then implementation skills.
  If a skill applies, using it is not optional.
- **Write clearly.** Route new durable reader-facing prose through
  `writing-docs:write-readably`. Route edits of existing prose through
  `writing-docs:edit-for-readability`.
- **Delegate by default.** Dispatch subagents for non-trivial work: per-repo
  agents for repo changes, `Explore` for code searches. This keeps large tool
  output out of the parent context.
- **Parallelize.** Run independent tasks as concurrent subagents — multiple
  agent calls in a single message. Set `model: sonnet` on implementers and
  reviewers.

### Steps

1. **Check the working tree.** `git status --short`. Surface or resolve stray
   uncommitted work before starting — don't build on it.
2. **Read repo guidance.** This repo's `CLAUDE.md` and `CONVENTIONS.md` for
   repo-specific rules.
3. **Consult `docs/` for authoritative context** (whichever folders exist):
   `plans/` (the work plan), `specs/` (design specs — follow any `Spec:`
   pointer from the issue), `research/` (prior investigations), `decisions/`
   (ADRs / constraints), `architecture/` (shipped design).
4. **Check live issue status.** `gh issue view <N> --repo <owner/repo>` —
   confirm it isn't already closed; note its milestone.
5. **Check for in-flight work.** Open PRs and existing branches touching the
   same area, to avoid colliding with work-in-progress.
6. **Consult agent memory.** `.claude/agent-memory/<repo>/feedback_*.md` for
   corrections not yet promoted to `CONVENTIONS.md`.
7. **Locate code with `Explore` first.** Use an `Explore` subagent to find
   relevant files before broad `Read`/grep.
8. **Isolate in a worktree.** Never work directly in the interactive checkout
   at `/workspaces/ocr-container/<repo>/`. Use the `using-git-worktrees` skill
   to set up an isolated worktree. When delegating to a full-power
   implementation agent, pass `isolation: "worktree"` on the `Agent` call
   (skip for `-docs` agents and the `driver` agent). When an agent returns a
   worktree path + branch, use the `finishing-a-development-branch` skill to
   decide how to integrate.
9. **TDD.** Write the failing test first where the plan calls for it.
10. **Verify before committing.** Focused verification plus `just ci`.
11. **Commit locally; do not push** without explicit say-so.

<!-- workspace-process:end -->

<!-- >>> repo-setup:repo-facts sha256:5ee52748eed2750ca623ff89cd515cebfb644ee780e55d413119876ed4f39db5 -->
## Repository facts

- Stack: TypeScript, React, and Vite; package manager: pnpm.
- Purpose: shared component library published as `@pdomain/pdomain-ui`.
- Main implementation: `src/`; tests: `tests/`; reader-facing documentation: `docs/`.
- Primary gates and workflow live in the human-owned guidance above.
<!-- <<< repo-setup:repo-facts -->

<!-- >>> repo-setup:commands-and-gates sha256:9aeb7ef0ecad17d14dac24c6b048062f7b83c4be0f869309d20c193044d0cd39 -->
## Approved commands and gates

- `just test` runs the repository test target.
- `just lint` runs the repository lint target.
- `npm test` is the allowed JavaScript test-command family.
<!-- <<< repo-setup:commands-and-gates -->

<!-- >>> repo-setup:writing-and-review sha256:8e845c41ba1dec9c4229ccfc0f9270bd0cd5699336c0fc6677f2f7059b42f93a -->
## Writing and review routing

- Route new durable reader-facing documents through the `writing-docs:write-readably` skill.
- Route edits of existing prose through the `writing-docs:edit-for-readability` skill.
- Follow the consuming plugin’s policy when using `adversarial-review`.
<!-- <<< repo-setup:writing-and-review -->
