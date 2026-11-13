---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-11-10
verified_against:
  - "codegen.versions.json"
  - "scripts/codegen-fetch.mjs"
  - "scripts/codegen-emit.mjs"
  - "scripts/codegen-tsgen.mjs"
  - "scripts/update-pdomain-deps.sh"
  - "justfile"
---

# Generated type contract

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** changing schema inputs, generated TypeScript, codegen pins, or
  the package contract.
- **Search terms:** codegen, JSON Schema, generated types, wheel pins,
  codegen versions.

## Pinned wheels generate committed TypeScript

`codegen.versions.json` pins released `pdomain-book-tools` and `pdomain-ops`
wheels by version and SHA-256. `scripts/codegen-fetch.mjs` verifies the wheels
and installs them into an isolated `.codegen/venv`. The pinned primary wheels
come from GitHub Release assets; the self-hosted pip index supplies transitive
dependencies. This temporary environment
does not make either Python package a runtime dependency of pdomain-ui.

`scripts/codegen-emit.mjs` invokes `pdomain_book_tools.schemas.emit` and
`pdomain_ops.schemas` through their package-specific entry points. It writes
JSON Schema under `.codegen/`. The package-specific schema emitters own the
source model selection; pdomain-ui does not reconstruct Python model shapes by hand.

`scripts/codegen-tsgen.mjs` converts both schemas into
`src/types/generated/book-tools.ts` and `src/types/generated/ocr-ops.ts`.
`src/types/index.ts` is the stable TypeScript import surface. Generated files
are committed artifacts and must not be edited directly.

## Upstream packages own their schema contracts

- `pdomain-book-tools` owns OCR content and review-model schemas.
- `pdomain-ops` owns suite, device, job, and operational schemas.
- `codegen.versions.json` records the exact upstream releases used to generate
  the committed output.
- `src/types/generated/` is reproducible output, not an independent source of
  truth.
- Consumers import published TypeScript types. They do not need Python or the
  codegen environment at runtime.

The original rollout described one foundation emitter and provisional model
surfaces. Current practice uses two independently pinned schema producers and
hash-verifies their wheels. This repository therefore inherits later Page and
PageRecord ownership changes from the upstream schema emitters instead of
duplicating them.

## Just recipes reproduce and update generated output

`just codegen` runs fetch, emit, and TypeScript generation. `just codegen-check`
reruns the pipeline and fails when committed generated output differs. The full
`AI=1 just ci` gate includes `codegen-check` and package-contract tests.

`just update-pdomain-deps` updates the codegen pins, regenerates the outputs, and
stages the pin and generated-file diff for review without committing or pushing.
For each package it takes the newest `py3-none-any` wheel on the index and records
that wheel's version and SHA-256. A newer release with no such wheel is ignored,
because `codegen-fetch.mjs` can only install that form. A newer selected wheel with no
listed hash stops the command. The command writes pins only after every package
lookup succeeds.

## Codegen files and tests provide the evidence

- `codegen.versions.json`
- `scripts/codegen-fetch.mjs`
- `scripts/codegen-emit.mjs`
- `scripts/codegen-tsgen.mjs`
- `src/types/generated/` and `src/types/index.ts`
- `tests/codegen/`, including `tests/codegen/update-pdomain-deps.test.ts`
- `justfile` and `package.json`
