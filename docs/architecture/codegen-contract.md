---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-11-07
verified_against:
  - "codegen.versions.json"
  - "scripts/codegen-fetch.mjs"
  - "scripts/codegen-emit.mjs"
  - "scripts/codegen-tsgen.mjs"
  - "scripts/update-pdomain-deps.sh"
  - "Makefile"
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
and installs them into an isolated `.codegen/venv`. This temporary environment
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

## Make targets reproduce and update generated output

`make codegen` runs fetch, emit, and TypeScript generation. `make codegen-check`
reruns the pipeline and fails when committed generated output differs. The full
`make ci AI=1` gate includes `codegen-check` and package-contract tests.

`make update-pdomain-deps` is intended to update codegen pins, regenerate the
outputs, and stage the pin and generated-file diff for review without committing
or pushing. The current script does not support the object-form pins now stored
in `codegen.versions.json`: it prints the whole object as the current version
and passes that value to `packaging.version.Version`. The updater needs repair
before this command can perform the documented refresh.

## Codegen files and tests provide the evidence

- `codegen.versions.json`
- `scripts/codegen-fetch.mjs`
- `scripts/codegen-emit.mjs`
- `scripts/codegen-tsgen.mjs`
- `src/types/generated/` and `src/types/index.ts`
- `tests/codegen/`
- `Makefile` and `package.json`
