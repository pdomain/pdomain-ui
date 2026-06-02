# pdomain-ui — shared TS/React/Vite component library
# Usage: make <target> [AI=1]
#
# AI=1 captures verbose output to .ci-ai.log; stdout shows pass/fail.

.PHONY: setup install lint lint-check typecheck test test-unit test-package build codegen codegen-check theme-check storybook storybook-build ci e2e e2e-ci help \
        format format-check pre-commit-check static-check \
        upgrade-deps update-pdomain-deps \
        release-patch release-minor release-major _do-release \
        frontend-install frontend-build frontend-dev frontend-test frontend-lint \
        frontend-format frontend-format-check frontend-knip \
        mise-download mise-trust-worktrees mise-setup mise-doctor

LOG_FILE := .ci-ai.log
export UV_LINK_MODE ?= symlink

# Prefer mise exec so tool versions match mise.toml.
# Falls back to plain pnpm on PATH for contributors who manage Node themselves.
MISE := $(shell command -v mise 2>/dev/null || echo $$HOME/.local/bin/mise)
WORKSPACE_ROOT := $(abspath $(CURDIR)/..)
define _pnpm
	@if [ -x "$(MISE)" ] && "$(MISE)" current node >/dev/null 2>&1; then \
		"$(MISE)" exec -- pnpm $(1); \
	elif command -v pnpm >/dev/null 2>&1; then \
		pnpm $(1); \
	else \
		echo "No pnpm available. Run 'make mise-setup' or install pnpm."; exit 1; \
	fi
endef

ifdef AI
  LOG_FLAGS := 2>&1 | tee -a $(LOG_FILE)
  QUIET := @
else
  LOG_FLAGS :=
  QUIET :=
endif

help:
	@echo "Targets:"
	@echo "  setup                install project dependencies"
	@echo "  install              pnpm install --frozen-lockfile"
	@echo "  lint                 ESLint flat config"
	@echo "  lint-check           read-only format + ESLint checks"
	@echo "  typecheck            tsc --noEmit"
	@echo "  test                 vitest run"
	@echo "  test-unit            vitest unit/component suite, excluding dist/package contracts"
	@echo "  test-package         build/package contract tests"
	@echo "  build                vite library build"
	@echo "  format               apply Prettier to src/ and tests/"
	@echo "  format-check         check Prettier formatting without writing"
	@echo "  pre-commit-check     lint + typecheck + format-check (no pre-commit config)"
	@echo "  static-check         lint-check + typecheck"
	@echo "  upgrade-deps         pnpm update --latest"
	@echo "  update-pdomain-deps  Bump pdomain-* codegen inputs to registry latest; runs codegen; leaves diff staged"
	@echo "  codegen              fetch wheels + emit JSON + generate TS"
	@echo "  codegen-check        run codegen and check git diff"
	@echo "  storybook            start Storybook dev server"
	@echo "  storybook-build      build Storybook static site"
	@echo "  e2e                  build Storybook static site + run Playwright e2e tests"
	@echo "  e2e-ci               run Playwright e2e tests (assumes storybook-static exists)"
	@echo "  ci                   install + lint + format-check + typecheck + test + build + codegen-check"
	@echo ""
	@echo "  release-patch        bump patch, ci, commit, tag, push"
	@echo "  release-minor        bump minor, ci, commit, tag, push"
	@echo "  release-major        bump major, ci, commit, tag, push"
	@echo ""
	@echo "  frontend-install     alias for install"
	@echo "  frontend-build       alias for build"
	@echo "  frontend-dev         run Vite dev server"
	@echo "  frontend-test        alias for test"
	@echo "  frontend-lint        alias for lint"
	@echo "  frontend-format      alias for format"
	@echo "  frontend-format-check  alias for format-check"
	@echo "  frontend-knip        run knip dead-export scan"
	@echo ""
	@echo "  mise-download        Download the mise binary"
	@echo "  mise-trust-worktrees Trust generated worktree roots for mise"
	@echo "  mise-setup           Install pinned tools from mise.toml"
	@echo "  mise-doctor          Show resolved tool versions"

setup: install

install:
	$(call _pnpm,install --frozen-lockfile)

lint:
	$(call _pnpm,run lint)

lint-check: format-check lint

typecheck:
	$(call _pnpm,run typecheck)

test:
	$(call _pnpm,run test)

test-unit:
	$(call _pnpm,run test:unit)

test-package:
	$(call _pnpm,run test:package)

build:
	$(call _pnpm,run build)

codegen:
	$(call _pnpm,run codegen)

codegen-check:
	$(call _pnpm,run codegen:check)

theme-check:
	$(call _pnpm,run codegen:theme-check)

storybook:
	$(call _pnpm,run storybook)

storybook-build:
	$(call _pnpm,run build-storybook)

e2e: storybook-build
	$(call _pnpm,exec playwright test)

e2e-ci:
	$(call _pnpm,exec playwright test --reporter=html)

format:
	$(call _pnpm,run format)

format-check:
	$(call _pnpm,run format:check)

# No .pre-commit-config.yaml in this repo — alias for lint + typecheck + format-check.
pre-commit-check: lint typecheck format-check

static-check: lint-check typecheck

upgrade-deps:
	$(call _pnpm,update --latest)

update-pdomain-deps: ## Bump pdomain-* codegen inputs to registry latest; runs codegen; leaves diff staged
	@./scripts/update-pdomain-deps.sh

# ---------------------------------------------------------------------------
# Releases
# ---------------------------------------------------------------------------

release-patch:
	@$(MAKE) --no-print-directory _do-release BUMP=patch

release-minor:
	@$(MAKE) --no-print-directory _do-release BUMP=minor

release-major:
	@$(MAKE) --no-print-directory _do-release BUMP=major

# scripts/do-release.sh handles repo-state guards, runs the ci pre-flight,
# bumps package.json via `pnpm version --no-git-tag-version`, creates an
# annotated tag, and pushes main + tag to origin.
# Pass FORCE=1 to skip repo-state guards (pre-flight still runs).
# Pass SKIP_PUSH=1 to create the tag locally without pushing (dry-run).
_do-release:
	@BUMP=$(or $(BUMP),minor) ./scripts/do-release.sh

# ---------------------------------------------------------------------------
# Frontend-* aliases (pdomain-ui IS a frontend repo — bare targets are canonical)
# ---------------------------------------------------------------------------

frontend-install: install

frontend-build: build

frontend-dev:
	$(call _pnpm,exec vite dev)

frontend-test: test

frontend-lint: lint

frontend-format: format

frontend-format-check: format-check

frontend-knip:
	$(call _pnpm,run knip)

# Package contract tests (tests/pack, build.contract) validate the BUILT dist,
# so they must run after `build`. test-unit excludes them; test-package runs them.
ci: install static-check test-unit build test-package codegen-check theme-check

mise-download:
	@if [ -x "$(MISE)" ]; then \
		echo "mise already installed at $(MISE)"; \
	else \
		echo "Downloading mise to $$HOME/.local/bin/mise..."; \
		curl -fsSL https://mise.run | sh; \
		echo "mise downloaded. Run 'make mise-setup' next to install pinned tools."; \
	fi

mise-trust-worktrees: mise-download
	@echo "Trusting mise config roots for this repo and generated worktrees..."
	@mkdir -p "$$HOME/.config/mise/conf.d"
	@printf '%s\n' \
		'[settings]' \
		'trusted_config_paths = [' \
		'    "$(WORKSPACE_ROOT)",' \
		'    "/srv/bot-workspaces",' \
		']' \
		> "$$HOME/.config/mise/conf.d/ocr-container-worktrees.toml"
	@echo "mise trust roots configured."

mise-setup: mise-download mise-trust-worktrees
	@echo "Installing tools from mise.toml..."
	@"$(MISE)" install
	@echo "mise tools installed."

mise-doctor:
	@echo "-- mise binary --"
	@if [ -x "$(MISE)" ]; then \
		echo "  path: $(MISE)"; \
		"$(MISE)" current 2>/dev/null | sed 's/^/  /' || echo "  (no mise.toml resolved)"; \
	else \
		echo "  not installed (run 'make mise-setup')"; \
	fi
	@echo "-- tools on PATH --"
	@command -v node  >/dev/null 2>&1 && echo "  node:  $$(node --version)"  || echo "  node:  not on PATH"
	@command -v pnpm  >/dev/null 2>&1 && echo "  pnpm:  $$(pnpm --version)"  || echo "  pnpm:  not on PATH"
