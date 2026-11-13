---
kind: architecture
status: built
owner: CT
created: 2026-11-13
last_verified: 2026-11-13
verified_against:
  - "src/primitives/Field.tsx"
  - "src/primitives/FieldContext.ts"
  - "src/primitives/FieldRow.tsx"
  - "src/primitives/Field.test.tsx"
  - "src/primitives/Input.tsx"
  - "src/primitives/Textarea.tsx"
---

# Field and FieldRow contracts

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** composing labelled controls, help disclosures, error associations, or horizontal field groups.
- **Search terms:** Field, FieldRow, FieldContext, helpLabel, errorId, aria-describedby, validation.

## Field renders the label, control, help, and error in order

`Field` and `FieldRow` are public primitives. Both forward a div ref, merge the
consumer's class name, and pass standard div attributes through to the root.
`Field` accepts its control through `children`; it does not own the control's
value, form state, or ID.

A supplied `label` renders a native label. The consumer supplies `htmlFor` and
the control's matching ID. Stable consumer-owned IDs support form libraries,
server rendering, and selectors without introducing random control IDs.

When `help` is not `undefined`, a native details element appears below the
control. It starts closed. Its summary is `helpLabel` or the default `Help`.
Help accepts a React node so callers can include paragraphs, code, and links;
the summary label remains a string. Help precedes the error when both exist.

`error` is a plain string. A nonempty string renders a `field-error` span with
`role="status"`; an empty string or omitted error renders no error slot.
Status announcements avoid the interruptive mount behavior of an alert. The
app maps backend errors, including FastAPI 422 paths, into these strings.
`Field` does not import an error-envelope model or interpret backend paths.

## Input and Textarea inherit active error associations

An explicit `errorId` takes precedence. Otherwise, `Field` derives
`${htmlFor}-error` when `htmlFor` exists. Without either prop, it leaves the
error span without an ID. It never generates an ID for the control itself.

`FieldContext` exposes `hasError` and the active error ID. The ID is absent
when no nonempty error exists. Outside a Field, both values default to an
inactive association.

`Input` and `Textarea` use that ID for `aria-describedby` and set
`aria-invalid` for an active error. Each caller-supplied attribute takes
precedence, including an explicitly supplied false or undefined value.
The caller is responsible for combining additional descriptions when needed.

`SelectTrigger` does not consume FieldContext. A consumer composing Select or
another control supplies its trigger's error association explicitly. Label
association still uses the consumer's trigger ID and `htmlFor`.

## FieldRow provides wrapping layout without group semantics

`FieldRow` is a plain div with the `field-row` class. Shared CSS lays out its
children horizontally, wraps them when necessary, and aligns them at the bottom.
It does not require a particular child count or enforce Field children.

The row adds no group role and creates no fieldset or legend. The consuming
app adds semantic grouping when its form requires it. Spacing and error/help
colors come from the shared theme tokens and primitive stylesheet.

## Evidence

- Code: `src/primitives/Field.tsx`, `FieldContext.ts`, `FieldRow.tsx`,
  `Input.tsx`, `Textarea.tsx`, `Select.tsx`, and `src/primitives/index.ts`.
- Styles: `theme/primitives.css`, field and field-row rules.
- Tests: `src/primitives/Field.test.tsx` covers label association, error IDs,
  nonempty errors, initially closed help and custom summaries, help/error order,
  Input/Textarea attribute precedence, passthrough, and FieldRow refs.
- History: `fe657bd4` wires Input/Textarea associations; `14872a04` uses status
  announcements; `38a86980` completes the help disclosure.
- Verified: 2026-11-13 by source, focused-test inspection, and independent
  migration analysis. Full migration gate results are recorded separately.
