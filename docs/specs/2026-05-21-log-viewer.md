---
kind: spec
status: draft
owner: CT
created: 2026-05-21
last_verified: 2026-07-13
---

# LogViewer — component-API spec

**Date:** 2026-05-21
**Status:** Spec — not yet implemented
**Subpath:** `@pdomain/pdomain-ui/primitives`
**Required by:** `pdomain-ocr-trainer-spa` RunDetailPage (live training-output log)
**Spec source:** `pdomain-ocr-trainer-spa/specs/03-frontend.md §6.3`

---

## 1. Purpose

A virtualized, streaming-text viewer that renders a growing list of log lines
efficiently. pdomain-ui owns the virtualization (`@tanstack/react-virtual`), the
auto-scroll toggle, and the line-wrap toggle. The consumer feeds it an array
of log lines and wires it to whatever data source it has (e.g. the
`useLongJob` hook's SSE events). The viewer is data-source-agnostic.

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

Uses `@tanstack/react-virtual` (added alongside KanbanBoard — see
`2026-05-21-kanban-board.md` §11).

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
No deep equality check — the viewer rerenders whenever `lines.length`
changes (the typical pattern for append-only streams).

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

The auto-scroll state is managed internally with `useReducer`; the consumer
receives it via `onAutoScrollChange` only when it changes.

---

## 6. Toolbar

Built-in toolbar rendered above the scroll area:

```
[ ⟳ Auto-scroll ]   [ ⇔ Wrap ]   {N lines}
```

- "Auto-scroll" button: active state when ON; aria-pressed.
- "Wrap" button: active state when ON; aria-pressed.
- Line count: plain text, updated as lines grow.

The toolbar is not separately exported or replaceable in Phase 1. If a
consumer needs a custom toolbar it hides the built-in via CSS and renders
its own outside the component.

---

## 7. ANSI stripping

When `stripAnsi` is true (default), the viewer strips ANSI CSI sequences
before rendering each line. A lightweight regex is sufficient:

```ts
// internal utility
function stripAnsiCodes(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
}
```

Phase 1 renders lines as plain text. Colored ANSI rendering (converting
SGR codes to `<span style="color:...">`) is a deferred enhancement and not
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

Monospace font via `var(--font-mono)` design-system token. Background from
`var(--bg-surface-2)` to visually distinguish the log from surrounding UI.

---

## 9. Accessibility

- The scroll container has `role="log"` and `aria-label="Training output"`.
  Consumers may override `aria-label` via standard HTML attribute pass-through.
- `role="log"` implies `aria-live="polite"` per ARIA spec — screen readers
  announce new appended content without interrupting. Because content may
  append very rapidly, the viewer adds `aria-atomic="false"` so only new
  delta lines are announced rather than the full buffer.
- The toolbar buttons have explicit `aria-label`s: "Toggle auto-scroll",
  "Toggle line wrap".

---

## 10. data-testid contract (trainer-spa)

| `data-testid` | Element |
|---|---|
| `training-log-panel` | `LogViewer` root (passed via prop by trainer-spa) |

No built-in testids on internal elements in Phase 1. If the Playwright
driver needs to assert on line content, it reads within the `training-log-panel`
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

The `useLongJob` hook owns SSE/polling; `LogViewer` only receives the
accumulated `lines` array. The consumer is responsible for buffer management
above `bufferCap` — if the array grows larger than `bufferCap`, the viewer
renders only the last `bufferCap` items.

---

## 12. Decisions

- **D-L1** `LogViewer` is in `/primitives` subpath. Same reasoning as kanban
  (D-K1): too small for its own subpath.
- **D-L2** The component is data-source-agnostic — it takes `string[]` not
  an event stream. This decouples it from SSE, WebSocket, or polling
  implementations and makes it testable without `useLongJob`.
- **D-L3** `bufferCap` is a render cap, not a data cap. The consumer owns
  the data buffer; the viewer only limits what it renders.
- **D-L4** ANSI color rendering is deferred. Plain ANSI stripping is
  sufficient for Phase 1; adding SGR-to-span conversion later is a
  non-breaking addition.
- **D-L5** No `onLineClick` / `onLineSelect` in Phase 1. Log lines are
  display-only. If a consumer needs to copy individual lines it targets
  within the `data-testid` container.
