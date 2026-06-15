---
status: draft
last-verified: 2026-05-27
references:
  - "pdomain-prep-for-pgdp@d5f1ce09e4059b319a6973a838493ffb6c7f8f56"
  - "pdomain-ocr-labeler-spa@85dc98971d14e56240d69ae4a833d5d70f2ca027"
---

# Consumer bootstrap pattern

## When to read this doc

Read this when standing up a new SPA that will consume `@pdomain/pdomain-ui`,
or when porting an existing SPA to the canonical pattern. The three files that
must agree for a correctly bootstrapped SPA are `main.tsx`, `index.css`, and
`App.tsx` — each has load-order constraints that break silently if violated.
This doc describes the agreed pattern from the two mature consumers:
`pdomain-prep-for-pgdp` and `pdomain-ocr-labeler-spa`.

---

## The bootstrap pattern

### `main.tsx`

Fontsource imports come first, before React and before `./index.css`. The
weight subsets to import are: Inter 400/500/600/700 and JetBrains Mono 400/500.
(labeler-spa omits Inter 600; prep-for-pgdp includes it — include it for new
SPAs to avoid FOUT on medium-weight headings.)

```tsx
// main.tsx — canonical bootstrap order

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

Source: `pdomain-prep-for-pgdp/frontend/src/main.tsx:1-33`.

Key points:

- `<Toaster>` is mounted here, outside `<App>`, so it survives route
  transitions. `<App>` must not also mount a `<Toaster>`.
- `<BrowserRouter>` wraps `<App>` inside `<QueryClientProvider>` so hooks
  like `useNavigate` work inside any query callback.
- `staleTime: 30_000` and `refetchOnWindowFocus: false` are the workspace
  standard QueryClient defaults.

labeler-spa variant: labeler-spa moves `<BrowserRouter>` into `App()` and
mounts `<Toaster>` inside that component with a theme-aware wrapper
(`ThemedToaster`). The prep-for-pgdp layout above is simpler and preferred
for new SPAs.

---

### `index.css`

```css
/* src/index.css */

@import "./styles/tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
#root {
  height: 100%;
}

@layer base {
  body {
    font-family: theme("fontFamily.sans");
    @apply bg-bg-page text-ink-1;
  }
}
```

Source: `pdomain-prep-for-pgdp/frontend/src/index.css:1-18`.

The `@import "./styles/tokens.css"` line must come before the `@tailwind`
directives so Tailwind's JIT scanner can see the `--bg-page` / `--ink-1`
vars when resolving `bg-bg-page` / `text-ink-1` utility classes.

labeler-spa variant: labeler-spa also imports `./styles/primitives.css` on
line 12 alongside `./styles/tokens.css`. That extra import is a transitional
artifact from the shadcn-ui migration; new SPAs do not need it — primitives
from pdomain-ui are imported by component code via the `@pdomain/pdomain-ui/primitives`
subpath export.

### Cross-app modules

`pdomain-ui` exports presentation-only modules for repeated suite patterns:

- `@pdomain/pdomain-ui/records`
- `@pdomain/pdomain-ui/source-intake`
- `@pdomain/pdomain-ui/viewport`
- `@pdomain/pdomain-ui/settings`
- `@pdomain/pdomain-ui/status`
- `@pdomain/pdomain-ui/workbench`

These modules render typed UI and call app callbacks. Apps still own data
loading, routing, jobs, OCR policy, source validation, and stage machines.

---

### `src/styles/tokens.css`

Each consumer SPA owns a thin `src/styles/tokens.css` that re-imports the
pdomain-ui token sheet and appends domain-specific extensions:

```css
/* src/styles/tokens.css */

/* Base design tokens — imported from pdomain-ui canonical token set.
 * Provides: --bg-page, --bg-surface, --bg-raised, --bg-sunk,
 *           --border-1/2/3, --ink-1/2/3/4,
 *           --accent, --accent-ink,
 *           --ui-font, --mono-font, --shadow-floating, --overlay-scrim
 *
 * Theme convention: :root = dark (warm charcoal), [data-theme="light"] = light.
 */
@import "@pdomain/pdomain-ui/theme/tokens.css";

/* App-specific extensions — only what pdomain-ui does not cover. */
:root {
  /* example: --brand: #d97706; */
}

[data-theme="light"] {
  /* example: --brand: #b45309; */
}
```

Source: `pdomain-prep-for-pgdp/frontend/src/styles/tokens.css:14` and
`pdomain-ocr-labeler-spa/frontend/src/styles/tokens.css:14`.

Do not re-declare any token that pdomain-ui already defines. The `--border`
shorthand does not exist in the pdomain-ui token set; use `--border-1`,
`--border-2`, or `--border-3` (see anti-patterns below).

---

### `App.tsx` — provider order and `AppShell` props

The canonical provider stack, from outermost to innermost:

```
<QueryClientProvider>        ← from main.tsx or App.tsx
  <BrowserRouter>            ← from main.tsx or App.tsx
    <SuiteSiblingsProvider>  ← supplies fetchInstalled / postLaunch
      <AppShell>             ← from @pdomain/pdomain-ui/shell
```

Minimal `AppShell` wiring:

```tsx
import {
  AppShell,
  AppHeader,
  SuiteSiblingsProvider,
  type UIPrefsConfig,
  type InstalledApp,
  type LaunchResult,
  type ActiveJob,
} from "@pdomain/pdomain-ui/shell";

const UI_PREFS_CONFIG: UIPrefsConfig = {
  load: async () => {
    // Try /api/suite/prefs (pdomain-ops) first, fall back to localStorage.
    try {
      const res = await fetch("/api/suite/prefs");
      if (res.ok) {
        const body = (await res.json()) as {
          common?: { theme?: string; density?: string; font_scale?: number };
        };
        const common = body.common ?? {};
        const rawTheme = common.theme;
        const theme: "dark" | "light" =
          rawTheme === "dark" || rawTheme === "light" ? rawTheme : "light";
        return { theme, density: "normal", fontScale: common.font_scale ?? 1.0 };
      }
    } catch { /* fall through */ }
    return { theme: "light", density: "normal", fontScale: 1.0 };
  },
  persistCommon: async (prefs) => {
    try {
      await fetch("/api/suite/prefs/common", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: prefs.theme,
          density: prefs.density,
          font_scale: prefs.fontScale,
        }),
      });
    } catch { /* ignore */ }
  },
  persistApp: async (_appPrefs) => {
    // Write to /api/suite/prefs/apps/<your-app-id> when pdomain-ops is available.
  },
};

async function fetchInstalled(): Promise<InstalledApp[]> {
  try {
    const res = await fetch("/api/suite/installed");
    if (!res.ok) return [];
    return (await res.json()) as InstalledApp[];
  } catch {
    return [];
  }
}

async function postLaunch(id: string): Promise<LaunchResult> {
  try {
    const res = await fetch(
      `/api/suite/launch?app_id=${encodeURIComponent(id)}`,
      { method: "POST" },
    );
    if (!res.ok) return { kind: "requires-host-config", siblingId: id };
    return (await res.json()) as LaunchResult;
  } catch {
    return { kind: "requires-host-config", siblingId: id };
  }
}

export default function App() {
  const activeJobs = useActiveJobs();

  return (
    <SuiteSiblingsProvider value={{ fetchInstalled, postLaunch }}>
      <div data-testid="app-shell" className="h-screen w-full">
        <AppShell
          appId="your-app-id"
          appDisplayName="Your App Name"
          appIconUrl="/static/icon.svg"
          launcherSlot="header"
          deployMode="local"
          uiPrefsConfig={UI_PREFS_CONFIG}
          header={
            <AppHeader
              appName="Your App"
              searchPlaceholder="Search…"
              activeJobs={activeJobs}
              onSearchClick={() => { /* open search modal */ }}
            />
          }
          main={
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  {/* … */}
                </Routes>
              </div>
            </div>
          }
        />
      </div>
    </SuiteSiblingsProvider>
  );
}
```

Source: `pdomain-prep-for-pgdp/frontend/src/App.tsx:287-379`.

Required `AppShell` props:

| Prop | Type | Notes |
|---|---|---|
| `appId` | `string` | Stable kebab-case ID used for prefs storage and suite registry |
| `appDisplayName` | `string` | Human-readable name shown in launcher |
| `appIconUrl` | `string` | URL of a 32 × 32 icon served by the app's static mount |
| `deployMode` | `"local" \| "hosted"` | Phase 1 apps always use `"local"` |
| `uiPrefsConfig` | `UIPrefsConfig` | Load + persist callbacks (see above) |
| `header` | `ReactNode` | Typically `<AppHeader>` with `activeJobs` |
| `main` | `ReactNode` | Route table; use `flex flex-col h-full` on the root div |

The `data-testid="app-shell"` wrapper div is a contract for Playwright selectors.
pdomain-ui's `AppShell` does not inject this testid itself; the consuming SPA
always wraps it.

---

## Required npm packages

```jsonc
// package.json — minimum versions (as of 2026-05-27)
{
  "dependencies": {
    "@pdomain/pdomain-ui": "^0.2.2",
    "@fontsource/inter": "^5.2.8",
    "@fontsource/jetbrains-mono": "^5.2.8",
    "@tanstack/react-query": "^5.59.0",
    "react-router-dom": "^6.x",
    "sonner": "^2.0.7"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.14",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

Source: `pdomain-prep-for-pgdp/frontend/package.json`.

Tailwind, PostCSS, and autoprefixer are only required if you are using Tailwind
utility classes. All two current consumers do. The `tailwind.config.ts` must
include `./src/**/*.{ts,tsx}` in `content` so JIT picks up `bg-bg-page`,
`text-ink-1`, etc.

---

## `activeJobs` query

`AppHeader` accepts an `activeJobs: ActiveJob[]` prop that drives the built-in
`JobsPill` indicator. Wire it by polling your app's jobs API:

```tsx
import { useQuery } from "@tanstack/react-query";
import type { ActiveJob } from "@pdomain/pdomain-ui/shell";

interface RawJob {
  id: string;
  project_id: string;
  type: string;
  status: string;
  progress: { current: number; total: number; message: string };
}

function useActiveJobs(): ActiveJob[] {
  const result = useQuery({
    queryKey: ["active-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs?status=running&status=queued");
      if (!res.ok) return [] as RawJob[];
      return (await res.json()) as RawJob[];
    },
    refetchInterval: 5_000,
    throwOnError: false,
  });
  const jobs = result.data ?? [];
  return jobs.map((j) => ({
    id: j.id,
    title: j.type,
    phase: j.status,
    pct:
      j.progress.total > 0
        ? Math.round((j.progress.current / j.progress.total) * 100)
        : 0,
    project: j.project_id,
  }));
}
```

Source: `pdomain-prep-for-pgdp/frontend/src/App.tsx:229-267`.

If the app has no background-job concept, pass `activeJobs={[]}` — the pill
is hidden when the array is empty.

`useLongJob` store (from `@pdomain/pdomain-ui/stores`) tracks a single
foreground long-running job with UI state (progress bar, cancel button). Use
it for page-level operations where the user is waiting; use `useActiveJobs`
for the header pill which reflects background work.

---

## What NOT to do

**Vendor fonts in `public/fonts/`.**
Inter and JetBrains Mono must come from `@fontsource/inter` and
`@fontsource/jetbrains-mono`. Vendored font files bypass the weight-subset
discipline and drift from the pdomain-ui token `--ui-font` / `--mono-font`
stacks. The fontsource packages are already in the lock file of every pdomain-* SPA.

**Hand-roll buttons, tables, or chrome that exist as primitives.**
`@pdomain/pdomain-ui/primitives` exports `Button`, `Badge`, `Input`, `Toggle`,
`Separator`, `Tabs`, and others. `@pdomain/pdomain-ui/shell` exports `AppShell`,
`AppHeader`, `JobsPill`. Check those surfaces before writing local copies.
The `jobs-table__*` CSS class family (job state colours + row styles) is
also shipped in pdomain-ui.

**Reference non-canonical CSS tokens.**
The canonical border token is `--border-1` / `--border-2` / `--border-3`. The
shorthand `--pd-border` and bare `--border` do not exist in the pdomain-ui
token set and will resolve to `initial` at runtime, rendering invisible borders.
See `pdomain-ui/src/theme/tokens.css` for the full canonical token list.

**Use inline `<a href="file://...">` for local path display.**
Local file paths in UIs should use a Copy button + `navigator.clipboard.writeText()`
pattern. An `href="file://..."` renders as a dead link in every browser except
Firefox with a user-set pref, and triggers a security warning on Chromium.

**Mount inline toast `<div>` elements.**
All transient notifications must go through sonner (`import { toast } from
"sonner"`). The `<Toaster>` is mounted once in `main.tsx`; never add a second
one. Do not render error/success state as local `<div>` banners that appear
and disappear — use `toast.error()` / `toast.success()` instead.

**Import directly from `lucide-react` outside `src/icons/`.**
pdomain-ui re-exports a curated icon set from `@pdomain/pdomain-ui/icons`.
Direct `lucide-react` imports in consumer SPAs bypass the icon abstraction and
make it impossible to swap the icon library. ESLint in pdomain-ui itself
enforces this; consumer SPAs should add the same `no-restricted-imports` rule.

---

## Bootstrap checklist

Use this when wiring a new SPA or auditing an existing one.

### Fonts

- [ ] `@fontsource/inter` and `@fontsource/jetbrains-mono` in `package.json`
- [ ] Inter imported at weights 400/500/600/700 in `main.tsx` (before React)
- [ ] JetBrains Mono imported at weights 400/500 in `main.tsx` (before React)
- [ ] No fonts vendored in `public/fonts/`

### CSS

- [ ] `src/styles/tokens.css` exists and starts with `@import "@pdomain/pdomain-ui/theme/tokens.css"`
- [ ] `index.css` imports `./styles/tokens.css` before `@tailwind` directives
- [ ] `index.css` sets `height: 100%` on `html`, `body`, and `#root`
- [ ] `body` rule uses `var(--bg-page)` / `var(--ink-1)` (or Tailwind `bg-bg-page text-ink-1`)
- [ ] No hex color literals in component code (use `var(--token)` form only)
- [ ] No `--pd-border` or bare `--border` references (use `--border-1/2/3`)

### Providers

- [ ] `QueryClient` created once with `staleTime: 30_000, refetchOnWindowFocus: false`
- [ ] `<QueryClientProvider>` wraps the entire tree
- [ ] `<BrowserRouter>` is present (either in `main.tsx` or at `App` root)
- [ ] `<SuiteSiblingsProvider value={{ fetchInstalled, postLaunch }}>` wraps `<AppShell>`
- [ ] `<Toaster position="bottom-right" richColors>` mounted exactly once

### `AppShell`

- [ ] `appId` is a stable kebab-case identifier matching the pdomain-ops registry entry
- [ ] `deployMode="local"` for Phase 1 / local-only SPAs
- [ ] `uiPrefsConfig` has both `load` (tries `/api/suite/prefs`, falls back to localStorage) and `persistCommon` (tries `/api/suite/prefs/common`) callbacks
- [ ] `header` slot receives `<AppHeader activeJobs={...} ...>`
- [ ] `main` slot root div has `className="flex flex-col h-full overflow-hidden"`
- [ ] Outer `<div data-testid="app-shell" className="h-screen w-full">` wraps `<AppShell>`

### Imports

- [ ] No direct `lucide-react` imports in SPA code — use `@pdomain/pdomain-ui/icons`
- [ ] `AppShell`, `AppHeader`, `SuiteSiblingsProvider`, `UIPrefsConfig` imported from `@pdomain/pdomain-ui/shell`
- [ ] Button / Badge / Input / Toggle imported from `@pdomain/pdomain-ui/primitives`, not re-implemented locally

### Jobs

- [ ] `useActiveJobs()` hook polls `/api/jobs?status=running&status=queued` at 5 s interval
- [ ] `activeJobs` wired to `<AppHeader activeJobs={...}>`
- [ ] `useLongJob` from `@pdomain/pdomain-ui/stores` used for foreground waits, not the header pill
