---
kind: spec
status: active
owner: CT
created: 2026-05-21
last_verified: 2026-07-13
---

# Field / FieldRow — component-API spec

**Date:** 2026-05-21
**Status:** Partially implemented — help slot is missing; see §5
**Subpath:** `@pdomain/pdomain-ui/primitives`
**Required by:** `pdomain-ocr-trainer-spa` config cards, profile edit dialog
**Spec source:** `pdomain-ocr-trainer-spa/specs/03-frontend.md §6.3`

---

## 1. Purpose

A labelled form-row primitive that gives all pdomain-* app config screens a
consistent layout: a label, a control slot, an optional expandable help
slot, and an error slot. Works with the existing pdomain-ui `Input`, `Textarea`,
`Select`, and `Accordion` primitives.

---

## 2. Component summary

| Component | Role |
|---|---|
| `<Field>` | Single labelled field: label + control + optional help + optional error |
| `<FieldRow>` | Horizontal group of two or more `<Field>` elements on one row |

Both are exported from `@pdomain/pdomain-ui/primitives`.

---

## 3. Field — target props

The current implementation (`src/primitives/Field.tsx`) covers `label`,
`htmlFor`, `error`, and `children`. The `help` slot below is **not yet
implemented** and is the primary gap blocking trainer-spa usage.

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
   * Help content — rendered inside a native <details>/<summary> Accordion
   * below the control. The summary text is "Help" unless `helpLabel` is set.
   *
   * NOT YET IMPLEMENTED — tracked as a pdomain-ui enhancement.
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
   * Error message string. When non-empty, renders in an `<span role="alert">`
   * below the control (and below the help disclosure, if present).
   *
   * Designed to receive a message derived from a FastAPI 422 ErrorEnvelope
   * `details[].loc` path — see §4 below.
   *
   * Empty string is treated as "no error" (same as undefined).
   */
  error?: string;

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

The trainer-spa maps this at the form level; `Field` only receives the
final `error` string. The recommended consumer pattern:

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

`Field` does not import or depend on any error-envelope type — it receives
plain strings. The loc-to-string mapping is always app-side.

---

## 5. Gap: help slot

**Current state:** `Field` has no `help` or `helpLabel` prop. The trainer-spa
config cards need this to show expandable documentation for each config
parameter (learning rate, batch size, vocab, etc.).

**Target implementation:** use the existing pdomain-ui `Accordion` primitive
(`<details>/<summary>`) as the help disclosure:

```tsx
// Field.tsx — addition when help prop is implemented
{help !== undefined && (
  <Accordion summary={helpLabel ?? 'Help'} className="field-help">
    {help}
  </Accordion>
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

Until the help slot is implemented, trainer-spa config cards can render a
standalone `<Accordion>` below the `<Field>` as a workaround. The API is
designed so adding `help` later does not break existing usages.

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

`FieldRow` is a pure layout container; it has no semantic meaning beyond
grouping. Use it when two short fields belong on the same horizontal line
(e.g. "Min epochs" + "Max epochs").

---

## 7. Styling

| Class | Element |
|---|---|
| `.field` | `Field` root |
| `.field-help` | help `<Accordion>` inside a Field |
| `.field-error` | error `<span role="alert">` |
| `.field-row` | `FieldRow` root |

All colors from design-system tokens. No hex literals.

---

## 8. Accessibility

- `<label htmlFor>` association is explicit — the consumer passes matching
  `htmlFor` / `id` pairs. `Field` does not auto-generate IDs.
- Error slot has `role="alert"` for screen-reader announcement when the error
  text changes.
- Help disclosure uses a native `<details>`/`<summary>` element (via
  `Accordion`) — inherently keyboard-accessible, no JS required for open/close.

---

## 9. Trainer-spa usage examples

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
    <Select id="lang" value={lang} onValueChange={setLang}>
      <SelectItem value="en">English</SelectItem>
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
  inside `role="alert"` regions.
- **D-F2** The `help` slot is a React node to accommodate rich content
  (paragraphs, code snippets, links). The summary button text is kept to a
  short string (`helpLabel`).
- **D-F3** `Field` does not auto-assign IDs. The consumer controls IDs to
  integrate with form libraries (react-hook-form, manual state). Generating
  random IDs would break SSR hydration and Playwright selectors.
- **D-F4** `FieldRow` is a layout-only container with no semantic role. It
  does not wrap fields in a `<fieldset>` — that is an app-level decision when
  grouping fields is semantically meaningful.
