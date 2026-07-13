---
kind: plan
status: implemented
owner: CT
created: 2026-06-16
last_verified: 2026-07-13
---

# Composable AccordionTrigger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `startContent`, `endContent`, and `chevron` props to pdomain-ui's `AccordionTrigger` so consumers can compose a richer trigger without dropping to raw Radix, with zero change to existing consumers.

**Architecture:** Purely additive change to one component (`src/primitives/Accordion.tsx`) plus scoped CSS in `theme/primitives.css`. Slots render conditionally; the default path (no new props) is byte-identical to today. No render-prop, no domain props — matches the lib's prop-composition convention.

**Tech Stack:** TypeScript (strict, `exactOptionalPropertyTypes`), React 19, `@radix-ui/react-accordion`, Vitest + jsdom + Testing Library, Vite library build.

**Spec:** `docs/specs/2026-06-16-accordion-trigger-slots-design.md`

---

### Task 1: `AccordionTrigger` slots + chevron control (component + tests)

**Files:**
- Modify: `src/primitives/Accordion.tsx` (the `AccordionTrigger` definition)
- Modify: `src/primitives/index.ts` (add `AccordionTriggerProps` type export)
- Test: `src/primitives/Accordion.test.tsx` (or `tests/...` — use the existing Accordion test file's location)

- [ ] **Step 1: Read the current implementation first**

Read `src/primitives/Accordion.tsx` and the existing `Accordion.test.tsx`. Confirm the
current `AccordionTrigger` renders:
```tsx
<AccordionPrimitive.Header className="acc-head">
  <AccordionPrimitive.Trigger ref={ref} className={cn('acc-trigger', className)} {...props}>
    {children}
    <span className="chev" aria-hidden>&#8250;</span>
  </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
```
Note the exact import path the test uses for the component, and the existing render
helper (a `type="single" collapsible` Accordion with an item). Reuse that style below.

- [ ] **Step 2: Write the failing tests**

Add to the Accordion test file. Adjust the import path to match the existing file.

```tsx
import { render, screen } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../Accordion';

function renderTrigger(triggerProps: Record<string, unknown> = {}) {
  return render(
    <Accordion type="single" collapsible defaultValue="a">
      <AccordionItem value="a">
        <AccordionTrigger {...triggerProps}>Label</AccordionTrigger>
        <AccordionContent>Body</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe('AccordionTrigger slots + chevron', () => {
  it('default path renders the built-in chevron and no slot wrappers', () => {
    const { container } = renderTrigger();
    const trigger = container.querySelector('.acc-trigger')!;
    expect(trigger).not.toBeNull();
    const chev = trigger.querySelector('.chev');
    expect(chev).not.toBeNull();
    expect(chev).toHaveTextContent('›'); // ›
    expect(trigger.querySelector('.acc-trigger-start')).toBeNull();
    expect(trigger.querySelector('.acc-trigger-end')).toBeNull();
    expect(trigger.textContent?.startsWith('Label')).toBe(true);
  });

  it('renders endContent after children and before the chevron', () => {
    const { container } = renderTrigger({ endContent: <span data-testid="kc">KC</span> });
    const trigger = container.querySelector('.acc-trigger')!;
    const end = trigger.querySelector('.acc-trigger-end')!;
    expect(end).toHaveTextContent('KC');
    const els = Array.from(trigger.children);
    const endIdx = els.findIndex((e) => e.classList.contains('acc-trigger-end'));
    const chevIdx = els.findIndex((e) => e.classList.contains('chev'));
    expect(endIdx).toBeGreaterThanOrEqual(0);
    expect(chevIdx).toBeGreaterThan(endIdx);
    expect(trigger.textContent?.startsWith('Label')).toBe(true);
  });

  it('renders startContent before children', () => {
    const { container } = renderTrigger({ startContent: <span data-testid="st">S</span> });
    const trigger = container.querySelector('.acc-trigger')!;
    const start = trigger.querySelector('.acc-trigger-start')!;
    expect(start).toHaveTextContent('S');
    expect(trigger.firstElementChild).toBe(start);
  });

  it('chevron={false} renders no chevron at all', () => {
    const { container } = renderTrigger({ chevron: false });
    const trigger = container.querySelector('.acc-trigger')!;
    expect(trigger.querySelector('.chev')).toBeNull();
    expect(trigger.textContent).toContain('Label');
  });

  it('a custom chevron node replaces the default and emits no .chev', () => {
    const { container } = renderTrigger({ chevron: <svg data-testid="myc" /> });
    expect(screen.getByTestId('myc')).toBeInTheDocument();
    expect(container.querySelector('.chev')).toBeNull();
  });

  it('passes through data-testid and other props to the underlying trigger', () => {
    renderTrigger({ 'data-testid': 'trg' });
    expect(screen.getByTestId('trg')).toHaveClass('acc-trigger');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `make test` (or `pnpm exec vitest run src/primitives/Accordion.test.tsx`)
Expected: the new cases FAIL (e.g. `.acc-trigger-end` is null, custom chevron not found). The pre-existing Accordion tests still PASS.

- [ ] **Step 4: Implement the new `AccordionTrigger`**

Replace the `AccordionTrigger` definition in `src/primitives/Accordion.tsx` with:

```tsx
export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Leading slot, rendered before `children` (e.g. a status icon). */
  startContent?: React.ReactNode;
  /** Trailing slot, rendered after `children` and before the chevron (e.g. a KeyCap). */
  endContent?: React.ReactNode;
  /**
   * Chevron control:
   *   undefined -> built-in `<span className="chev">›</span>` (default)
   *   ReactNode -> rendered as-is in the chevron slot, no `.chev` class
   *   false     -> no chevron
   */
  chevron?: React.ReactNode | false;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, startContent, endContent, chevron, ...props }, ref) => (
  <AccordionPrimitive.Header className="acc-head">
    <AccordionPrimitive.Trigger ref={ref} className={cn('acc-trigger', className)} {...props}>
      {startContent != null && <span className="acc-trigger-start">{startContent}</span>}
      {children}
      {endContent != null && <span className="acc-trigger-end">{endContent}</span>}
      {chevron === undefined ? (
        <span className="chev" aria-hidden>
          &#8250;
        </span>
      ) : (
        chevron
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';
```

Note: `{chevron}` when `chevron === false` renders nothing (React ignores `false`); when a node, renders the node. Only `undefined` produces the default `.chev`. This satisfies `exactOptionalPropertyTypes` because the prop is optional and only compared, never reassigned.

- [ ] **Step 5: Export the new props type**

In `src/primitives/index.ts`, find the Accordion type export line
(`export type { AccordionTone }` — near the `Accordion` component export) and add
`AccordionTriggerProps`:

```ts
export type { AccordionTone, AccordionTriggerProps } from './Accordion';
```
(Match the existing export style in that file — if `AccordionTone` is exported on its own line, add `AccordionTriggerProps` to the same `export type { ... } from './Accordion'` statement.)

- [ ] **Step 6: Run the tests to verify they pass**

Run: `make test`
Expected: all Accordion tests PASS, including the 6 new cases and the pre-existing ones.

- [ ] **Step 7: Commit**

```bash
git add src/primitives/Accordion.tsx src/primitives/index.ts src/primitives/Accordion.test.tsx
git commit -m "feat(primitives): AccordionTrigger startContent/endContent/chevron slots"
```

---

### Task 2: Slot layout CSS + `.acc-hint` utility

**Files:**
- Modify: `theme/primitives.css` (the `.acc*` block, ~lines 568–605)
- Generated (do not hand-edit): `docs/design-system/` (regenerated via sync script)

- [ ] **Step 1: Read the current `.acc-trigger` rule**

In `theme/primitives.css`, locate the `.acc-trigger` and `.acc-head` rules. Determine
how the chevron is currently right-aligned (is `.acc-trigger` already `display: flex`
with `justify-content: space-between` / `width: 100%`, or is the chevron pushed some
other way?). The default (children + chevron) appearance MUST NOT move after this task.

- [ ] **Step 2: Add the slot layout rules**

Add (or fold into the existing `.acc-trigger` rule) the following. If `.acc-trigger`
is already a flex row, only add the three new selectors; do not duplicate `display`.

```css
/* Composable trigger slots (additive — default children+chevron layout unchanged) */
.acc-trigger-start {
  display: inline-flex;
  align-items: center;
}
.acc-trigger-end {
  margin-left: auto; /* pushes the trailing group (+ chevron) to the right */
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.acc-hint {
  color: var(--ink-3);
  font-size: var(--text-xs);
  font-weight: 400;
}
```

If, and only if, Step 1 showed `.acc-trigger` is NOT a flex row (so the new spans
would not align), add `display: flex; align-items: center; width: 100%;` to
`.acc-trigger` and verify the default snapshot test in Task 1 still passes (it asserts
DOM, not computed style, so it will — but eyeball the dev story in Task 3). Colours are
tokens only; no hex (repo constraint).

- [ ] **Step 3: Sync the design-system mirror**

Run the sync script so `docs/design-system/` matches `theme/`:
Run: `node scripts/sync-design-system.mjs` (or `make` target if one exists for it — check the Makefile; otherwise run the script directly)
Expected: `docs/design-system/` updated with the new selectors, no errors.

- [ ] **Step 4: Run tests (still green)**

Run: `make test`
Expected: PASS (CSS changes don't affect jsdom DOM assertions; this confirms no regression).

- [ ] **Step 5: Commit**

```bash
git add theme/primitives.css docs/design-system
git commit -m "feat(theme): accordion trigger slot layout + .acc-hint utility"
```

---

### Task 3: Full verification + release prep

**Files:**
- Modify: none (verification); `package.json` version handled by the release target, not hand-edited here.

- [ ] **Step 1: Run the full gate**

Run: `make ci AI=1`
Expected: `✅ ci passed` — install + lint (no CVA / no hex / no direct lucide violations) + typecheck (strict) + test + build all green. If lint flags the `&#8250;` entity or the `chevron` union, fix per the error and re-run.

- [ ] **Step 2: Sanity-check the published surface**

Confirm `AccordionTriggerProps` is exported and the three props are visible on the type:
Run: `pnpm exec tsc --noEmit` (already covered by `make ci`, but re-run if you changed exports after Step 1).
Expected: clean.

- [ ] **Step 3: Smoke the default + slotted render in dev (optional but recommended)**

Run: `make frontend-dev`, open the Accordion story/usage if one exists, and eyeball:
the default trigger looks identical to before; a trigger with `endContent` + `chevron={false}` lays out correctly. Stop the dev server when done. (If there is no story, skip — the Task 1 tests are the contract.)

- [ ] **Step 4: Commit any verification fixups**

```bash
git add -A
git commit -m "chore: verify accordion trigger slots (make ci green)" --allow-empty
```

- [ ] **Step 5: Release is a SEPARATE, gated step — do NOT run here**

The spec calls for a `0.11.0` minor release. Releasing is done with `make release-minor`
(bumps version, runs ci, commits, tags, and **pushes**) — pushing requires explicit CT
authorization per workspace rules. Do NOT run it as part of plan execution. Leave the
branch ready; the orchestrator integrates (rebase + ff-merge) and CT authorizes the release.

---

## Self-Review

**Spec coverage:**
- Three props (`startContent`/`endContent`/`chevron`) → Task 1. ✓
- Render structure with bare default children → Task 1 Step 4 + default regression test. ✓
- CSS `.acc-trigger-start/-end` + `.acc-hint`, end group `margin-left:auto`, sync to design-system → Task 2. ✓
- Backward compat (byte-identical default) → Task 1 default-path test (Step 2 case 1) + Task 2 "must not move". ✓
- Minor bump `0.11.0` → Task 3 Step 5 (gated, not executed). ✓
- 6 TDD cases → Task 1 Step 2 (all six present with code). ✓
- Non-goals (no render-prop, no domain props, no Tabs/Item/Content change) → respected; only `AccordionTrigger` + scoped CSS touched. ✓
- Consumer follow-up (labeler rewire) → explicitly out of scope of this plan (separate post-release slice per spec). ✓

**Placeholder scan:** No TBD/TODO; all code shown in full. ✓
**Type consistency:** `AccordionTriggerProps`, `startContent`, `endContent`, `chevron` named identically across Task 1 component, test, and index export. ✓
**FastAPI+SPA check:** N/A — pdomain-ui is a component library, no server/SPA bundle. ✓
