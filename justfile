set shell := ["bash", "-eu", "-o", "pipefail", "-c"]
set positional-arguments

# Copy this wrapper and install-hooks with the shell setting to sibling justfiles.
[private]
_ai +args:
    #!/usr/bin/env bash
    set -euo pipefail
    if env AI= just --quiet "$@" > .ci-ai.log 2>&1; then
        printf 'PASS: %s\n' "$*"
    else
        result=$?
        printf 'FAIL: %s (exit %s)\n' "$*" "$result"
        if [[ -f scripts/ai_filter_log.py ]]; then
            uv run python scripts/ai_filter_log.py .ci-ai.log
        else
            tail -50 .ci-ai.log
        fi
        exit "$result"
    fi

install-hooks:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai install-hooks; fi
    if [[ -f .git ]]; then
        echo "hooks: worktree checkout - the canonical repo owns them, skipping"
    elif [[ -n "$(git config --get core.hooksPath || true)" ]]; then
        echo "hooks: core.hooksPath is set - leaving it alone, skipping"
    else
        uv run pre-commit install --hook-type pre-commit --hook-type commit-msg
    fi


export UV_LINK_MODE := env("UV_LINK_MODE", "symlink")

[private]
_pnpm +args:
    #!/usr/bin/env bash
    set -euo pipefail
    mise="$(command -v mise || printf '%s/.local/bin/mise' "$HOME")"
    if [[ -x "$mise" ]] && "$mise" current node >/dev/null 2>&1; then
        exec "$mise" exec -- pnpm "$@"
    elif command -v pnpm >/dev/null 2>&1; then
        exec pnpm "$@"
    else
        echo "No pnpm available. Run 'just mise-setup' or install pnpm." >&2
        exit 1
    fi

setup:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai setup; fi
    uv sync --locked --all-groups
    just --quiet install install-hooks

update-hooks:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai update-hooks; fi
    uv run pre-commit autoupdate --freeze

install:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai install; fi
    just --quiet _pnpm install --frozen-lockfile

lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai lint; fi
    just --quiet _pnpm exec eslint . --fix

lint-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai lint-check; fi
    just --quiet _pnpm exec eslint . --max-warnings 0

typecheck:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai typecheck; fi
    just --quiet _pnpm run typecheck

test-unit:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai test-unit; fi
    just --quiet _pnpm run test:unit

test-package:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai test-package; fi
    just --quiet _pnpm run test:package

build:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai build; fi
    just --quiet _pnpm run build

codegen:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai codegen; fi
    just --quiet _pnpm run codegen

codegen-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai codegen-check; fi
    just --quiet _pnpm run codegen:check

theme-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai theme-check; fi
    just --quiet _pnpm run codegen:theme-check

storybook:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai storybook; fi
    just --quiet _pnpm run storybook

storybook-build:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai storybook-build; fi
    just --quiet _pnpm run build-storybook

e2e-ci:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai e2e-ci; fi
    just --quiet _pnpm exec playwright test --reporter=html

format:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai format; fi
    just --quiet _pnpm run format

format-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai format-check; fi
    just --quiet _pnpm run format:check

knip:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai knip; fi
    just --quiet _pnpm run knip

frontend-dev:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-dev; fi
    just --quiet _pnpm exec vite dev

test:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai test; fi
    just --quiet test-unit

e2e:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai e2e; fi
    just --quiet storybook-build
    just --quiet _pnpm exec playwright test

py-lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai py-lint; fi
    uv run ruff check scripts

py-format:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai py-format; fi
    uv run ruff format scripts

py-format-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai py-format-check; fi
    uv run ruff format --check scripts

py-typecheck:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai py-typecheck; fi
    uv run basedpyright

py-static-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai py-static-check; fi
    just --quiet py-format-check py-lint py-typecheck

pre-commit-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai pre-commit-check; fi
    uv run pre-commit run --all-files

static-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai static-check; fi
    just --quiet lint-check typecheck py-static-check

[default]
ci:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai ci; fi
    just --quiet install lint-check format-check typecheck py-static-check test-unit build test-package codegen-check theme-check knip
    docgraph check --strict

ci-slow:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai ci-slow; fi
    just --quiet ci

upgrade-deps:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai upgrade-deps; fi
    for marker in "${UV_PROJECT_ENVIRONMENT:-.venv}/.pdomain-local-mode" "${UV_PROJECT_ENVIRONMENT:-.venv}/.pdomain-dev-local"; do
        if [[ -f "$marker" ]]; then
            echo "Refusing dependency upgrades while $marker exists" >&2
            exit 1
        fi
    done
    just --quiet _pnpm update --latest

update-pdomain-deps:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai update-pdomain-deps; fi
    for marker in "${UV_PROJECT_ENVIRONMENT:-.venv}/.pdomain-local-mode" "${UV_PROJECT_ENVIRONMENT:-.venv}/.pdomain-dev-local"; do
        if [[ -f "$marker" ]]; then
            echo "Refusing dependency upgrades while $marker exists" >&2
            exit 1
        fi
    done
    ./scripts/update-pdomain-deps.sh

release-patch:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai release-patch; fi
    BUMP=patch ./scripts/do-release.sh

release-minor:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai release-minor; fi
    BUMP=minor ./scripts/do-release.sh

release-major:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai release-major; fi
    BUMP=major ./scripts/do-release.sh

[private]
_do-release:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai _do-release; fi
    BUMP="${BUMP:-minor}" ./scripts/do-release.sh

frontend-install:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-install; fi
    just --quiet install

frontend-build:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-build; fi
    just --quiet build

frontend-test:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-test; fi
    just --quiet test

frontend-lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-lint; fi
    just --quiet lint

frontend-lint-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-lint-check; fi
    just --quiet lint-check

frontend-format:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-format; fi
    just --quiet format

frontend-format-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-format-check; fi
    just --quiet format-check

frontend-knip:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-knip; fi
    just --quiet knip

frontend-typecheck:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai frontend-typecheck; fi
    just --quiet typecheck

help:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai help; fi
    just --list

mise-download:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai mise-download; fi
    mise="$(command -v mise || printf '%s/.local/bin/mise' "$HOME")"
    workspace_root="$(cd .. && pwd)"
    if [ -x "$mise" ]; then \
        echo "mise already installed at $mise"; \
    else \
        echo "Downloading mise to $HOME/.local/bin/mise..."; \
        curl -fsSL https://mise.run | sh; \
        echo "mise downloaded. Run 'just mise-setup' next to install pinned tools."; \
    fi

mise-trust-worktrees:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai mise-trust-worktrees; fi
    mise="$(command -v mise || printf '%s/.local/bin/mise' "$HOME")"
    workspace_root="$(cd .. && pwd)"
    just --quiet mise-download
    echo "Trusting mise config roots for this repo and generated worktrees..."
    mkdir -p "$HOME/.config/mise/conf.d"
    printf '%s\n' \
        '[settings]' \
        'trusted_config_paths = [' \
        '    "'"$workspace_root"'",' \
        '    "/srv/bot-workspaces",' \
        ']' \
        > "$HOME/.config/mise/conf.d/ocr-container-worktrees.toml"
    echo "mise trust roots configured."

mise-setup:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai mise-setup; fi
    mise="$(command -v mise || printf '%s/.local/bin/mise' "$HOME")"
    workspace_root="$(cd .. && pwd)"
    just --quiet mise-download mise-trust-worktrees
    echo "Installing tools from mise.toml..."
    "$mise" install
    echo "mise tools installed."

mise-doctor:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "${AI:-}" ]]; then exec just --quiet _ai mise-doctor; fi
    mise="$(command -v mise || printf '%s/.local/bin/mise' "$HOME")"
    workspace_root="$(cd .. && pwd)"
    echo "-- mise binary --"
    if [ -x "$mise" ]; then \
        echo "  path: $mise"; \
        "$mise" current 2>/dev/null | sed 's/^/  /' || echo "  (no mise.toml resolved)"; \
    else \
        echo "  not installed (run 'just mise-setup')"; \
    fi
    echo "-- tools on PATH --"
    command -v node  >/dev/null 2>&1 && echo "  node:  $(node --version)"  || echo "  node:  not on PATH"
    command -v pnpm  >/dev/null 2>&1 && echo "  pnpm:  $(pnpm --version)"  || echo "  pnpm:  not on PATH"
