# Composable `AccordionTrigger` — slots + chevron control

> **Status**: Draft
> **Last updated**: 2026-06-16
> **Spec-Issue**: _none yet (cross-cut; file under ocr-container-meta when synced)_

## TL;DR

`AccordionTrigger` gains three optional, additive props — `startContent`,
`endContent`, and `chevron` — so consumers can compose a richer trigger (leading
icon, trailing control such as a `KeyCap`, custom or suppressed chevron) without
abandoning the styled pdomain-ui component for raw Radix. With no new props
passed, the rendered DOM is byte-identical to today. The first consumer is
`pdomain-ocr-labeler-spa`, whose hand-rolled raw-Radix accordion trigger (hint
text + KeyCap chip + custom chevron) can then be deleted in favour of the shared
component.

## Context

`AccordionTrigger` currently renders a fixed structure:

```tsx
<AccordionPrimitive.Header className="acc-head">
  <AccordionPrimitive.Trigger className={cn('acc-trigger', className)}>
    {children}
    <span className="chev" aria-hidden>&#8250;</span>
  </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
```

Two things make this unusable for a richer trigger:

1. **The chevron is hard-coded.** A consumer that wants its own chevron icon (or
   none) gets a duplicate `›` alongside its own.
2. **The inner layout is not slot-aware.** Trailing controls (e.g. a keyboard-cap
   chip) and leading icons have nowhere to go except jammed into `children`,
   which collides with `.acc-trigger`'s layout.

The result: `pdomain-ocr-labeler-spa` re-implements the trigger directly on
`AccordionPrimitive` (re-declaring `.acc-head` / `.acc-trigger`), duplicating
markup pdomain-ui already owns and risking drift. During the 2026-06-16
labeler→pdomain-ui primitive migration, the labeler adopted pdui's
`AccordionItem` (`tone`) and `AccordionContent` but had to keep its trigger on
raw Radix for exactly these two reasons. This spec closes that gap.

The lib convention is **prop composition, not render-props** (`Button` exposes
`icon` / `iconRight` `ReactNode` props and an `asChild` slot; `Badge` uses tone
enums). This design follows that convention.

## Goals

- Let any consumer compose leading content, trailing content, and the chevron of
  an accordion trigger through props.
- Zero behavioural or visual change for existing consumers (additive only).
- Enable `pdomain-ocr-labeler-spa` to delete its raw-Radix accordion wrapper and
  use the shared component, completing visual unification.

## Non-goals (YAGNI)

- **No render-prop** (`renderTrigger`) — off-convention for this lib.
- **No domain-specific props** (`hint`, `keycap`, `tag`) baked into the lib — the
  generic slots carry those; `tone` already lives on `AccordionItem`.
- **No `Tabs` changes** — `Tabs` was adopted cleanly in the same migration.
- **No change to `Accordion`, `AccordionItem`, or `AccordionContent`** beyond what
  this trigger work requires.

## API

```ts
interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Leading slot, rendered before `children` (e.g. a status icon). */
  startContent?: React.ReactNode;
  /** Trailing slot, rendered after `children` and before the chevron (e.g. a KeyCap). */
  endContent?: React.ReactNode;
  /**
   * Chevron control:
   *   undefined → built-in `<span className="chev">›</span>` (current behaviour)
   *   ReactNode → rendered as-is in the chevron slot, no `.chev` class
   *   false     → no chevron
   */
  chevron?: React.ReactNode | false;
}
```

`children` remains the primary label region. `startContent` / `endContent` /
`chevron` are all optional; omitting all three reproduces today's output exactly.

### Rendered structure

```tsx
<AccordionPrimitive.Header className="acc-head">
  <AccordionPrimitive.Trigger className={cn('acc-trigger', className)} {...rest}>
    {startContent != null && <span className="acc-trigger-start">{startContent}</span>}
    {children}
    {endContent != null && <span className="acc-trigger-end">{endContent}</span>}
    {renderChevron(chevron)}
  </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
```

`renderChevron`:
- `undefined` → `<span className="chev" aria-hidden>&#8250;</span>` (unchanged).
- `false` → nothing.
- node → the node, rendered directly in the chevron slot with **no** `.chev`
  wrapper. The consumer owns its rotation/transform via the `[data-state=open]`
  attribute Radix sets on the trigger.

pdomain-ui keeps owning the `Header` / `.acc-head` / `.acc-trigger` wrappers — the
consumer never re-declares them, which is what removes the double-header conflict.

### CSS (`theme/primitives.css`)

- Lay the trigger out as a row with the start slot at the left, `children` next, and
  the end slot + chevron pushed right. The end group right-aligns via
  `.acc-trigger-end { margin-left: auto }` so that with no slots the children-only
  appearance is unchanged. Confirm whether `.acc-trigger` is already flex before
  adding/altering its `display` — the default (children + chevron) visual must not move.
- Add `.acc-trigger-start` and `.acc-trigger-end` layout rules (scoped to the new
  classes, so existing triggers are visually untouched).
- Add an `.acc-hint` muted-secondary-text utility so consumers (the labeler) can
  unify hint styling instead of hand-rolling it in Tailwind. Colours via tokens
  only (no hex), per repo constraint.
- Sync back to `docs/design-system/` via `scripts/sync-design-system.mjs`.

The existing `.acc[data-state='open'] .acc-head .chev` rotation rule is unchanged
and continues to apply to the default chevron only.

## Backward compatibility

All three props are optional. With none passed:
- the same elements render in the same order with the same classes,
- the default chevron and its rotation are unchanged,
- existing `Accordion.test.tsx` assertions remain green.

This is a **minor** version bump (`0.10.1` → `0.11.0`): additive API, no breaking
change. No other current consumer relies on the trigger's inner DOM beyond the
chevron, which is preserved on the default path.

## Testing (TDD)

New `Accordion.test.tsx` cases, written failing first:

1. `endContent` renders after `children` and before the chevron.
2. `startContent` renders before `children`.
3. `chevron={false}` renders no chevron (no `.chev`, no fallback node).
4. A custom `chevron` node renders in the chevron slot and **no** `.chev` element
   is emitted.
5. Default path (no new props) still renders `.chev` with `›` — regression guard.
6. `data-testid` and other passthrough props still reach the underlying trigger.

## Consumer follow-up (separate slice, after release)

Tracked as a labeler change, not part of this pdomain-ui slice:

1. Release pdomain-ui `0.11.0`; bump the pin in `pdomain-ocr-labeler-spa`.
2. Rewire `frontend/src/components/ui/accordion.tsx`:
   - `children` = label + `<span className="acc-hint">…</span>`,
   - `endContent` = `<KeyCap keys={…} />`,
   - `chevron` = pdui default (drops the labeler's custom `<ChevronDown>` for full
     unification) — or a custom node if the `ChevronDown` glyph is preferred.
   - delete the raw-Radix `Header` / `.acc-head` / `.acc-trigger` duplication and
     the `tagToTone` wrapper's trigger branch.
3. Verify the `word-detail-accordion` driver testid and the hint/KeyCap rendering
   survive (`make ci` + `make e2e`).

## Open questions

None blocking. If a future consumer needs the chevron's open/closed rotation
applied to a *custom* node automatically, we can add an opt-in
`chevronRotates` flag then — out of scope now.
