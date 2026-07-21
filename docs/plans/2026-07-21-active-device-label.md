---
kind: plan
status: active
owner: CT
created: 2026-07-21
last_verified: 2026-07-21
---

# Friendly Active-Device Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render friendly active-device labels without hiding unknown backend identifiers or changing device controls.

**Architecture:** A module-local pure helper resolves the label from `current` and `available`. `ComputeTargetPanel` uses the helper only for display, leaving selection and persistence behavior intact.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, pnpm, Make.

---

## Agent Index

- **Kind:** plan
- **Status:** active
- **Read when:** implementing the friendly active-device label.
- **Search terms:** ComputeTargetPanel, active device label, local sentinel.
- **Relates to:** [design](../specs/2026-07-21-active-device-label-design.md),
  [active-device issue](../issues/2026-07-15-computetargetpanel-active-device-label.md).

## Goal

Render friendly active-device labels without hiding unknown backend identifiers or changing device controls.

## Architecture

A module-local pure helper resolves display text from `current` and `available`. The component uses the result only in its active-target line.

## Tech Stack

TypeScript, React, Vitest, Testing Library, pnpm, and Make.

## Global Constraints

- Keep the helper private to `ComputeTargetPanel.tsx`.
- Preserve selection, Force CPU, effective-source, and backend behavior.
- Follow TDD and run `make ci AI=1` before the implementation commit.

### Task 1: Pin the display contract

**Files:**
- Modify: `src/shell/ComputeTargetPanel.test.tsx`
- Test: `src/shell/ComputeTargetPanel.test.tsx`

- [ ] **Step 1: Add failing table-driven label tests**

Add this test after `renders device list in local mode`:

```tsx
  it.each([
    ['cpu', 'CPU'],
    ['cuda:0', 'GPU'],
    ['local', 'Local compute target'],
    ['remote:unexpected', 'remote:unexpected'],
    [null, 'Automatic'],
  ] as const)('shows the friendly active label for %s', (current, expected) => {
    render(
      <ComputeTargetPanel
        info={{ ...localInfo, current }}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('Active:').parentElement).toHaveTextContent(
      `Active: ${expected} (via auto)`,
    );
  });
```

- [ ] **Step 2: Run the focused test and confirm the new cases fail**

Run: `pnpm exec vitest run src/shell/ComputeTargetPanel.test.tsx`

Expected: FAIL for `cpu`, `cuda:0`, `local`, and null because the component still renders raw IDs or `auto`; the unknown-ID case passes.

- [ ] **Step 3: Commit the red test**

```bash
git add src/shell/ComputeTargetPanel.test.tsx
git commit -m "test(shell): pin active device labels"
```

### Task 2: Resolve the friendly label

**Files:**
- Modify: `src/shell/ComputeTargetPanel.tsx`
- Test: `src/shell/ComputeTargetPanel.test.tsx`

- [ ] **Step 1: Add the pure resolver below `isUsableCuda`**

```tsx
function activeDeviceLabel(
  current: string | null,
  available: DeviceInfo['available'],
): string {
  if (current === null) return 'Automatic';
  const knownDevice = available.find((device) => device.id === current);
  if (knownDevice) return knownDevice.label;
  if (current === 'local') return 'Local compute target';
  return current;
}
```

- [ ] **Step 2: Compute the display label after `current`**

```tsx
  const current = info.current ?? null;
  const currentLabel = activeDeviceLabel(current, info.available);
```

- [ ] **Step 3: Render the resolved text**

Replace the active-device `<strong>` content with:

```tsx
<strong style={{ color: 'var(--fg)' }}>{currentLabel}</strong>
```

- [ ] **Step 4: Run the component test**

Run: `pnpm exec vitest run src/shell/ComputeTargetPanel.test.tsx`

Expected: PASS, including all five label cases and the existing selection tests.

- [ ] **Step 5: Run repository verification**

Run: `make ci AI=1`

Expected: exit 0 with the repository's success summary.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/shell/ComputeTargetPanel.tsx
git commit -m "fix(shell): show friendly active device labels"
```
