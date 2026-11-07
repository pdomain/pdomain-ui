---
kind: process
status: active
owner: CT
created: 2026-05-22
last_verified: 2026-11-07
---

# Lint-rule deviations

This register lists every current ESLint suppression, ESLint configuration
exception, and Ruff ignore in pdomain-ui. It was checked against the source,
tests, `eslint.config.js`, and `pyproject.toml` on 2026-11-07. Update it with
the source whenever a deviation changes.

## Typed empty component props

`@typescript-eslint/no-empty-object-type` is suppressed in
`src/primitives/Card.tsx:4`, `src/primitives/FieldRow.tsx:4`, and
`src/primitives/Textarea.tsx:5`.

Each component exports a named props interface that extends its native HTML
attribute type but adds no members. The interface gives consumers a stable type
to extend. A type alias would work, but the interfaces match the component API.

## Deliberate `any` boundaries

`@typescript-eslint/no-explicit-any` is suppressed in:

- `src/icons/Icon.tsx:119`, where the icon map accepts React components with
  differing prop types.
- `src/icons/Icons.stories.tsx:85`, where the Storybook icon grid accepts both
  Lucide re-exports and bespoke SVG components.
- `src/primitives/Accordion.test.tsx:7`, where the helper accepts arbitrary
  trigger props for test setup.
- `tests/setup.ts:24`, where the PointerEvent polyfill is assigned through the
  global object.

These are narrow presentation or test boundaries. The first three lack a
source-level rationale beyond the surrounding code and should be reconsidered
when their types change. The test setup must write a global constructor, so its
cast remains local to that assignment.

## Deprecated and deferred API props

`@typescript-eslint/no-unused-vars` is suppressed for retained public props:

- `src/shell/AppHeader.tsx:70,72` and `src/shell/JobsPill.tsx:96,99,101` keep
  deprecated jobs-popover props for one release while ignoring them.
- `src/stages/Source/SourcePageWorkbench.tsx:104` keeps `beforeImageUrl` while
  split comparison remains follow-on work.
- `src/stages/Validation/CheckRow.tsx:56` keeps `lastRow`; CSS now supplies
  the last-row border behavior.
- `src/stages/Grayscale/StageControlsLeft.tsx:41` keeps `backend` while
  CPU-fallback wiring is deferred.

The retained props are compatibility surfaces. Remove their suppressions when
the props are removed or implemented.

## Hook dependency exceptions

`react-hooks/exhaustive-deps` is suppressed in:

- `src/shell/AppShell.tsx:122`, which creates a UI preferences store once per
  mount. Recreating it when `uiPrefsConfig` changes would discard in-flight
  state.
- `src/shell/SuiteSiblingsProvider.tsx:54`, which fetches installed apps once
  on mount.
- `src/stores/useUpdateCheck.ts:77`, which runs the initial check once for the
  non-manual policies.
- `src/hooks/ShortcutsContext.tsx:106,123`, which separates mount/unmount work
  from re-registering changed bindings.
- `src/worklist/VirtualizedList.tsx:128`, which suppresses dependency
  checking for its row-render callback. The callback calls the local `optionId`
  helper, whose output depends on `uid`; `uid` is already a dependency.

The first four locations explain their behavior in nearby comments or code.
`VirtualizedList` has no comparable source-level rationale for the suppression;
review whether the helper can be moved inside the callback when it changes.

## Hooks in Storybook render functions

`react-hooks/rules-of-hooks` is suppressed where a Storybook `render` function
owns local interactive state:

- `src/primitives/AttributesPanel.stories.tsx:79,108,110`
- `src/primitives/Segmented.stories.tsx:80`
- `src/stages/Grayscale/AdvancedParams.stories.tsx:57`
- `src/templates/SettingsNav.stories.tsx:40,62,92,114,145,177`
- `src/templates/TabsBand.stories.tsx:33,158`

Storybook calls these render functions outside a named React component. The
suppressed hooks supply only example-state behavior.

## Accessibility exceptions in production components

`jsx-a11y/no-noninteractive-tabindex` is suppressed in
`src/canvas/PageImageCanvas.tsx:292`. The canvas wrapper receives keyboard
focus for its hotkeys while retaining `role="img"` as its visual semantic.

The following blocks suppress `jsx-a11y/no-noninteractive-element-interactions`
and `jsx-a11y/no-noninteractive-tabindex`:

- `src/primitives/SlideOverPanel.tsx:182-207`, for the pinned dialog surface.
  The nearby comment identifies the ARIA dialog pattern that the rule does not
  recognize.
- `src/stages/HyphenJoin/HJDecisionCard.tsx:151-298`, for a grouped keyboard
  shortcut surface. Its comment records the Y/N/F/J/K bindings and why it does
  not use `role="application"`.

`jsx-a11y/no-static-element-interactions` and
`jsx-a11y/click-events-have-key-events` are suppressed for action-slot wrappers
in `src/primitives/AttributesPanel.tsx:85` and
`src/stages/Projects/ProjectsAttributesPanel.tsx:163`. Each wrapper stops a
child action from toggling the section. The elements themselves are not user
controls.

`jsx-a11y/interactive-supports-focus` is suppressed in
`src/stages/PageWorkbench/HierarchyTreePanel.tsx:197`. The container owns the
tree role while its treeitem children are focus targets, following the ARIA tree
pattern stated on the source line.

`jsx-a11y/no-autofocus` is suppressed in
`src/stages/PageWorkbench/AttrEditorPopover.tsx:109,125` so either edit control
receives focus when its popover opens. The lines have no further local
rationale and should be reviewed if focus behavior changes.

## Accessibility exceptions in Konva test mocks

`jsx-a11y/click-events-have-key-events` is disabled only while each Konva mock
renders a clickable `<div>`:

- `src/stages/Crop/BboxEditor.test.tsx:53-55`
- `src/stages/Grayscale/PageViewer.test.tsx:52-54`
- `src/stages/PageWorkbench/ArtifactViewer.test.tsx:56-68`
- `src/stages/PageWorkbench/ArtifactViewer.integration.test.tsx:51-63`
- `src/stages/PageWorkbench/LabelerCanvas.test.tsx:55-66`
- `src/stages/Source/SourcePageWorkbench.test.tsx:51-53`

`LabelerCanvas.test.tsx` also disables
`jsx-a11y/no-static-element-interactions` for the same mock. These test doubles
need click handlers but do not model keyboard behavior.

## Promise rejection shape in stage-call tests

`@typescript-eslint/prefer-promise-reject-errors` is suppressed in
`src/stores/useStageCall.test.ts:46,79,115,156,197,230`. Each test rejects with
an object carrying `status: 503` and, in most cases, `retryAfter`. The hook
reads those fields to exercise its warming and retry behavior. Replacing the
object with a plain `Error` would no longer exercise that contract.

## ESLint configuration exceptions

`eslint.config.js:6-7` globally ignores generated and output directories:
`dist/`, `storybook-static/`, `.codegen/`, `node_modules/`,
`tests/fixtures/lint-bad/`, and `src/types/generated/`. The generated and build
outputs are checked through their own package, code-generation, or theme gates.
The lint-bad fixture intentionally violates lint rules.

`eslint.config.js:12-16` excludes all test fixtures from type-aware linting.
Those fixtures do not have project type information.

`eslint.config.js:39-44` disables `no-restricted-imports` only for
`src/icons/lucide.ts`. This boundary is the permitted direct importer of
`lucide-react`; all other source and test files must import the curated icon
surface. The same rule bans `class-variance-authority` outside this boundary
file; disabling the whole rule also exempts this file from the CVA restriction.

## Ruff configuration exceptions

`pyproject.toml:36-39` ignores Ruff `E501` because this repository does not
enforce line length, and `COM812` because it conflicts with Ruff formatting.

`pyproject.toml:41-43` ignores `PT011` and `S101` in `tests/**/*.py`; tests may
assert and may raise without a match. It ignores `F401` in `**/__init__.py` for
intentional re-exports.

## Evidence

Verification read `eslint.config.js`, `pyproject.toml`, and every matching
suppression in `src/` and `tests/` on 2026-11-07. The scan command was:

```sh
rg -n --glob '*.{ts,tsx,js,mjs,cjs}' \
  'eslint-(disable|enable)|eslint-disable-line|eslint-disable-next-line' \
  src tests eslint.config.js
```
