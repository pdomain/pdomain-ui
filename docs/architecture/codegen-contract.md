---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Generated type contract

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** changing schema inputs, generated TypeScript, codegen pins, or
  the package contract.
- **Search terms:** codegen, JSON Schema, generated types, wheel pins,
  codegen versions.

## Current behavior

`codegen.versions.json` pins released `pdomain-book-tools` and `pdomain-ops`
wheels by version and SHA-256. `scripts/codegen-fetch.mjs` verifies and installs
those wheels into an isolated `.codegen/venv`. The temporary environment does
not make either Python package a runtime dependency of pdomain-ui.

`scripts/codegen-emit.mjs` invokes each installed package's `schemas.emit`
entry point. It writes JSON Schema under `.codegen/`. The package-specific
schema emitters own the source model selection; pdomain-ui does not reconstruct
Python model shapes by hand.

`scripts/codegen-tsgen.mjs` converts both schemas into
`src/types/generated/book-tools.ts` and `src/types/generated/ocr-ops.ts`.
`src/types/index.ts` is the stable TypeScript import surface. Generated files
are committed artifacts and must not be edited directly.

## Contract boundaries

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
hash-verifies their wheels. Later Page and PageRecord ownership changes are
therefore inherited from the upstream schema emitters instead of duplicated in
this repository.

## Verification and updates

`make codegen` runs fetch, emit, and TypeScript generation. `make codegen-check`
reruns the pipeline and fails when committed generated output differs. The full
`make ci AI=1` gate includes `codegen-check` and package-contract tests.

`make update-pdomain-deps` updates codegen pins, regenerates the outputs, and
stages the pin and generated-file diff for review. It does not commit or push.

## Evidence

- `codegen.versions.json`
- `scripts/codegen-fetch.mjs`
- `scripts/codegen-emit.mjs`
- `scripts/codegen-tsgen.mjs`
- `src/types/generated/` and `src/types/index.ts`
- `tests/codegen/`
- `Makefile` and `package.json`
