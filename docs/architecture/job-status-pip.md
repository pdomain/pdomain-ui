---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Job status pip

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** rendering backend job lifecycle state or changing the shared job-status contract.
- **Search terms:** JobStatusPip, JobState, succeeded, job status testid, pip tokens.

## Current design

`JobStatusPip` renders a generated `JobState` value as a colored dot and label.
The canonical states are `queued`, `running`, `succeeded`, `failed`, and
`cancelled`. Code uses `succeeded`. A consumer can pass a friendlier `label`,
such as `Done`, without changing the backend state.

The state colors are `--ink-3`, `--ocr`, `--exact`, `--mismatch`, and `--fuzzy`
in the same order. The running state also uses the shared `pip--running`
animation. Assistive technology cannot access the decorative dot because the
text label conveys the state.

The component remains separate from `StatusPip` because job lifecycle and match
quality use unrelated state types. The default test id is
`job-status-pip-{state}`. Standard HTML attributes, styles, classes, and a ref
pass through to the root element.

## Durable decisions

- Derive `JobState` from the generated OCR operations schema. Do not introduce
  a consumer-side `done` alias.
- Keep display wording in the consuming app through the optional `label` prop.
- Keep animation in the shared theme rather than JavaScript.
- Keep job lifecycle separate from match-quality status.

## Evidence

- Code: `src/primitives/JobStatusPip.tsx`, `src/types/job-state.ts`
- Tests: `src/primitives/JobStatusPip.test.tsx` — all five token mappings,
  running animation class, default/custom labels, class merging, and ref forwarding
- Commits: `dee027951f591ae10f1df7ecc21f4c34d6bf94dc` (component),
  `780c950b81e9f065dc40aabd5c2b8f8f5d69a6de` (generated `JobState` integration)
- Verified: 2026-07-13 by repository code, tests, history, and docgraph migration analysis
