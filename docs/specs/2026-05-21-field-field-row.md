---
kind: spec
status: active
owner: CT
created: 2026-05-21
last_verified: 2026-11-12
verified_against:
  - "src/primitives/Field.tsx"
  - "src/primitives/FieldRow.tsx"
  - "src/primitives/Field.test.tsx"
  - "src/primitives/Input.tsx"
---

# Field / FieldRow — component-API spec

**Date:** 2026-05-21
**Status:** Implemented — label, control, help disclosure, and error slot; see §5
**Subpath:** `@pdomain/pdomain-ui/primitives`
**Required by:** `pdomain-ocr-trainer-spa` config cards, profile edit dialog
**Spec source:** `pdomain-ocr-trainer-spa/specs/03-frontend.md §6.3`

---

## 1. Purpose

`Field` gives all pdomain-* app config screens a consistent labelled form-row
layout. It provides a label, a control slot, an optional help disclosure, and
an error slot. Existing fields work with the pdomain-ui `Input`, `Textarea`,
and composed Radix `Select` primitives.

---

## 2. Component summary

| Component | Role |
|---|---|
| `<Field>` | Single labelled field: label + control + optional help disclosure + optional error |
| `<FieldRow>` | Horizontal group of two or more `<Field>` elements on one row |

Both are exported from `@pdomain/pdomain-ui/primitives`.

---

## 3. Field — target props

The current implementation (`src/primitives/Field.tsx`) covers `label`,
`htmlFor`, `help`, `helpLabel`, `error`, `errorId`, and `children`.

```ts
interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Label text. Rendered as a <label> element when set.
   */
  label?: string;

  /**
   * Links the <label> to a form control via the `for` attribute.
   */
  htmlFor?: string;

  /**
   * Help content — rendered inside a native <details>/<summary>
   * below the control and above the error. The summary text is "Help" unless
   * `helpLabel` is set. The disclosure starts closed.
   *
   * Trainer-spa config cards use this to expose per-field documentation
   * (e.g. "What is learning rate?").
   */
  help?: React.ReactNode;

  /**
   * Summary text for the help disclosure widget.
   * Default: "Help". Only used when `help` is set.
   */
  helpLabel?: string;

  /**
   * Error message string. When non-empty, renders in an `<span role="status">`
   * below the control (and below the help disclosure, if present).
   *
   * Designed to receive a message derived from a FastAPI 422 ErrorEnvelope
   * `details[].loc` path — see §4 below.
   *
   * Empty string is treated as "no error" (same as undefined).
   */
  error?: string;

  /** Explicit error span id; defaults to `${htmlFor}-error` when htmlFor is set. */
  errorId?: string;

  /**
   * The form control. Typically a pdomain-ui Input, Textarea, or Select.
   */
  children?: React.ReactNode;
}
```

---

## 4. Mapping 422 ErrorEnvelope to Field errors

FastAPI validation errors follow the structure:

```json
{
  "detail": [
    { "loc": ["body", "config", "learning_rate"], "msg": "value is not a valid float", "type": "type_error.float" }
  ]
}
```

The trainer-spa maps this error at the form level. `Field` receives only the
final `error` string. Consumers should use this pattern:

```ts
// In the form component (trainer-spa, not pdomain-ui)
function errorForPath(details: ErrorDetail[], path: string[]): string | undefined {
  const key = path.join('.');
  const hit = details.find(d => d.loc.slice(1).join('.') === key);
  return hit?.msg;
}

// Usage:
<Field
  label="Learning rate"
  htmlFor="lr"
  error={errorForPath(apiErrors, ['config', 'learning_rate'])}
>
  <Input id="lr" type="number" step="0.0001" />
</Field>
```

`Field` does not import or depend on any error-envelope type. It receives plain
strings, and the app always maps the location to a string.

---

## 5. Help disclosure

`Field` renders `help` in a native `<details>/<summary>` when `help` is set.
The summary reads `helpLabel`, or "Help" when `helpLabel` is omitted. The
disclosure starts closed. It sits under the control and above the error.
When `help` is omitted, no disclosure is rendered. The shared `Accordion` is
Radix-based and is not this disclosure.

```tsx
{help !== undefined && (
  <details className="field-help">
    <summary>{helpLabel ?? 'Help'}</summary>
    {help}
  </details>
)}
```

**Visual layout (with help):**

```
┌─ Field ──────────────────────────┐
│ Label                            │
│ [    control    ]                │
│ ▶ Help                           │  ← collapsed by default
│ ⚠ Error message                 │  ← only when error is set
└──────────────────────────────────┘
```

Pass `help` and, when the summary should not read "Help", `helpLabel`.
Omitting `help` leaves existing label, control, and error behavior unchanged.

---

## 6. FieldRow — props

```ts
interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Two or more <Field> elements rendered side-by-side.
   * FieldRow applies a horizontal flex layout; each child Field
   * sizes to its content.
   */
  children: React.ReactNode;
}
```

`FieldRow` is a pure layout container with no semantic meaning beyond grouping.
Use it when two short fields belong on the same horizontal line, such as "Min
epochs" and "Max epochs."

---

## 7. Styling

| Class | Element |
|---|---|
| `.field` | `Field` root |
| `.field-help` | help disclosure inside a Field |
| `.field-error` | error `<span role="status">` |
| `.field-row` | `FieldRow` root |

All colors from design-system tokens. No hex literals.

---

## 8. Accessibility

- `<label htmlFor>` association is explicit. The consumer passes matching
  `htmlFor` / `id` pairs. `Field` does not auto-generate control IDs. It derives
  an error span ID from `htmlFor` unless an explicit `errorId` is provided.
- Error slot has `role="status"` for screen-reader announcement when the error
  text changes.
- The help disclosure uses native `<details>`/`<summary>`. The shared
  `Accordion` stays the Radix primitive and is not this slot.

---

## 9. Trainer-spa usage examples

The first example uses the help disclosure. The second shows the composed
`Select` API.

```tsx
// Detection config card (trainer-spa — illustrative)
<Field
  label="Learning rate"
  htmlFor="lr"
  help={<p>Lower values (1e-5–1e-4) give stable convergence. Higher values speed up early epochs but risk overshooting.</p>}
  helpLabel="What is learning rate?"
  error={errors.learning_rate}
>
  <Input id="lr" type="number" step="0.0001" defaultValue={0.0001} />
</Field>

// Profile edit dialog — two fields on one row
<FieldRow>
  <Field label="Language" htmlFor="lang">
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger id="lang"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="en">English</SelectItem></SelectContent>
    </Select>
  </Field>
  <Field label="Typeface" htmlFor="typeface">
    <Input id="typeface" value={typeface} onChange={...} />
  </Field>
</FieldRow>
```

---

## 10. Decisions

- **D-F1** The `error` prop is a plain string, not a React node. This keeps
  error rendering predictable and avoids consumers embedding arbitrary markup
  inside `role="status"` regions.
- **D-F2** The `help` slot is a React node to accommodate rich content
  (paragraphs, code snippets, links). The summary button text is kept to a
  short string (`helpLabel`).
- **D-F3** `Field` does not auto-assign control IDs. The consumer controls IDs to
  integrate with form libraries, including react-hook-form and manual state.
  Generating random IDs would break SSR hydration and Playwright selectors.
- **D-F4** `FieldRow` is a layout-only container with no semantic role. It
  does not wrap fields in a `<fieldset>`. That is an app-level decision when
  grouping fields is semantically meaningful.

## Adversarial Review

**Stage / sources:** This active partial-implementation review covers
`Field.tsx`, FieldContext, focused tests, and implementation history.
**Accepted findings / residual risk:** The label, error, row, help disclosure,
and accessibility behavior are proven. Keep this spec active as the Field API
contract.
