---
kind: plan
status: active
owner: CT
created: 2026-07-21
last_verified: 2026-07-21
disposition: deferred
---

# Shortcut Sequences Conditional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add timed key sequences to `useShortcuts` after a named consumer satisfies the design's activation criteria.

**Architecture:** Parse a binding into ordered `ParsedCombo` steps, then keep pending progress and one timeout inside the hook effect. Existing one-step bindings retain immediate matching and editable-target behavior.

**Tech Stack:** TypeScript, React hooks, browser keyboard events, Vitest fake timers, Testing Library, pnpm, Make.

---

## Agent Index

- **Kind:** plan
- **Status:** active
- **Read when:** a consumer requests `g p`-style shortcut sequences.
- **Search terms:** useShortcuts, sequence parser, prefix timer, fake timers.
- **Relates to:** [decision design](../specs/2026-07-21-shortcut-sequences-decision-design.md),
  [sequence issue](../issues/2026-07-15-useshortcuts-chord-sequences.md).

## Goal

Add timed key sequences only after a named consumer satisfies every activation criterion.

## Architecture

Parse bindings into ordered combo steps. Keep pending progress and one timeout inside the existing hook effect while preserving immediate one-step matching.

## Tech Stack

TypeScript, React hooks, browser keyboard events, Vitest fake timers, Testing Library, pnpm, and Make.

## Global Constraints

- Do not execute without recorded activation evidence.
- Preserve exact-binding precedence and current editable-target defaults.
- Use TDD and run `make ci AI=1` before each implementation commit.

## Activation gate

Do not execute this plan until a consumer names its sequence and action, accepts immediate exact-binding precedence, and decides whether the sequence appears in the cheatsheet. Record that evidence in the implementation issue before Task 1.

### Task 1: Pin parsing and timing behavior

**Files:**
- Modify: `src/hooks/useShortcuts.test.ts`
- Test: `src/hooks/useShortcuts.test.ts`

- [ ] **Step 1: Enable fake timers for the sequence describe block**

Add a nested `describe('sequences', ...)` inside the existing `useShortcuts` suite with:

```ts
  describe('sequences', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());
```

- [ ] **Step 2: Add the successful sequence test**

```ts
    it('fires a two-step sequence once', () => {
      const handler = vi.fn();
      renderHook(() => useShortcuts([makeBinding('g p', handler)]));

      keyDown({ key: 'g' });
      expect(handler).not.toHaveBeenCalled();
      keyDown({ key: 'p' });
      expect(handler).toHaveBeenCalledTimes(1);
    });
```

- [ ] **Step 3: Add reset and precedence tests**

```ts
    it('clears a pending sequence after 1000 milliseconds', () => {
      const handler = vi.fn();
      renderHook(() => useShortcuts([makeBinding('g p', handler)]));
      keyDown({ key: 'g' });
      vi.advanceTimersByTime(1000);
      keyDown({ key: 'p' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('retries an unrelated key as a fresh single-key match', () => {
      const sequence = vi.fn();
      const single = vi.fn();
      renderHook(() =>
        useShortcuts([makeBinding('g p', sequence), makeBinding('x', single)]),
      );
      keyDown({ key: 'g' });
      keyDown({ key: 'x' });
      expect(sequence).not.toHaveBeenCalled();
      expect(single).toHaveBeenCalledTimes(1);
    });

    it('fires an exact binding instead of waiting on the same prefix', () => {
      const exact = vi.fn();
      const sequence = vi.fn();
      renderHook(() =>
        useShortcuts([makeBinding('g', exact), makeBinding('g p', sequence)]),
      );
      keyDown({ key: 'g' });
      expect(exact).toHaveBeenCalledTimes(1);
      keyDown({ key: 'p' });
      expect(sequence).not.toHaveBeenCalled();
    });
```

- [ ] **Step 4: Add editable and lifecycle reset tests**

```ts
    it.each(['Escape', 'blur', 'unmount'] as const)('clears pending state on %s', (reset) => {
      const handler = vi.fn();
      const hook = renderHook(() => useShortcuts([makeBinding('g p', handler)]));
      keyDown({ key: 'g' });
      if (reset === 'Escape') keyDown({ key: 'Escape' });
      if (reset === 'blur') window.dispatchEvent(new Event('blur'));
      if (reset === 'unmount') hook.unmount();
      keyDown({ key: 'p' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('rejects a plain-key sequence step in an editable target', () => {
      const handler = vi.fn();
      renderHook(() => useShortcuts([makeBinding('g p', handler)]));
      keyDown({ key: 'g' });
      const input = document.createElement('input');
      document.body.appendChild(input);
      fireEvent.keyDown(input, { key: 'p' });
      expect(handler).not.toHaveBeenCalled();
      input.remove();
    });
  });
```

- [ ] **Step 5: Run the focused suite and confirm failure**

Run: `pnpm exec vitest run src/hooks/useShortcuts.test.ts`

Expected: FAIL because `g p` is still parsed as one literal key.

- [ ] **Step 6: Commit the red tests**

```bash
git add src/hooks/useShortcuts.test.ts
git commit -m "test(hooks): specify shortcut sequences"
```

### Task 2: Parse and match ordered steps

**Files:**
- Modify: `src/hooks/useShortcuts.ts`
- Test: `src/hooks/useShortcuts.test.ts`

- [ ] **Step 1: Add the sequence parser and constant**

Place these beside `parseCombo`:

```ts
const SEQUENCE_TIMEOUT_MS = 1000;

function parseSequence(keys: string): ParsedCombo[] {
  return keys
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseCombo)
    .filter((step) => step.key !== '');
}
```

- [ ] **Step 2: Add pending state inside the effect**

At the start of `useEffect`, add:

```ts
    let pending: { binding: ShortcutBinding; step: number } | null = null;
    let timeoutId: ReturnType<typeof window.setTimeout> | null = null;

    function clearPending(): void {
      pending = null;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = null;
    }
```

- [ ] **Step 3: Replace one-combo matching with exact-first sequence matching**

Replace `handleKeyDown` with a focused implementation that performs these operations in order: clear on Escape; evaluate eligible one-step bindings; advance `pending`; start matching multi-step prefixes; then clear and retry the same event against one-step bindings. Extract `bindingAllowsEvent(binding, steps, editable)` so both exact and sequence paths apply explicit `allowInEditable`, or default to `steps.some((step) => step.hasNonShiftMod)`.

Keep these signatures exact:

```ts
function bindingAllowsEvent(
  binding: ShortcutBinding,
  steps: ParsedCombo[],
  editable: boolean,
): boolean;

function tryExactBindings(e: KeyboardEvent, editable: boolean): boolean;
```

`tryExactBindings` returns true only after it calls `preventDefault`, clears pending state, invokes the first eligible matching handler, and stops iteration. The sequence branch stores `{ binding, step: 1 }` after its first match and advances `step` after each later match. A completed sequence performs the same four actions as an exact match.

- [ ] **Step 4: Clear state on blur and cleanup**

Register `window.addEventListener('blur', clearPending)`. In cleanup, remove both listeners and call `clearPending()`.

- [ ] **Step 5: Run the focused suite**

Run: `pnpm exec vitest run src/hooks/useShortcuts.test.ts`

Expected: PASS for new sequence cases and all existing modifier-combo cases.

- [ ] **Step 6: Run full verification**

Run: `make ci AI=1`

Expected: exit 0 with the repository's success summary.

- [ ] **Step 7: Commit the hook behavior**

```bash
git add src/hooks/useShortcuts.ts
git commit -m "feat(hooks): support timed shortcut sequences"
```
