---
kind: spec
status: draft
owner: CT
created: 2026-05-21
last_verified: 2026-07-13
disposition: needs-owner-decision
---

# LogViewer — component-API spec

**Date:** 2026-05-21
**Status:** Spec — not yet implemented
**Subpath:** `@pdomain/pdomain-ui/primitives`
**Required by:** `pdomain-ocr-trainer-spa` RunDetailPage (live training-output log)
**Spec source:** `pdomain-ocr-trainer-spa/specs/03-frontend.md §6.3`

---

## 1. Purpose

`LogViewer` efficiently renders a growing list of log lines as virtualized,
streaming text. pdomain-ui owns the virtualization
(`@tanstack/react-virtual`), auto-scroll toggle, and line-wrap toggle.

The consumer provides an array of log lines and connects it to any data source,
such as the `useLongJob` hook's SSE events. The viewer does not depend on a
specific data source.

---

## 2. Component

```
<LogViewer>           — root: scroll container + toolbar
  toolbar             — auto-scroll toggle + line-wrap toggle (built-in)
  virtualized list    — renders only visible lines
```

Exported from `@pdomain/pdomain-ui/primitives`.

---

## 3. Props

```ts
interface LogViewerProps {
  /**
   * The lines to display. Each line is a plain string (may contain ANSI
   * escape codes — the viewer strips them by default; see `stripAnsi`).
   * The viewer renders them in order; index 0 is the oldest line.
   *
   * The array reference need not be stable between renders; the viewer
   * only reads `.length` and index access.
   */
  lines: readonly string[];

  /**
   * Maximum number of lines the viewer will render. Older lines beyond
   * this cap are dropped from the rendered list (not from the `lines`
   * array — the consumer owns that buffer).
   * Default: 50_000.
   */
  bufferCap?: number;

  /**
   * Initial value for the auto-scroll toggle.
   * Auto-scroll pins the viewport to the last line; disables on manual
   * upward scroll and re-enables when the user scrolls back to the bottom
   * or clicks the toggle.
   * Default: true.
   */
  defaultAutoScroll?: boolean;

  /**
   * Initial value for the line-wrap toggle.
   * When false, long lines overflow horizontally; the scroll container
   * gains a horizontal scrollbar.
   * Default: false (no wrap; trainer log lines are often long).
   */
  defaultWrap?: boolean;

  /**
   * Strip ANSI escape codes before rendering.
   * Default: true.
   */
  stripAnsi?: boolean;

  /**
   * Called when the auto-scroll state changes (user toggled or scroll
   * caused a state change). Optional — use when the consumer wants to
   * persist this preference (trainer-spa wires to UIPrefsStore).
   */
  onAutoScrollChange?: (enabled: boolean) => void;

  /**
   * Called when the line-wrap state changes.
   * Optional — use when the consumer wants to persist this preference.
   */
  onWrapChange?: (enabled: boolean) => void;

  /**
   * Forwarded to the LogViewer root element for Playwright targeting.
   * Trainer-spa testid: `training-log-panel`
   */
  'data-testid'?: string;

  className?: string;
}
```

---

## 4. Virtualization

Uses `@tanstack/react-virtual` (added alongside KanbanBoard; see
[Kanban board](../architecture/kanban-board.md)).

```ts
// internal
const rowVirtualizer = useVirtualizer({
  count: visibleLines.length,   // min(lines.length, bufferCap)
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 20,       // px; one log line at default font size
  overscan: 10,
});
```

Visible lines are a slice of the last `bufferCap` items from `props.lines`.
The viewer does not run a deep equality check. It rerenders whenever
`lines.length` changes, which is the typical pattern for append-only streams.

---

## 5. Auto-scroll behavior

```
lines.length increases
  → if autoScroll is ON:
      rowVirtualizer.scrollToIndex(visibleLines.length - 1, { align: 'end' })
  → if autoScroll is OFF:
      no scroll — user is reading earlier output

user scrolls up manually
  → autoScroll turns OFF (threshold: ≥ 1 line above the bottom)

user scrolls to the very bottom
  → autoScroll turns back ON automatically

auto-scroll toggle button
  → toggles current state; scrolls to bottom when turning ON
```

The viewer manages auto-scroll state internally with `useReducer`. The consumer
receives it through `onAutoScrollChange` only when it changes.

---

## 6. Toolbar

Built-in toolbar rendered above the scroll area:

```
[ ⟳ Auto-scroll ]   [ ⇔ Wrap ]   {N lines}
```

- "Auto-scroll" button: active state when ON; aria-pressed.
- "Wrap" button: active state when ON; aria-pressed.
- Line count: plain text, updated as lines grow.

Phase 1 does not export the toolbar separately or make it replaceable. A
consumer that needs a custom toolbar hides the built-in toolbar with CSS. It
then renders its own toolbar outside the component.

---

## 7. ANSI stripping

When `stripAnsi` is true, its default, the viewer strips ANSI CSI sequences
before rendering each line. A lightweight regular expression is sufficient:

```ts
// internal utility
function stripAnsiCodes(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
}
```

Phase 1 renders lines as plain text. Colored ANSI rendering would convert SGR
codes to `<span style="color:...">`. This enhancement is deferred and is not
blocked by this spec.

---

## 8. Styling

| Class | Element |
|---|---|
| `.log-viewer` | root container |
| `.log-viewer__toolbar` | built-in toolbar |
| `.log-viewer__toolbar-btn` | each toolbar button |
| `.log-viewer__toolbar-btn--active` | active state (pressed) |
| `.log-viewer__scroll` | virtualized scroll container |
| `.log-viewer__line` | each rendered line |
| `.log-viewer--wrap` | modifier on root when wrap is ON |

The viewer uses the `var(--font-mono)` design-system token for its monospace
font. Its background uses `var(--bg-surface-2)` to distinguish the log from
the surrounding UI.

---

## 9. Accessibility

- The scroll container has `role="log"` and `aria-label="Training output"`.
  Consumers may override `aria-label` via standard HTML attribute pass-through.
- Per the ARIA spec, `role="log"` implies `aria-live="polite"`. Screen readers
  announce newly appended content without interrupting. Content may append
  very rapidly, so the viewer adds `aria-atomic="false"`. This setting announces
  only new delta lines rather than the full buffer.
- The toolbar buttons have explicit `aria-label`s: "Toggle auto-scroll",
  "Toggle line wrap".

---

## 10. data-testid contract (trainer-spa)

| `data-testid` | Element |
|---|---|
| `training-log-panel` | `LogViewer` root (passed via prop by trainer-spa) |

Phase 1 has no built-in test IDs on internal elements. If the Playwright driver
needs to assert on line content, it reads within the `training-log-panel`
container.

---

## 11. Trainer-spa wiring pattern

```tsx
// RunDetailPage.tsx (trainer-spa — illustrative, not normative)
import { LogViewer } from '@pdomain/pdomain-ui/primitives';
import { useLongJob } from '@pdomain/pdomain-ui/shell';
import { useUIPrefsStore } from '../stores/ui-prefs.js';

export function RunDetailPage({ runId }: { runId: string }) {
  const { lines } = useLongJob(runId);
  const { logViewer, setLogViewer } = useUIPrefsStore();

  return (
    <LogViewer
      lines={lines}
      bufferCap={50_000}
      defaultAutoScroll={logViewer.autoScroll}
      defaultWrap={logViewer.wrap}
      onAutoScrollChange={(v) => setLogViewer({ autoScroll: v })}
      onWrapChange={(v) => setLogViewer({ wrap: v })}
      data-testid="training-log-panel"
    />
  );
}
```

The `useLongJob` hook owns SSE or polling. `LogViewer` receives only the
accumulated `lines` array.

The consumer manages the buffer above `bufferCap`. If the array grows larger
than `bufferCap`, the viewer renders only the last `bufferCap` items.

---

## 12. Decisions

- **D-L1** `LogViewer` is in the `/primitives` subpath. The reasoning matches
  kanban (D-K1): it is too small for its own subpath.
- **D-L2** The component does not depend on a specific data source. It takes
  `string[]`, not an event stream. This separates it from SSE, WebSocket, and
  polling implementations. It also makes the component testable without
  `useLongJob`.
- **D-L3** `bufferCap` is a render cap, not a data cap. The consumer owns
  the data buffer; the viewer only limits what it renders.
- **D-L4** ANSI color rendering is deferred. Plain ANSI stripping is
  sufficient for Phase 1. Adding SGR-to-span conversion later is a
  non-breaking addition.
- **D-L5** Phase 1 has no `onLineClick` or `onLineSelect`. Log lines are
  display-only. To copy individual lines, a consumer targets them within the
  `data-testid` container.

## Adversarial Review

**Review status:** Pending owner decision. Repository search and history show no
LogViewer implementation, export, story, test, or current consumer-demand
evidence. Therefore, the proposed virtualization, streaming, auto-scroll,
wrapping, ANSI, and accessibility contracts remain unvalidated draft intent.
They must not be treated as current behavior.
