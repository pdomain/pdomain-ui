---
kind: usage
status: draft
owner: CT
created: 2026-05-27
last_verified: 2026-07-13
references:
  - "pdomain-prep-for-pgdp@d5f1ce09e4059b319a6973a838493ffb6c7f8f56"
  - "pdomain-ocr-labeler-spa@85dc98971d14e56240d69ae4a833d5d70f2ca027"
---

# Consumer bootstrap pattern

## Agent Index

- **Kind:** usage
- **Status:** draft
- **Read when:** bootstrapping or migrating a consumer SPA.
- **Search terms:** consumer bootstrap, CSS imports, AppShell, UtilityDock jobs, providers.

These bootstrap contracts match pdomain-ui 0.11.x and React 18 or 19. Before
this draft becomes canonical across the suite, verify the router, query,
toaster, font, and consumer-adapter conventions in each current consumer
repository.

## Use this pattern for new or migrated SPAs

Use this pattern to create an SPA that consumes `@pdomain/pdomain-ui` or to
move an existing SPA to the canonical pattern. A correct bootstrap requires
`main.tsx`, `index.css`, and `App.tsx` to agree. Each file has load-order
constraints that fail silently when violated.

The pattern comes from the two mature consumers: `pdomain-prep-for-pgdp` and
`pdomain-ocr-labeler-spa`.

---

## Configure the three bootstrap files

### `main.tsx`

Put Fontsource imports before React and `./index.css`. Import Inter weights
400/500/600/700 and JetBrains Mono weights 400/500. labeler-spa omits Inter
600, while prep-for-pgdp includes it. Include it in new SPAs to avoid a flash
of unstyled text (FOUT) on medium-weight headings.

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

The provider order matters:

- `<Toaster>` is mounted here, outside `<App>`, so it survives route
  transitions. `<App>` must not also mount a `<Toaster>`.
- `<BrowserRouter>` wraps `<App>` inside `<QueryClientProvider>` so hooks
  like `useNavigate` work inside any query callback.
- `staleTime: 30_000` and `refetchOnWindowFocus: false` are the workspace
  standard QueryClient defaults.

In the labeler-spa variant, `<BrowserRouter>` moves into `App()`. That component
also mounts `<Toaster>` through a theme-aware wrapper called
`ThemedToaster`. The prep-for-pgdp layout above is simpler and preferred for
new SPAs.

---

### `index.css`

```css
/* src/index.css */

@import "./styles/tokens.css";
@import "@pdomain/pdomain-ui/theme/primitives.css";

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

Place `@import "./styles/tokens.css"` before the `@tailwind` directives. This
order lets Tailwind's just-in-time (JIT) scanner see the `--bg-page` and
`--ink-1` variables when it resolves the `bg-bg-page` and `text-ink-1` utility
classes.

Every app that renders pdomain-ui components must import
`@pdomain/pdomain-ui/theme/primitives.css`. JavaScript component imports do
not load the stylesheet.
Import `@pdomain/pdomain-ui/theme/reset.css` only when the app has no Tailwind
preflight or other reset. Tokens and primitive CSS are always required.

### Cross-app modules

`pdomain-ui` exports presentation-only modules for repeated suite patterns:

- `@pdomain/pdomain-ui/records`
- `@pdomain/pdomain-ui/source-intake`
- `@pdomain/pdomain-ui/viewport`
- `@pdomain/pdomain-ui/settings`
- `@pdomain/pdomain-ui/status`
- `@pdomain/pdomain-ui/workbench`

These modules render typed UI and call app callbacks. The app still owns data
loading, routing, jobs, OCR policy, source validation, and stage machines.

---

### `src/styles/tokens.css`

Each consumer SPA owns a small `src/styles/tokens.css`. It re-imports the
pdomain-ui token sheet and adds domain-specific extensions:

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

Do not re-declare a token that pdomain-ui already defines. The pdomain-ui token
set does not include the `--border` shorthand. Use `--border-1`, `--border-2`,
or `--border-3` instead, as described below.

---

### `App.tsx` — provider order and `AppShell` props

Use this provider stack from outermost to innermost:

```
<QueryClientProvider>        ← from main.tsx or App.tsx
  <BrowserRouter>            ← from main.tsx or App.tsx
    <SuiteSiblingsProvider>  ← supplies fetchInstalled / postLaunch
      <AppShell>             ← from @pdomain/pdomain-ui/shell
```

Minimal `AppShell` wiring uses its built-in header. Pass a custom `header` only
when the application needs a different header composition.

```tsx
import {
  AppShell,
  SuiteSiblingsProvider,
  type UIPrefsConfig,
  type InstalledApp,
  type LaunchResult,
} from "@pdomain/pdomain-ui/shell";

const UI_PREFS_CONFIG: UIPrefsConfig = {
  load: async () => {
    // Try /api/suite/prefs (pdomain-ops) first, then use hard-coded defaults.
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
      <div className="h-screen w-full">
        <AppShell
          appId="your-app-id"
          appDisplayName="Your App Name"
          appIconUrl="/static/icon.svg"
          launcherSlot="header"
          deployMode="local"
          uiPrefsConfig={UI_PREFS_CONFIG}
          jobs={{ activeJobs }}
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

This preferences example uses hard-coded defaults as its fallback, not
localStorage. Local persistence is a consumer-specific adapter choice. The
suite-wide fallback policy remains an unverified owner decision.

Source: `pdomain-prep-for-pgdp/frontend/src/App.tsx:287-379`.

Core `AppShell` props:

| Prop | Type | Notes |
|---|---|---|
| `appId` | `string` | Stable kebab-case ID used for prefs storage and suite registry |
| `appDisplayName` | `string` | Human-readable name shown in launcher |
| `appIconUrl` | `string` | URL of a 32 × 32 icon served by the app's static mount |
| `deployMode` | `"local" \| "hosted"` | Optional; defaults to `"local"` |
| `uiPrefsConfig` | `UIPrefsConfig` | Load + persist callbacks (see above) |
| `main` | `ReactNode` | Route table; use `flex flex-col h-full` on the root div |

AppShell adds `data-testid="app-shell"` to its root. A wrapper may still own
page sizing, but it does not need to provide that test ID.

---

## Install the required npm packages

```jsonc
// package.json — supported baseline for these APIs
{
  "dependencies": {
    "@pdomain/pdomain-ui": "^0.11.0",
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

Tailwind, PostCSS, and autoprefixer are required only when you use Tailwind
utility classes. Both current consumers use them. Include
`./src/**/*.{ts,tsx}` in the `tailwind.config.ts` `content` field. This lets
JIT detect `bg-bg-page`, `text-ink-1`, and similar classes.

---

## Jobs and the utility dock

Build app-owned job data from the application's API. Pass it to AppShell's
`jobs` object so UtilityDock can render the jobs surface.

Job data alone does not add a jobs trigger to the built-in header. Add a
trigger through `headerActions` or another component rendered inside AppShell.

```tsx
import { useQuery } from "@tanstack/react-query";
import { useUtilityDock, type Job } from "@pdomain/pdomain-ui/shell";

interface RawJob {
  id: string;
  project_id: string;
  type: string;
  status: Job["status"];
  progress?: { current: number; total: number; message: string };
}

function useActiveJobs(): Job[] {
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
  return jobs.map((j): Job => {
    const pct = j.progress?.total
      ? Math.round((j.progress.current / j.progress.total) * 100)
      : 0;
    return {
      id: j.id,
      project: j.project_id,
      phase: j.type,
      pct,
      status: j.status,
      cancelable: j.status === "queued" || j.status === "running" || j.status === "paused",
    };
  });
}

function JobsDockTrigger() {
  const dock = useUtilityDock();
  return (
    <button
      type="button"
      aria-expanded={dock.active === "jobs"}
      onClick={() => dock.toggle("jobs")}
    >
      Jobs
    </button>
  );
}
```

Source: `pdomain-prep-for-pgdp/frontend/src/App.tsx:229-267`.

```tsx
<AppShell
  {...shellProps}
  headerActions={<JobsDockTrigger />}
  jobs={{
    activeJobs,
    onJobOpen,
    onJobPauseResume,
    onJobCancel,
    onJobDelete,
    onViewAll,
  }}
/>
```

The built-in header has launcher and settings controls, but it has no automatic
jobs trigger. The example adds one through `headerActions`. A custom AppHeader
may instead render JobsPill. It can connect `onJobsClick` to
`useUtilityDock().toggle('jobs')`. Apps without background jobs may omit
`jobs` and the trigger.

The `useLongJob` store from `@pdomain/pdomain-ui/stores` tracks one long-running
foreground job and its UI state, including a progress bar and cancel button.
Use it for page-level operations while the user waits. Use `useActiveJobs` for
the header pill that reflects background work.

---

## Avoid patterns that bypass shared UI contracts

**Vendor fonts in `public/fonts/`.**
Inter and JetBrains Mono must come from `@fontsource/inter` and
`@fontsource/jetbrains-mono`. Vendored font files bypass the weight-subset
rules and drift from the pdomain-ui token stacks `--ui-font` and `--mono-font`.
The fontsource packages are already in every pdomain-* SPA lock file.

**Hand-roll buttons, tables, or chrome that exist as primitives.**
`@pdomain/pdomain-ui/primitives` exports `Button`, `Badge`, `Input`, `Toggle`,
`Separator`, `Tabs`, and others. `@pdomain/pdomain-ui/shell` exports `AppShell`,
`AppHeader`, `JobsPill`. Check those surfaces before writing local copies.
pdomain-ui also ships the `jobs-table__*` CSS class family for job-state colors
and row styles.

**Reference non-canonical CSS tokens.**
The canonical border tokens are `--border-1`, `--border-2`, and `--border-3`.
The pdomain-ui token set does not include the `--pd-border` shorthand or bare
`--border`. At runtime, they resolve to `initial` and render invisible borders.
See `pdomain-ui/src/theme/tokens.css` for the full canonical token list.

**Use inline `<a href="file://...">` for local path display.**
Display local file paths in UIs with a Copy button and
`navigator.clipboard.writeText()`. An `href="file://..."` is a dead link in
every browser except Firefox with a user-set preference. It also triggers a
security warning on Chromium.

**Mount inline toast `<div>` elements.**
Send all transient notifications through sonner with `import { toast } from
"sonner"`. Mount `<Toaster>` once in `main.tsx`; never add a second one. Do not
show temporary error or success state in local `<div>` banners. Use
`toast.error()` or `toast.success()` instead.

**Import directly from `lucide-react` outside `src/icons/`.**
pdomain-ui re-exports a curated icon set from `@pdomain/pdomain-ui/icons`.
Direct `lucide-react` imports in consumer SPAs bypass the icon abstraction.
They make it impossible to swap the icon library. ESLint enforces this in
pdomain-ui itself. Consumer SPAs should add the same `no-restricted-imports`
rule.

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
- [ ] `@pdomain/pdomain-ui/theme/primitives.css` is imported
- [ ] `@pdomain/pdomain-ui/theme/reset.css` is imported only without Tailwind preflight or another reset
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
- [ ] `deployMode` is omitted for the `"local"` default or set explicitly when hosted
- [ ] `uiPrefsConfig` has both `load` (tries `/api/suite/prefs`, then hard-coded defaults) and `persistCommon` callbacks
- [ ] Any localStorage persistence is an explicit consumer adapter choice; suite-wide policy remains unverified and needs owner agreement
- [ ] Built-in AppShell header is used unless a custom header is intentionally required
- [ ] `main` slot root div has `className="flex flex-col h-full overflow-hidden"`
- [ ] AppShell's built-in `data-testid="app-shell"` is used for shell targeting

### Imports

- [ ] No direct `lucide-react` imports in SPA code — use `@pdomain/pdomain-ui/icons`
- [ ] `AppShell`, `SuiteSiblingsProvider`, and `UIPrefsConfig` imported from `@pdomain/pdomain-ui/shell`
- [ ] Button / Badge / Input / Toggle imported from `@pdomain/pdomain-ui/primitives`, not re-implemented locally

### Jobs

- [ ] `useActiveJobs()` hook polls `/api/jobs?status=running&status=queued` at 5 s interval
- [ ] Job data and callbacks wired through `AppShell jobs={{...}}`
- [ ] A jobs trigger rendered inside AppShell calls `useUtilityDock().toggle('jobs')`
- [ ] `useLongJob` from `@pdomain/pdomain-ui/stores` used for foreground waits, not the header pill
