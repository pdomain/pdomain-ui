---
kind: spec
status: implemented
owner: CT
created: 2026-05-21
last_verified: 2026-07-13
promotes_to: docs/architecture/job-status-pip.md
disposition: promote-then-retire
---

# JobStatusPip — component-API spec

**Date:** 2026-05-21
**Status:** Implemented — this spec documents the settled API and trainer-spa
conventions
**Subpath:** `@concavetrillion/pdomain-ui/primitives`
**Required by:** `pdomain-ocr-trainer-spa` RunDetailPage (run-state indicator),
RunsPage list
**Spec source:** `pdomain-ocr-trainer-spa/specs/03-frontend.md §6.3`

---

## 1. Purpose

A job-state pip that renders a colored dot + state label for the five
canonical `JobState` values. A job-aware variant of the existing pdomain-ui
`StatusPip`, driven by the same `JobState` type that `useLongJob` returns.

---

## 2. Props

```ts
interface JobStatusPipProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The job's current state.
   *
   * Type is derived from the pdomain-ocr-ops generated schema:
   *   "queued" | "running" | "succeeded" | "failed" | "cancelled"
   *
   * NOTE: the canonical terminal success state is "succeeded", NOT "done".
   * The task brief used "done" informally; the generated type is authoritative.
   * Trainer-spa and any other consumer must use "succeeded".
   */
  state: JobState;

  /**
   * Override the display label. Default: the state string itself.
   * Use when the app wants friendlier text (e.g. label="Complete" for
   * state="succeeded").
   */
  label?: string;
}
```

### State → visual mapping

| `state` | CSS token | CSS modifier | Default label |
|---|---|---|---|
| `queued` | `var(--ink-3)` | none | `queued` |
| `running` | `var(--ocr)` | `pip--running` | `running` |
| `succeeded` | `var(--exact)` | none | `succeeded` |
| `failed` | `var(--mismatch)` | none | `failed` |
| `cancelled` | `var(--fuzzy)` | none | `cancelled` |

`pip--running` adds a pulse animation (defined in `primitives.css`).

### Built-in testid

`JobStatusPip` emits `data-testid="job-status-pip-{state}"` automatically.
This is a **fixed, non-configurable testid** — it is always present
regardless of what other `data-testid` the consumer sets via `...props`.
The consumer may set an additional `data-testid` via spread; both will be
present only if the consumer explicitly overwrites.

---

## 3. `JobState` type

```ts
// src/types/job-state.ts
import type { components } from './generated/ocr-ops.js';
export type JobState = components['schemas']['JobStatus']['state'];
// = "queued" | "running" | "succeeded" | "failed" | "cancelled"
```

The type is generated from `pdomain-ocr-ops`'s OpenAPI schema via `pnpm codegen`.
Do not widen or alias it in consumer code — use `JobState` directly to stay
in sync with the backend contract.

---

## 4. "done" vs "succeeded" terminology

The task brief that requested this component used "done" as one of the
states. The canonical type is `"succeeded"`. Summary:

- **Use `"succeeded"`** in all code (TypeScript enforces this).
- **Use `"done"` as a display label** if the app's UX calls for it:
  ```tsx
  <JobStatusPip state="succeeded" label="Done" />
  ```
- Never create a wrapper type that maps `"done"` → `"succeeded"` — this
  obscures the backend contract and breaks discriminated-union exhaustiveness
  checks.

---

## 5. Relation to `StatusPip`

`StatusPip` covers match-quality states (`exact | fuzzy | mismatch | ocr | gt`)
and is used in the worklist components. `JobStatusPip` covers job-lifecycle
states and is used in run/job status displays. They share the `.pip` CSS class
and the same color-via-`color` technique but are separate components with
separate prop types.

Do not try to merge them into one component — their state enums are unrelated,
and merging would produce a prop soup or a discriminated union with no benefit.

---

## 6. Trainer-spa usage

```tsx
// RunsPage.tsx — status column in a runs table
import { JobStatusPip } from '@concavetrillion/pdomain-ui/primitives';
import type { JobState } from '@concavetrillion/pdomain-ui/types';

<JobStatusPip state={run.status as JobState} />

// RunDetailPage.tsx — header pip with friendly label
<JobStatusPip
  state={job.state}
  label={job.state === 'succeeded' ? 'Done' : job.state}
/>

// With Progress bar for running state
{job.state === 'running' && (
  <>
    <JobStatusPip state="running" />
    <Progress value={job.progress} max={job.total} />
  </>
)}
```

---

## 7. data-testid

The trainer-spa does not add a custom `data-testid` to `JobStatusPip` in
the current contract (`13-driver-contract.md`). The built-in
`job-status-pip-{state}` testid is sufficient for Playwright assertions.

---

## 8. Decisions

- **D-J1** Built-in `data-testid="job-status-pip-{state}"` is non-negotiable.
  It is part of the Playwright driver contract across all pd-* apps and must
  not be removed or made optional.
- **D-J2** The `label` prop defaults to the raw state string, not a
  humanized version. Apps that want "Queued" instead of "queued" set
  `label="Queued"`. pdomain-ui does not own display-string localization.
- **D-J3** `pip--running` animation is defined in `primitives.css` (not
  inline JS). This keeps animation under the design-system's control.

## Adversarial Review

- **Stage:** Post-implementation retirement review.
- **Sources:** Repository implementation and tests, commits
  `dee027951f591ae10f1df7ecc21f4c34d6bf94dc` and
  `780c950b81e9f065dc40aabd5c2b8f8f5d69a6de`, git history, and the 2026-07-13
  docgraph migration analyzer.
- **Accepted findings:** Implementation is proven. Durable current behavior
  belongs in `docs/architecture/job-status-pip.md` before this spec retires.
- **Residual risks:** The implementation spreads caller props after the default
  test id, so a caller can override it despite this spec describing it as
  non-configurable. The architecture document records the implementation as
  current truth; any stronger test-id contract needs a code change and test.
