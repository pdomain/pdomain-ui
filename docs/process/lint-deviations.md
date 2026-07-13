---
kind: process
status: active
owner: CT
created: 2026-05-22
last_verified: 2026-07-13
---

# Lint-rule Deviations — pdomain-ui

Standing suppressions and per-file rule overrides in this repo.
Each entry records: the rule, the tool, the file(s) affected, and
the justification. Update this file whenever a new suppression is added
or removed.

Reference implementation: `pdomain-book-tools/docs/conventions/lint-deviations.md`.

---

## 1. `@typescript-eslint/no-empty-object-type` — ESLint

**Files:**
- `src/primitives/Card.tsx` (line 4)
- `src/primitives/FieldRow.tsx` (line 4)
- `src/primitives/Textarea.tsx` (line 4)

**Suppression form:** `// eslint-disable-next-line @typescript-eslint/no-empty-object-type`

**Justification.** These primitive components declare a `Props` interface that
extends a native HTML attributes type (e.g. `React.HTMLAttributes<HTMLDivElement>`)
with no additional members. The empty-body interface is intentional: it gives
consumers a named export (`CardProps`, `FieldRowProps`, `TextareaProps`) they
can extend in their own code without importing the raw HTML attributes type.
The rule fires because the interface body is empty. Using `type Alias =
React.HTMLAttributes<…>` would also work, but the `interface` form is
consistent with every other component in this repo that adds props over time
(new members can be appended without changing the kind).

---

## 2. `react-hooks/exhaustive-deps` — ESLint

**Files:**
- `src/shell/AppShell.tsx` (line 88)
- `src/shell/SuiteSiblingsProvider.tsx` (line 48)
- `src/stores/useStageCall.ts` (line 85)

**Suppression form:** `// eslint-disable-next-line react-hooks/exhaustive-deps`

**Justifications per file:**

- **`AppShell.tsx` line 88** — `createUIPrefsStore(uiPrefsConfig)` is wrapped
  in `useMemo` with an empty dependency array intentionally: the store is
  created once per `AppShell` mount and must never be recreated on subsequent
  renders. Adding `uiPrefsConfig` to deps would destroy and recreate the store
  on every config-object identity change, losing in-flight preferences state.
  The pattern follows the Zustand "stable store per mount" convention
  (spec §4 key API conventions #3).

- **`SuiteSiblingsProvider.tsx` line 48** — The `useEffect` fetches the
  installed-apps list once on mount. `fetchInstalled` is a prop (callback
  reference) that callers are expected to stabilise with `useCallback`; adding
  it to deps would re-fetch on every render in callers that don't memoize the
  prop. The single-fetch-on-mount behaviour is the documented contract.

- **`useStageCall.ts` line 85** — The `run` callback is stabilised on
  `[stageId, pageId]` only. The internal `submit` callback passed at
  construction is captured by the closure on first call; this is intentional
  because `submit` is expected to be a stable reference (factory pattern).
  Adding `submit` would require every caller to memoize it, which conflicts
  with the public API contract.

---

## 3. `@typescript-eslint/no-explicit-any` — ESLint

**Files:**
- `src/worklist/hooks/useWorklistSort.ts` (line 32)
- `src/icons/Icons.stories.tsx` (line 50)

**Suppression form:** `// eslint-disable-next-line @typescript-eslint/no-explicit-any`

**Justifications per file:**

- **`useWorklistSort.ts` line 32** — The sort comparator receives items typed
  via a generic `TItem` that may or may not be a `WordListItem`. The
  `sortKey` branches narrow which fields are accessed, but TypeScript cannot
  narrow a generic through a comparator signature. The `any` cast is scoped to
  the sort comparator only; all access after the cast uses named typed fields
  with explicit local annotations (`const ca: number | null | undefined`).

- **`Icons.stories.tsx` line 50** — `AnyIconComponent` is a story-file
  utility type used to build an icon catalogue grid. All icon components in
  `src/icons/` are `React.ComponentType<React.SVGProps<SVGSVGElement>>` but
  the catalogue helper needs to accept both `lucide-react` re-exports (which
  are `ForwardRefExoticComponent`) and bespoke SVG components. Using `any`
  here avoids a lengthy union type in a story file that is never part of the
  published package.

---

## 4. `jsx-a11y/no-noninteractive-tabindex` — ESLint

**Files:**
- `src/canvas/PageImageCanvas.tsx` (line 207, block disable)

**Suppression form:** `/* eslint-disable jsx-a11y/no-noninteractive-tabindex */`

**Justification.** The `PageImageCanvas` wrapper div carries `role="img"` and
`tabIndex={0}`. The a11y rule fires because `role="img"` is not in the list
of interactive roles. However, the element **is** keyboard-interactive: it
receives focus to dispatch hotkeys (select/drag/zoom mode switching) that
the canvas responds to. This is the established pattern from
`pdomain-ocr-labeler-spa` and reflects real keyboard accessibility — without
`tabIndex` the canvas cannot receive keyboard focus at all. The `role="img"`
is kept because the element's primary semantic is "a visual canvas of page
image content"; the keyboard interaction is secondary.

---

## 5. `@typescript-eslint/prefer-promise-reject-errors` — ESLint

**Files:**
- `src/stores/useStageCall.test.ts` (line 42)

**Suppression form:** `// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors`

**Justification.** The test simulates a 503-like error object `{ status: 503,
retryAfter: 1000 }` to exercise the `useStageCall` warming-state logic. The
production code checks `error.status` on caught promise rejections (not
`error instanceof Error`). Wrapping the rejection in `new Error()` would
require stripping the `status` field, defeating the test's purpose. This
suppression is test-only and does not affect production code.

---

## 6. `no-restricted-imports` override — ESLint config

**File:** `eslint.config.js` (lines 38–45)

**Suppression form:** Per-file `rules: { 'no-restricted-imports': 'off' }`
scoped to `['src/icons/lucide.ts']`.

**Justification.** The workspace rule bans direct `lucide-react` imports
everywhere except the single boundary file `src/icons/lucide.ts`, which
re-exports only the curated icon subset. Turning the rule off for this one
file is the intentional exemption that makes the boundary-file pattern
possible. All other files in `src/` and `tests/` remain subject to the ban.
